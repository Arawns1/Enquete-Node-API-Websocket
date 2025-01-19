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

  const responseBody = (await response.json()) as {
    poll_id: string;
  };

  return {
    pollId: responseBody.poll_id,
  };
}

async function getById(id: string) {
  const rawResponse = await fetch(`http://localhost:3333/polls/${id}`);
  const response = await rawResponse.json();
  return response as {
    poll: {
      id: string;
      options: [
        {
          id: string;
          title: string;
        },
      ];
    };
  };
}

test("POST to /polls/:pollId/votes should return 200", async () => {
  const { pollId } = await createPoll();
  const { poll } = await getById(pollId);

  const response = await fetch(`http://localhost:3333/polls/${pollId}/votes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ poll_option_id: poll.options[0].id }),
  });

  expect(response.status).toBe(200);

  const cookies = response.headers.get("Set-Cookie");
  expect(cookies).toContain("session_id");
});

test("POST to /polls/:pollId/votes should return 409", async () => {
  const { pollId } = await createPoll();
  const { poll } = await getById(pollId);

  const firstResponse = await fetch(
    `http://localhost:3333/polls/${pollId}/votes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ poll_option_id: poll.options[0].id }),
    },
  );

  expect(firstResponse.status).toBe(200);

  const cookies = firstResponse.headers.get("Set-Cookie");
  expect(cookies).toBeTruthy();
  const sessionId = cookies?.match(/session_id=([^.;]+)/)?.[1];
  expect(sessionId).toBeTruthy();

  if (!cookies) {
    throw new Error("Cookie não encontrado na resposta");
  }

  const secondResponse = await fetch(
    `http://localhost:3333/polls/${pollId}/votes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `session_id=${sessionId}`,
      },
      body: JSON.stringify({ poll_option_id: poll.options[0].id }),
    },
  );
  expect(secondResponse.status).toBe(409);

  const responseBody = await secondResponse.json();

  expect(responseBody).toEqual({ message: "You already voted on this poll" });
});
