import {Client as DiscordClient} from "discord.js";
import {green} from "colorette";

export class Client extends DiscordClient {
	private static readonly SERVER_ID = "831282439757234186";

	constructor() {
		super();

		void this.login(process.env.DISCORD_TOKEN).then(() => {
			console.log(`${green("discord")} ready`);
		});
	}

	/**
	 * Gets OAuth keys from the database, refreshes if needed or throws if they do not exist
	 * @param snowflake The id of the user
	 */
	async getOAuthKeys(snowflake: string) {
		//
	}

	/**
	 * Invite a user to the server
	 * @param snowflake The id of the user
	 */
	async invite(snowflake: string): Promise<void> {
		//
	}
}
