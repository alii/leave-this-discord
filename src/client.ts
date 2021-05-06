import {Client as DiscordClient} from "discord.js";
import fetch from "node-fetch";
import {prisma} from "./prisma";
import {
	client_id,
	client_secret,
	discord_token,
	oauth_url,
	OAuthData,
	redirect_uri,
	server_id,
} from "./types";
import dayjs = require("dayjs");

export class Client extends DiscordClient {
	private static readonly SERVER_ID = server_id;

	constructor() {
		super();

		this.on("message", async message => {
			if (message.content !== "join") return;
			await message.author.send(`<${oauth_url}>`);
			await message.delete();
		});

		this.on("guildMemberRemove", async member => {
			await this.invite(member.id);
		});
	}

	async refreshToken(snowflake: string, refresh_token: string) {
		const body = new URLSearchParams({
			client_id,
			client_secret,
			grant_type: "refresh_token",
			redirect_uri,
			refresh_token,
		}).toString();

		const req = await fetch("https://discord.com/api/oauth2/token", {
			headers: {"Content-Type": "application/x-www-form-urlencoded"},
			method: "POST",
			body,
		}).then(res => res.json());

		const json = (await req.json()) as OAuthData;

		await prisma.user.update({
			where: {snowflake},
			data: {
				access_token: json.access_token,
				refresh_token: json.refresh_token,
				expires: dayjs().add(json.expires_in, "seconds").toDate(),
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
			return null;
		}

		if (dayjs().isAfter(user.expires)) {
			const refreshed = await this.refreshToken(snowflake, user.refresh_token);
			return refreshed.access_token;
		}

		return user.access_token;
	}

	/**
	 * Invite a user to the server
	 * @param snowflake The id of the user
	 */
	async invite(snowflake: string): Promise<void> {
		const access_token = await this.getOAuthKeys(snowflake);

		if (!access_token) {
			const user = this.users.cache.get(snowflake);

			if (user) {
				await user.send("For some reason, we could not add you back... o well").catch(() => null);
			}

			return;
		}

		const endpoint = `/guilds/${Client.SERVER_ID}/members/${snowflake}`;
		const url = `https://discord.com/api/v8${endpoint}`;

		await fetch(url, {
			headers: {
				"Authorization": `Bot ${discord_token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({access_token}),
			method: "PUT",
		});
	}
}
