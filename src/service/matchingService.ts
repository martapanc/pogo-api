import {PrismaClient, Region} from "@prisma/client";

const prisma = new PrismaClient();

export function getRegionFromName(regionName: string) {
    return prisma.region.findFirst({
        where: {
            name: regionName
        }
    });
}

export function getPlayersFromRegion(region: Region) {
    return prisma.player.findMany({
        where: {
            regionId: region.id
        }
    });
}
