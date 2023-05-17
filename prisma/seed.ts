import {Player, Prisma, PrismaClient, Region} from '@prisma/client'
import regions from '../prisma/data/regions.json';
import {faker} from '@faker-js/faker';

const prisma = new PrismaClient()

const regionData: Prisma.RegionCreateInput[] = regions;

function getPlayerPromise(player: {
    nickname: string;
    location: string;
    region: { connect: { id: number } };
    trainerCode: string
}, regions: Region[]) {
    return prisma.player.create({data: player}).then((createdPlayer) => {

        const shuffledRegions = regions.map(r => r.id).sort(() => 0.5 - Math.random());
        const hpRegions = shuffledRegions.slice(0, 5);
        const lpRegions = shuffledRegions.slice(5);

        const hpRegionPromises = hpRegions.map(async (id) => {
            return prisma.playerHighPrioRegions.create({
                data: {
                    player: {connect: {id: createdPlayer.id}},
                    region: {connect: {id: id}},
                },
            });
        });

        const lpRegionPromises = lpRegions.map(async (id) => {
            return prisma.playerLowPrioRegions.create({
                data: {
                    player: {connect: {id: createdPlayer.id}},
                    region: {connect: {id: id}},
                },
            });
        });

        return Promise.all([Promise.all(hpRegionPromises), Promise.all(lpRegionPromises)]).then(([regions1, regions2]) => {
            console.log(`Added Player ${createdPlayer.nickname} [${createdPlayer.trainerCode}] of Region ${createdPlayer.regionId}`);
            console.log(`*  High Prio regions: ${regions1.map((r) => r.regionId)}`);
            console.log(`*  Low Prio regions: ${regions2.map((r) => r.regionId)}`);
        });
    });
}

async function main() {
    console.log(`Start seeding ...`)

    const regionPromises = regionData.map(async (r) => {
        const region = await prisma.region.create({data: r});

        console.log(`Added Region '${region.displayName}' (${region.code}) with id: ${region.id}`);

        return region;
    });

    Promise.all(regionPromises)
        .then((regions) => {
            console.log(`Created ${regions.length} regions\n---`);

            const players = 40;
            const playerPromises = [];

            for (let i = 0; i < players; i++) {
                const player = {
                    nickname: faker.internet.userName(),
                    trainerCode: faker.number.bigInt({min: 100000000000, max: 999999999999}).toString(),
                    location: faker.location.country(),
                    region: {
                        connect: {
                            id: faker.number.int({min: 1, max: 18})
                        }
                    }
                };

                const playerPromise = getPlayerPromise(player, regions);
                playerPromises.push(playerPromise);
            }

            const me = {
                nickname: 'PancakeMarta',
                trainerCode: '123456789101',
                location: 'Italy',
                region: {
                    connect: {
                        id: 9
                    }
                }
            }
            playerPromises.push(getPlayerPromise(me, regions));

            Promise.all(playerPromises)
                .then(() => {
                    console.log(`Seeding finished.`);
                })
                .catch((err) => {
                    console.error(`Error creating players: ${err}`);
                });
        })
        .catch((err) => {
            console.error(`Error creating regions: ${err}`);
        });
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    });
