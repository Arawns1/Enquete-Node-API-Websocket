import fastify from "fastify";
import { createPoll, getPoll, voteOnPoll } from "./routes";
import cookie from "@fastify/cookie";
import websocket from "@fastify/websocket";
import { pollResult } from "./ws/poll-results";

const app = fastify();

app.register(cookie, {
  secret: process.env.COOKIE_SECRET,
  hook: "onRequest",
  parseOptions: {},
});
app.register(websocket);

app.register(createPoll);
app.register(getPoll);
app.register(voteOnPoll);

app.register(pollResult);

app.get("/", (request, response) => {
  return response.status(200).send({ message: "Hello, world!" });
});

app.listen({ port: 3333 }).then(() => {
  console.log("HTTP server running!");
});
