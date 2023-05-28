import {Player, Prisma, PrismaClient, Region} from "@prisma/client";

const prisma = new PrismaClient();

export function fetchPlayersFromRegion(region: Region) {
    return prisma.player.findMany({
        where: {
            regionId: region.id
        }
    });
}

export function fetchAllPlayers(search: any, orderBy: any) {
    const or: Prisma.PlayerWhereInput = search ?
        {
            OR: [
                {nickname: {contains: search as string}},
                {location: {contains: search as string}},
            ],
        } : {};

    return prisma.player.findMany({
        where: {
            ...or
        },
        orderBy: {
            id: orderBy as Prisma.SortOrder || 'asc'
        }
    });
}

export function fetchPlayer(id: number) {
    return prisma.player.findUnique({
        where: {
            id: id
        }
    });
}

export function fetchPlayersWithWantedHighPrioRegion(region: Region) {
    return prisma.player.findMany({
        where: {
            wantedHighPrio: {
                some: {
                    regionId: {
                        in: [region.id]
                    }
                }
            }
        },
        orderBy: {
            id: 'asc'
        }
    });
}

export function fetchPlayersWithWantedLowPrioRegion(region: Region) {
    return prisma.player.findMany({
        where: {
            wantedLowPrio: {
                some: {
                    regionId: {
                        in: [region.id]
                    }
                }
            }
        },
        orderBy: {
            id: 'asc'
        }
    });
}

export function fetchPlayersFromRegionWithWantedHighPrioRegion(from: Region, wanted: Region) {
    return prisma.player.findMany({
        where: {
            wantedHighPrio: {
                some: {
                    regionId: {
                        in: [wanted.id]
                    }
                }
            },
            regionId: from.id
        },
        orderBy: {
            id: 'asc'
        }
    });
}

export function fetchPlayersFromRegionWithWantedLowPrioRegion(from: Region, wanted: Region) {
    return prisma.player.findMany({
        where: {
            wantedLowPrio: {
                some: {
                    regionId: {
                        in: [wanted.id]
                    }
                }
            },
            regionId: from.id
        },
        orderBy: {
            id: 'asc'
        }
    });
}

export async function createNewPlayer(newPlayer: Player) {
    try {
        return prisma.player.create({
            data: newPlayer
        })
    } catch (error) {
        console.error('Prisma error creating Player: ', error);
        throw error;
    }
}

export async function setPlayerWantedRegions(playerId: number, highPrioRegions: number[], lowPrioRegions: number[]) {
    try {
        await resetPlayerWantedRegions(playerId, 'playerHighPrioRegions');
        await resetPlayerWantedRegions(playerId, 'playerLowPrioRegions');

        highPrioRegions.map(async (id) => {
            return prisma.playerHighPrioRegions.create({
                data: {
                    player: {
                        connect: {
                            id: playerId
                        }
                    },
                    region: {
                        connect: {
                            id
                        }
                    }
                }
            })
        });
        lowPrioRegions.map(async (id) => {
            return prisma.playerLowPrioRegions.create({
                data: {
                    player: {
                        connect: {
                            id: playerId
                        }
                    },
                    region: {
                        connect: {
                            id
                        }
                    }
                }
            })
        });
    } catch (error) {
        console.error("Prisma error setting up Player's wanted regions: ", error);
        throw error;
    }
}

async function resetPlayerWantedRegions(playerId: number, prio: 'playerHighPrioRegions' | 'playerLowPrioRegions') {
    try {
        return prisma[prio].deleteMany({
            where: {
                playerId
            }
        });
    } catch (error) {
        console.error("Prisma error resetting Player's wanted regions: ", error);
        throw error;
    }
}
