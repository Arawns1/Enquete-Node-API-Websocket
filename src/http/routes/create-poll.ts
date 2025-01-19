import { FastifyInstance } from "fastify";
import { prisma } from "src/lib/prisma";
import z from "zod";

export async function createPoll(app: FastifyInstance) {
  app.post("/polls", async (request, response) => {
    const createPollBody = z.object({
      title: z.string(),
      options: z.array(z.string()),
    });

    const { title, options } = createPollBody.parse(request.body);

    const createdPoll = await prisma.poll.create({
      data: {
        title,
        options: {
          createMany: {
            data: options.map((option) => ({ title: option })),
          },
        },
      },
    });

    const responsePayload = { poll_id: createdPoll.id };
    return response
      .status(201)
      .header("Location", `/polls/${createdPoll.id}`)
      .send(responsePayload);
  });
}
