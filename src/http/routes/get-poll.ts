import { FastifyInstance } from "fastify";
import { prisma } from "src/lib/prisma";
import z from "zod";

export async function getPoll(app: FastifyInstance) {
  app.get("/polls/:pollId", async (request, response) => {
    const getPollParams = z.object({
      pollId: z.string().uuid(),
    });

    const { pollId } = getPollParams.parse(request.params);

    const foundPoll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          select: { id: true, title: true },
        },
      },
    });

    return response.send({ poll: foundPoll });
  });
}
