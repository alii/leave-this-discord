import fastify from "fastify";
import {blue, green} from "colorette";
import {Client} from "./client";
import * as path from "path";
import fastifyStatic from "fastify-static";
import {object, string} from "zod";
import fetch from "node-fetch";
import {User} from "discord.js";

const cwd = process.cwd();
const app = fastify();

const scope = ["guilds.join"].join(" ");

const schema = object({
	code: string().nonempty(),
});

app.register(fastifyStatic, {root: path.join(cwd, "public")});

app.setErrorHandler((error, req, res) => {
	res.sendFile("error.html");
});

app.get("/callback", async (req, res) => {
	const {code} = schema.parse(req.query);

	const body = new URLSearchParams({
		client_id: process.env.CLIENT_ID!,
		client_secret: process.env.CLIENT_SECRET!,
		grant_type: "authorization_code",
		redirect_uri: "http://localhost:8080/callback",
		code,
		scope,
	}).toString();

	const {access_token = null, refresh_token = null} = await fetch(
		"https://discord.com/api/oauth2/token",
		{
			headers: {"Content-Type": "application/x-www-form-urlencoded"},
			method: "POST",
			body,
		}
	).then((res) => res.json());

	if (!access_token || !refresh_token) {
		throw new Error("Lol!");
	}

	const me: User | {unauthorized: true} = await fetch("https://discord.com/api/users/@me", {
		headers: {Authorization: `Bearer ${access_token}`},
	}).then((res) => res.json());

	if (!("id" in me)) {
		throw new Error("p");
	}

	await client.invite(me.id);

	res.sendFile("done.html");
});

const client = new Client();

client.login(process.env.DISCORD_TOKEN).then(() => {
	console.log(`${green("discord")} ready`);
});

app.listen(process.env.PORT || 8080).then(() => {
	console.log(`${blue("http")} ready`);
});
