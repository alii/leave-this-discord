import fastify from "fastify";
import { blue } from "colorette";

const app = fastify();

app.listen(process.env.PORT).then(() => {
  console.log(`${blue("http")} ready`);
});
