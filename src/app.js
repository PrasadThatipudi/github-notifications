import { Hono } from "hono";

const greatest = (...values) => {
  return values.reduce((max, value) => {
    const numValue = Number(value);

    return numValue > max ? numValue : max;
  }, -Infinity);
};

const serveNotifications = async (ctx) => {
  const gitHub = ctx.get("gitHub");

  if (!gitHub.token)
    return ctx.json({ message: "Unauthorized: No token provided" }, 401);

  const followers = await gitHub.fetchFollowers();
  const allNewRepos = { lastEventId: gitHub.lastEventId, newRepositories: [] };

  for (const follower of followers) {
    const username = follower.login;
    try {
      const newRepos = await gitHub.retrieveNewReposOfUser(username);
      if (newRepos.length === 0) continue;

      const lastEventId = greatest(allNewRepos.lastEventId, newRepos[0]?.id);

      const { newRepositories } = allNewRepos;
      allNewRepos.newRepositories = [...newRepositories, ...newRepos];
      allNewRepos.lastEventId = lastEventId;
    } catch (error) {
      if (error.cause === "wait-time") {
        const message = `Rate limit exceeded for ${username}, retrying later...`;
        return ctx.json({ message }, 429);
      }

      console.error(`Error fetching events for ${username}:`, error);
    }
  }

  const { newRepositories, lastEventId } = allNewRepos;
  gitHub.updateLastEventId(lastEventId);

  return ctx.json({ newRepositories });
};

const saveAuthorizationKey = (ctx) => {
  const authHeader = ctx.req.header("Authorization");

  if (!authHeader) return ctx.json({ message: "Authorization missing" }, 400);

  const [tokenType, token] = authHeader.split(" ");

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
  app.get("/notifications", serveNotifications);

  return app;
};

export { createApp };
