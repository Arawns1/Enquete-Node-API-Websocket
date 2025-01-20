import { FastifyInstance } from "fastify";
import { voting } from "src/utils/voting-pub-sub";
import z from "zod";

export async function pollResult(app: FastifyInstance) {
  app.get("/polls/:pollId/results", { websocket: true }, (socket, request) => {
    const getPollParams = z.object({
      pollId: z.string().uuid(),
    });

    const { pollId } = getPollParams.parse(request.params);

    voting.subscribe(pollId, (message) => {
      socket.send(JSON.stringify(message));
    });
    // socket.on("message", (message: string) => {
    //   socket.send("you said:" + message.toString());
    // });
    // Inscrever apenas nas mensagens publicadas no canal com o ID da enquete ('pollId')
  });
}
