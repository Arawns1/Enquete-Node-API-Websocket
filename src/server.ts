import fastify from 'fastify'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const app = fastify();
const prisma = new PrismaClient()

app.post("/polls", async (request, response) => {

    // Modelo
    const createPollBody = z.object({
        title: z.string()
    })

    // Valida
    const { title } = createPollBody.parse(request.body)

    // Cria
    const createdPoll = await prisma.poll.create({
        data: {
            title
        }
    })

    //Retorna
    const responsePayload = { poll_id: createdPoll.id}
    return response.status(201).header('Location', `/polls/${createdPoll.id}`).send(responsePayload)
})


app.listen({port: 3333}).then(() => {
    console.log("HTTP server running!")
}) 


