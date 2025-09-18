import { Hono } from "hono";

const saveAuthorizationKey = (ctx) => {
  const authHeader = ctx.req.header("Authorization");

  if (!authHeader) return ctx.json({ message: "Authorization missing" }, 400);

  const [tokenType, token] = authHeader.split(" ")[1];

  if (tokenType !== "Bearer" || !token)
    return ctx.json({ message: "Invalid Authorization format" }, 400);

  const gitHub = ctx.get("gitHub");
  gitHub.registerToken(token);

  return ctx.json({ message: "Authenticated successfully" });
};

const setAppContext = (appContext) => (ctx, next) => {
  ctx.set("gitHub", appContext.gitHub);

  return next();
};

const createApp = (appContext) => {
  const app = new Hono();

  app.use(setAppContext(appContext));
  app.post("/start", saveAuthorizationKey);

  return app;
};

export { createApp };
