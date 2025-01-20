import { FastifyInstance } from "fastify";
import { prisma } from "src/lib/prisma";
import { redis } from "src/lib/redis";
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

    if (!foundPoll) {
      return response.status(404).send({ message: "Poll not found" });
    }

    const result = await redis.zrange(pollId, 0, -1, "WITHSCORES");

    const votes = result.reduce(
      (obj, line, index) => {
        if (index % 2 === 0) {
          const score = result[index + 1];
          Object.assign(obj, { [line]: Number(score) });
        }

        return obj;
      },
      {} as Record<string, number>,
    );

    return response.send({
      poll: {
        id: foundPoll.id,
        title: foundPoll.title,
        options: foundPoll.options.map((option) => ({
          id: option.id,
          title: option.title,
          score: option.id in votes ? votes[option.id] : 0,
        })),
      },
    });
  });
}
