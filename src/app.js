import { Hono } from "hono";

const createApp = () => {
  const app = new Hono();

  app.post("/start", (ctx) => {
    const authHeader = ctx.req.header("Authorization");

    if (!authHeader) {
      return ctx.json({ message: "Authorization missing" }, 400);
    }

    Deno.writeTextFileSync("./resources/auth.txt", authHeader);

    return ctx.json({ message: "Authenticated successfully" });
  });

  return app;
};

export { createApp };
