import {Prisma, PrismaClient} from "@prisma/client";
import express from "express";
import {PlayerFetchingError} from "../models/PlayerFetchingError";
import {PlayerFetchResult} from "../models/PlayerFetchResult";

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


router.get('/players/looking-for-region/:name', async (req, res) => {
    const regionName = req.params.name.toLowerCase();
    const region = await prisma.region.findFirst({
        where: {
            name: regionName
        }
    })

    if (!region) {
        res.status(400).json({error: `Region '${regionName}' could not be found.`})
    } else {
        const highPrioPlayers = prisma.player.findMany({
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
        const lowPrioPlayers = prisma.player.findMany({
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

        Promise.all([highPrioPlayers, lowPrioPlayers]).then(([highPrioPlayers, lowPrioPlayers]) => {
            res.json({
                highPrioPlayers,
                lowPrioPlayers
            } as PlayerFetchResult);
        }).catch((err) => {
           res.status(404).json({error: `Error finding matching players: ${err}`} as PlayerFetchingError);
        })
    }
})

export default router;
