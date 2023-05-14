import express from "express";
import {Prisma, PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

const router = express.Router();

router.get('/regions', async (req, res) => {
    const {search, skip, take, orderBy} = req.query

    const or: Prisma.RegionWhereInput = search
        ? {
            OR: [
                {name: {contains: search as string}},
                {code: {contains: search as string}},
            ],
        }
        : {};

    const regions = await prisma.region.findMany({
        where: {
            ...or
        },
        take: Number(take) || undefined,
        skip: Number(skip) || undefined,
        orderBy: {
            name: orderBy as Prisma.SortOrder,
        },
    });

    res.json(regions);
});

router.get('/regions/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const region = await prisma.region.findUnique({
            where: {
                id: id
            }
        })
        res.status(404).json(region ? region : {error: `Region with id ${id} not found.`});

    } catch (error) {
        res.status(400).json({error: `Error parsing id: '${req.params.id}'`});
    }
});

export default router;
