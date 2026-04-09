import express from 'express'
import { PrismaClient } from '../generated/prisma/index.js'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from '../swagger.json' with { type: 'json' }

const port = 3000
const app = express()
const prisma = new PrismaClient()


app.use(express.json())

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)) 

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
    // vericar no banco se ja existe um filme com o mesmo titulo, se sim, retornar erro
    try {
        const movieWithSameTitle = await prisma.movie.findFirst({
            where: {
                title: { equals: title, mode: 'insensitive' },
            },
        })

        if (movieWithSameTitle) {
            return res
                .status(409)
                .json({ error: 'Movie with same title already exists' })
        }

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

app.put('/movies/:id', async (req, res) => {
    const id = Number(req.params.id)
    const data = req.body
    data.release_date = data.release_date
        ? new Date(data.release_date)
        : undefined
    try {
        const movieExists = await prisma.movie.findUnique({
            where: { id },
        })

        if (!movieExists) {
            return res.status(404).json({ error: 'Movie not found' })
        }

        const movie = await prisma.movie.update({
            where: { id },
            data,
        })
        console.log('Updated movie:', movie)
    } catch (error) {
        console.error('Error updating movie:', error)
        return res.status(500).json({ error: 'Failed to update movie' })
    }

    res.status(200).send(`Movie with id ${req.body.title} updated successfully`)
})

app.delete('/movies/:id', async (req, res) => {
    const id = Number(req.params.id)
    try {
        const movieExists = await prisma.movie.findUnique({
            where: { id },
        })
        if (!movieExists) {
            return res.status(404).json({ error: 'Movie not found' })
        }
        await prisma.movie.delete({
            where: { id },
        })
    } catch (error) {
        console.error('Error deleting movie:', error)
        return res.status(500).json({ error: 'Failed to delete movie' })
    }
    res.status(200).send(`Movie with id ${req.params.id} deleted successfully`)
})

app.get('/movies/:genreName', async (req, res) => {
    try {
        const genreName = req.params.genreName
        const moviesFilteredByGenre = await prisma.movie.findMany({
            include: {
                genre: true,
                language: true,
            },
            where: {
                genre: {
                    name: { equals: genreName, mode: 'insensitive' },
                },
            },
        })

        if (moviesFilteredByGenre.length === 0) {
            return res.status(404).json({ error: 'No movies found for this genre' })
        }

        res.status(200).send(moviesFilteredByGenre)
    } catch (error) {
        console.error('Error fetching movies by genre:', error)
        res.status(500).json({ error: 'Failed to fetch movies by genre' })
    }
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/docs`)
})
