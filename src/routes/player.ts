import {Prisma, PrismaClient} from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();

const router = express.Router();

router.get('/players', async (req, res) => {
    const {search, orderBy} = req.query

    const or: Prisma.PlayerWhereInput = search
        ? {
            OR: [
                {nickname: {contains: search as string}},
                {location: {contains: search as string}},
            ],
        }
        : {};

    const players = await prisma.player.findMany({
        where: {
            ...or
        },
        orderBy: {
            id: orderBy as Prisma.SortOrder || 'asc'
        }
    });

    res.json(players.sort(p => p.id));
});

router.get('/players/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const player = await prisma.player.findUnique({
            where: {
                id: id
            }
        });

        res.status(404).json(player ? player : {error: `Player with id ${id} not found.`});

    } catch (error) {
        res.status(400).json({error: `Error parsing id: '${req.params.id}'`});
    }
});

export default router;