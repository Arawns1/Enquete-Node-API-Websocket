test("GET to / should return 200", async () => {
  const response = await fetch("http://localhost:3333/");
  expect(response.status).toBe(200);

  const responseBody = await response.json();
  expect(responseBody).toEqual({ message: "Hello, world!" });
});

test("POST to /polls should return 201", async () => {
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

  expect(response.status).toBe(201);
  expect(response.headers.get("Location")).toBeTruthy();

  const responseBody = await response.json();
  expect(responseBody).toEqual({ poll_id: expect.any(String) });
});
