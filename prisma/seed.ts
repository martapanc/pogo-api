import {Player, Prisma, PrismaClient, Region} from '@prisma/client'
import regions from '../prisma/data/regions.json';
import {faker} from '@faker-js/faker';

const prisma = new PrismaClient()

const regionData: Prisma.RegionCreateInput[] = regions;

async function main() {
    console.log(`Start seeding ...`)

    for (const r of regionData) {
        const region = await prisma.region.create({
            data: r,
        })
        console.log(`Added Region '${region.name}' (${region.code}) with id: ${region.id}`)
    }

    generateRandomPlayers();

    console.log(`Seeding finished.`)
}

function generateRandomPlayers() {
    const players: number = 10;

    const regionsPromise = prisma.region.findMany();

    regionsPromise
        .then((regions) => {

            for (let i = 0; i < players; i++) {
                const player = {
                    nickname: faker.internet.userName(),
                    trainerCode: faker.number.bigInt({min: 100000000000, max: 999999999999}).toString(),
                    location: faker.location.country(),
                    region: {
                        connect: {
                            id: faker.number.int({min: 1, max: regions.length})
                        }
                    },
                    wantedHighPrio: {
                        connect: [{id: 1}, {id: 2}]
                    },
                    wantedLowPrio: {
                        connect: [{id: 13}, {id: 16}, {id: 18}]
                    }
                }

                prisma.player.create({
                    data: player
                }).then((player: Player) => {
                    console.log(`Added Player ${player.nickname} [${player.trainerCode}] of Region ${player.regionId}`)
                })
            }

        })
        .catch((error) => {
            // Handle any errors here
            console.error(error);
        });


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
