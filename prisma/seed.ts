import {Player, Prisma, PrismaClient, Region} from '@prisma/client'
import regions from '../prisma/data/regions.json';
import {faker} from '@faker-js/faker';

const prisma = new PrismaClient()

const regionData: Prisma.RegionCreateInput[] = regions;

async function main() {
    console.log(`Start seeding ...`)

    const regionPromises = regionData.map(async (r) => {
        const region = await prisma.region.create({data: r});
        console.log(`Added Region '${region.name}' (${region.code}) with id: ${region.id}`);
        return region;
    });

    Promise.all(regionPromises)
        .then((regions) => {
            console.log(`Created ${regions.length} regions\n---`);

            const players: number = 12;

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
                }

                const playerPromise = prisma.player.create({
                    data: player
                }).then((player: Player) => {
                    const hpRegions = [1, 4, 17];
                    const lpRegions = [5, 11];

                    const hpRegionPromises = hpRegions.map(async (id) => {
                        return prisma.playerHighPrioRegions.create({
                            data: {
                                player: {connect: {id: player.id}},
                                region: {connect: {id: id}},
                            },
                        });
                    });

                    const lpRegionPromises = lpRegions.map(async (id) => {
                        return prisma.playerLowPrioRegions.create({
                            data: {
                                player: {connect: {id: player.id}},
                                region: {connect: {id: id}},
                            },
                        });
                    });

                    Promise.all([Promise.all(hpRegionPromises), Promise.all(lpRegionPromises)]).then(
                        ([regions1, regions2]) => {
                            console.log(`Added Player ${player.nickname} [${player.trainerCode}] of Region ${player}`)
                            console.log(`*  High Prio regions: ${regions1.map((r) => r.regionId)}`)
                            console.log(`*  Low Prio regions: ${regions2.map((r) => r.regionId)}`)
                        }
                    )
                });

                playerPromises.push(playerPromise);
            }

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
        })
}

function randomRegion(regions: Region[]): Region {
    const index = Math.floor(Math.random() * regions.length);
    return regions[index]
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
