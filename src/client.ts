import {Client as DiscordClient} from "discord.js";
import fetch from "node-fetch";
import {prisma} from "./prisma";

export class Client extends DiscordClient {
	private static readonly SERVER_ID = "831282439757234186";

	constructor() {
		super();

		this.on("message", (message) => {
			if (message.content !== "join") return;

			const url =
				"https://discord.com/api/oauth2/authorize?client_id=831281784359616552&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fcallback&response_type=code&scope=guilds.join%20identify";

			return message.reply(url);
		});

		this.on("guildMemberRemove", async (member) => {
			await this.invite(member.id);
		});
	}

	async refreshToken(snowflake: string, refresh_token: string) {
		const body = new URLSearchParams({
			client_id: process.env.CLIENT_ID!,
			client_secret: process.env.CLIENT_SECRET!,
			grant_type: "refresh_token",
			redirect_uri: "http://localhost:8080/callback",
			refresh_token,
		}).toString();

		const req = await fetch("https://discord.com/api/oauth2/token", {
			headers: {"Content-Type": "application/x-www-form-urlencoded"},
			method: "POST",
			body,
		}).then((res) => res.json());

		const json = await req.json();

		await prisma.user.update({
			where: {snowflake},
			data: {
				access_token: json.access_token,
				refresh_token: json.refresh_token,
			},
		});

		return json;
	}

	/**
	 * Gets OAuth keys from the database, refreshes if needed or throws if they do not exist
	 * @param snowflake The id of the user
	 */
	async getOAuthKeys(snowflake: string): Promise<string | null> {
		const user = await prisma.user.findFirst({
			where: {snowflake},
		});

		if (!user) {
			throw new Error("You must OAuth first!");
		}

		// TODO: This should revalidate if tokens are expired

		return user.access_token;
	}

	/**
	 * Invite a user to the server
	 * @param snowflake The id of the user
	 */
	async invite(snowflake: string): Promise<void> {
		const access_token = await this.getOAuthKeys(snowflake);

		if (!access_token) {
			return;
		}

		const endpoint = `/guilds/${Client.SERVER_ID}/members/${snowflake}`;
		const url = `https://discord.com/api/v8${endpoint}`;

		const request = await fetch(url, {
			headers: {
				"Authorization": `Bot ${process.env.DISCORD_TOKEN}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({access_token}),
			method: "PUT",
		});

		console.log(await request.json());
	}
}
