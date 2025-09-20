import { createApp } from "./src/app.js";
import GitHub from "./src/github.js";
import "https://deno.land/x/dotenv/load.ts";

const main = () => {
  const token = Deno.env.get("GIT_TOKEN");

  const appContext = { gitHub: new GitHub(token) };

  Deno.serve(createApp(appContext).fetch);
};

main();
