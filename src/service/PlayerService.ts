import {Prisma, PrismaClient, Region} from "@prisma/client";

const prisma = new PrismaClient();

export function getPlayersFromRegion(region: Region) {
    return prisma.player.findMany({
        where: {
            regionId: region.id
        }
    });
}

export function getAllPlayers(search: any, orderBy: any) {
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

export function getPlayer(id: number) {
    return prisma.player.findUnique({
        where: {
            id: id
        }
    });
}

export function getPlayersWithWantedHighPrioRegion(region: Region) {
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

export function getPlayersWithWantedLowPrioRegion(region: Region) {
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

export function getPlayersFromRegionWithWantedHighPrioRegion(from: Region, wanted: Region) {
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

export function getPlayersFromRegionWithWantedLowPrioRegion(from: Region, wanted: Region) {
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
