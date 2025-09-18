import { createApp } from "./src/app.js";
import GitHub from "./src/github.js";

const main = () => {
  const appContext = { gitHub: new GitHub() };

  Deno.serve(createApp(appContext).fetch);
};

main();
