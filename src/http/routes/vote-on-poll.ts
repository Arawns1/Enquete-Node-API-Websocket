import { FastifyInstance } from "fastify";
import { prisma } from "src/lib/prisma";
import z from "zod";
import { randomUUID } from "node:crypto";
import { redis } from "src/lib/redis";
import { voting } from "src/utils/voting-pub-sub";

export async function voteOnPoll(app: FastifyInstance) {
  app.post("/polls/:pollId/votes", async (request, response) => {
    const voteOnPollBody = z.object({
      poll_option_id: z.string().uuid(),
    });

    const voteOnPollParams = z.object({
      pollId: z.string().uuid(),
    });

    const { pollId } = voteOnPollParams.parse(request.params);
    const { poll_option_id: pollOptionId } = voteOnPollBody.parse(request.body);

    let sessionId = request.cookies.session_id;

    if (sessionId) {
      const userPreviousVoteOnPoll = await prisma.vote.findUnique({
        where: {
          sessionId_pollId: {
            sessionId,
            pollId,
          },
        },
      });

      if (
        userPreviousVoteOnPoll &&
        userPreviousVoteOnPoll.pollOptionId !== pollOptionId
      ) {
        await prisma.vote.delete({
          where: {
            id: userPreviousVoteOnPoll.id,
          },
        });

        const votes = await redis.zincrby(
          pollId,
          -1,
          userPreviousVoteOnPoll.pollOptionId,
        );

        voting.publish(pollId, {
          pollOptionId: userPreviousVoteOnPoll.pollOptionId,
          votes: Number(votes),
        });
      } else if (userPreviousVoteOnPoll) {
        return response.status(409).send({
          message: "You already voted on this poll",
        });
      }
    }

    if (!sessionId) {
      sessionId = randomUUID();

      response.setCookie("session_id", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        signed: true,
        httpOnly: true,
      });
    }

    await prisma.vote.create({
      data: {
        sessionId,
        pollId,
        pollOptionId,
      },
    });

    const votes = await redis.zincrby(pollId, 1, pollOptionId);

    voting.publish(pollId, {
      pollOptionId,
      votes: Number(votes),
    });

    return response.status(200).send();
  });
}
