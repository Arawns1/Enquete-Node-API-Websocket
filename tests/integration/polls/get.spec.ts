import { randomUUID } from "node:crypto";

async function createPoll() {
  const payloadBody = {
    title: "Test Title",
    options: ["Opção 1", "Opção 2", "Opção 3"],
  };

  const response = await fetch("http://localhost:3333/polls", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payloadBody),
  });

  const responseBody = (await response.json()) as { poll_id: string };

  return {
    pollId: responseBody.poll_id,
  };
}

test("GET to /polls/:pollId should return 200", async () => {
  const { pollId } = await createPoll();

  const response = await fetch(`http://localhost:3333/polls/${pollId}`);
  expect(response.status).toBe(200);

  const responseBody = await response.json();
  expect(responseBody).toEqual({ poll: expect.any(Object) });
  expect(responseBody).toHaveProperty("poll.options");
});

test("GET to /polls/:pollId should return 404", async () => {
  const pollId = randomUUID();

  const response = await fetch(`http://localhost:3333/polls/${pollId}`);
  expect(response.status).toBe(404);

  const responseBody = await response.json();
  expect(responseBody).toEqual({ message: "Poll not found" });
});
