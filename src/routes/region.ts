import express from "express";
import {Prisma, PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

const router = express.Router();

router.get('/regions', async (req, res) => {
    const {search, skip, take} = req.query

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
            name: 'asc',
        },
    });

    res.json(regions);
});

router.get('/regions/:id', async (req, res) => {
    const regionId = parseInt(req.params.id);

    if (!isNaN(regionId)) {
        const region = await prisma.region.findUnique({
            where: {
                id: regionId
            }
        })
        if (region) {
            res.json(region);
        } else {
            res.status(404).json({error: `Region with id ${regionId} not found.`});
        }
    } else {
        res.status(400).json({error: `Error parsing id: '${req.params.id}'`});
    }
});

export default router;
