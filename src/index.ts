import "dotenv/config";

import fastify from "fastify";
import {blue, green} from "colorette";
import {Client} from "./client";
import * as path from "path";
import fastifyStatic from "fastify-static";
import {object, string} from "zod";
import fetch from "node-fetch";
import {User} from "discord.js";
import {prisma} from "./prisma";

const cwd = process.cwd();
const app = fastify();

const scope = ["guilds.join", "identify"].join(" ");

const schema = object({
	code: string().nonempty(),
});

app.register(fastifyStatic, {root: path.join(cwd, "public")});

app.setErrorHandler((error, req, res) => {
	console.log(error);
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

	const a = await fetch("https://discord.com/api/oauth2/token", {
		headers: {"Content-Type": "application/x-www-form-urlencoded"},
		method: "POST",
		body,
	}).then((res) => res.json());

	const {access_token = null, refresh_token = null} = a;

	if (!access_token || !refresh_token) {
		throw new Error("No access token found");
	}

	const me: User | {unauthorized: true} = await fetch("https://discord.com/api/users/@me", {
		headers: {Authorization: `Bearer ${access_token}`},
	}).then((res) => res.json());

	if (!("id" in me)) {
		throw new Error("What");
	}

	await prisma.user.upsert({
		where: {snowflake: me.id},
		update: {access_token, refresh_token},
		create: {access_token, refresh_token, snowflake: me.id},
	});

	await client.invite(me.id);

	res.sendFile("success.html");
});

const client = new Client();

client.login(process.env.DISCORD_TOKEN).then(() => {
	console.log(`${green("discord")} ready`);
});

app.listen(process.env.PORT || 8080).then(() => {
	console.log(`${blue("http")} ready`);
});
