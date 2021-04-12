import {Client as DiscordClient} from "discord.js";
import fetch from "node-fetch";

export class Client extends DiscordClient {
	private static readonly SERVER_ID = "831282439757234186";

	constructor() {
		super();

		this.on("message", (message) => {
			if (message.content !== "join") return;

			const url =
				"https://discord.com/api/oauth2/authorize?client_id=831281784359616552&redirect_uri=http%3A%2F%2Flocalhost%3A8080&response_type=code&scope=guilds.join%20identify";

			return message.reply(url);
		});
	}

	/**
	 * Gets OAuth keys from the database, refreshes if needed or throws if they do not exist
	 * @param snowflake The id of the user
	 */
	async getOAuthKeys(snowflake: string): Promise<string> {
		//
	}

	/**
	 * Invite a user to the server
	 * @param snowflake The id of the user
	 */
	async invite(snowflake: string): Promise<void> {
		const access_token = await this.getOAuthKeys(snowflake);

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

		const body = await request.json();

		console.log(body);
	}
}
