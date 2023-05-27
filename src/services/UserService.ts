import {Prisma, PrismaClient} from "@prisma/client";
import {UserData} from "../models/UserData";

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

export async function saveUser(userData: UserData) {
    try {
        return prisma.user.create({
            data: {
                uuid: userData.uid
            }
        });
    } catch (error) {
        console.error('Prisma error saving a new User: ', error);
        throw error;
    }
}

export async function deleteUser(userData: UserData) {
    try {
        return prisma.user.delete({
            where: {
                uuid: userData.uid
            }
        });
    } catch (error) {
        console.error('Prisma error deleting User: ', error);
        throw error;
    }
}

export function getUserFromPlayer(playerId: number) {
    return prisma.user.findUnique({
        where: {
            playerId
        }
    })
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
