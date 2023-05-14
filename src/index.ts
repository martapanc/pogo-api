import {Prisma, PrismaClient} from '@prisma/client'
import express from 'express'

const prisma = new PrismaClient()
const app = express()

app.use(express.json())

app.get('/region', async (req, res) => {
    const {search, skip, take, orderBy} = req.query

    const or: Prisma.RegionWhereInput = search
        ? {
            OR: [
                {name: {contains: search as string}},
                {code: {contains: search as string}},
            ],
        }
        : {}

    const regions = await prisma.region.findMany({
        where: {
            ...or
        },
        take: Number(take) || undefined,
        skip: Number(skip) || undefined,
        orderBy: {
            name: orderBy as Prisma.SortOrder,
        },
    })

    res.json(regions)
})

app.listen(3000, () =>
    console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`),
)
