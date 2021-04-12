import fastify from "fastify";
import {blue, green} from "colorette";
import {Client} from "./client";

const app = fastify();

const client = new Client();

client.login(process.env.DISCORD_TOKEN).then(() => {
	console.log(`${green("discord")} ready`);
});

app.listen(process.env.PORT || 8080).then(() => {
	console.log(`${blue("http")} ready`);
});
