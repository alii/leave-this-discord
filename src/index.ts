import "dotenv/config";

import * as path from "path";
import fastify from "fastify";
import {blue, green, yellow} from "colorette";
import {Client} from "./client";
import fastifyStatic from "fastify-static";
import fetch from "node-fetch";
import {User} from "discord.js";
import {prisma} from "./prisma";
import {
	client_id,
	client_secret,
	discord_token,
	oauth_url,
	OAuthData,
	port,
	redirect_uri,
	schema,
	scope,
} from "./types";
import dayjs = require("dayjs");

const cwd = process.cwd();
const app = fastify();

app.register(fastifyStatic, {root: path.join(cwd, "public")});

app.setErrorHandler((error, req, res) => {
	console.log(error);
	res.sendFile("error.html");
});

app.get("/", async (req, res) => {
	await res.redirect(oauth_url);
});

app.get("/callback", async (req, res) => {
	const {code} = schema.parse(req.query);

	const body = new URLSearchParams({
		code,
		scope,
		client_id,
		redirect_uri,
		client_secret,
		grant_type: "authorization_code",
	}).toString();

	const data = await fetch("https://discord.com/api/oauth2/token", {
		headers: {"Content-Type": "application/x-www-form-urlencoded"},
		method: "POST",
		body,
	}).then(res => res.json() as Promise<OAuthData>);

	const {access_token = null, refresh_token = null, expires_in = null} = data;

	if (!access_token || !refresh_token || !expires_in) {
		throw new Error("No access token found");
	}

	const me: User | {unauthorized: true} = await fetch("https://discord.com/api/users/@me", {
		headers: {Authorization: `Bearer ${access_token}`},
	}).then(res => res.json());

	if (!("id" in me)) {
		throw new Error("That didn't go to plan!");
	}

	const expires = dayjs().add(expires_in, "seconds").toDate();

	await prisma.user.upsert({
		where: {snowflake: me.id},
		update: {
			access_token,
			refresh_token,
			expires,
		},
		create: {
			access_token,
			refresh_token,
			snowflake: me.id,
			expires,
		},
	});

	await client.invite(me.id);

	res.sendFile("success.html");
});

const client = new Client();

client
	.login(discord_token)
	.then(() => console.log(`${green("discord")} ready`))
	.then(() => prisma.$connect())
	.then(() => console.log(`${yellow("db")} ready`))
	.then(() => app.listen(port))
	.then(() => console.log(`${blue("http")} ready`));
