import { createApp } from "./src/app.js";

const main = () => {
  Deno.serve(createApp().fetch);
};
main();
