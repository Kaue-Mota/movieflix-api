import express from 'express'
import { PrismaClient } from '../generated/prisma/index.js'
import { title } from 'node:process'

const port = 3000
const app = express()
const prisma = new PrismaClient()

app.get('/movies', async (_, res) => {
    const movies = await prisma.movie.findMany({
        orderBy: {
            title: 'asc',
        },
        include: {
            genre: true,
            language: true,
        },
    })
    res.json(movies)
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})
