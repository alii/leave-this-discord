import fastify from "fastify";
import {blue} from "colorette";

const app = fastify();

app.listen(process.env.PORT || 8080).then(() => {
	console.log(`${blue("http")} ready`);
});
