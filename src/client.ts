import {Client as DiscordClient} from "discord.js";

export class Client extends DiscordClient {
	private static readonly SERVER_ID = "831282439757234186";

	/**
	 * Gets OAuth keys from the database, refreshes if needed or throws if they do not exist
	 * @param snowflake The id of the user
	 */
	async getOAuthKeys(snowflake: string): Promise<void> {
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
