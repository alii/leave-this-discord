import {object, string} from "zod";

export interface OAuthData {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
}

export const port = parseInt(process.env.PORT || "8080");
export const scope = ["guilds.join", "identify"].join(" ");
export const schema = object({code: string().nonempty()});
export const redirect_uri = process.env.REDIRECT_URI || `http://localhost:${port}/callback`;
export const client_id = process.env.CLIENT_ID!;
export const client_secret = process.env.CLIENT_SECRET!;
export const discord_token = process.env.DISCORD_TOKEN!;
export const server_id = process.env.SERVER_ID || "831282439757234186";

const query = new URLSearchParams({
	client_id,
	redirect_uri,
	scope,
	response_type: "code",
}).toString();

export const oauth_url = `https://discord.com/api/oauth2/authorize?${query}`;
