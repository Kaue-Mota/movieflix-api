import express from 'express'
import { PrismaClient } from '../generated/prisma/index.js'

const port = 3000
const app = express()
const prisma = new PrismaClient()

app.use(express.json())

app.get('/movies', async (req, res) => {
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

app.post('/movies', async (req, res) => {
    const { title, language_id, genre_id, oscar_count, release_date } = req.body

    try {
    await prisma.movie.create({
        data: {
            title,
            language_id,
            genre_id,
            oscar_count,
            release_date: new Date(release_date),
        },
    })
    } catch (error) {
        console.error('Error creating movie:', error)
        return res.status(500).json({ error: 'Failed to create movie' })
    }
    res.status(201).send()
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})
