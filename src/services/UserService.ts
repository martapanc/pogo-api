import {Prisma, PrismaClient, Region} from "@prisma/client";

const prisma = new PrismaClient();
export function getAllUsers(orderBy: any) {
    return prisma.user.findMany({
        orderBy: {
            id: orderBy as Prisma.SortOrder || 'asc'
        }
    });
}

export function getUserById(id: number) {
    return prisma.user.findUnique({
        where: {
            id: id
        }
    });
}

export function getUserByUuid(uuid: string) {
    return prisma.user.findUnique({
        where: {
            uuid: uuid
        }
    });
}

export function matchUserWithPlayer(uuid: string, playerId: number) {
    return prisma.user.update({
        where: {
            uuid: uuid
        },
        data: {
            playerId: playerId
        }
    })
}
