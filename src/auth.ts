import { Env } from './config';

export function getAuthHeaders(env: Env): HeadersInit {
    return {
        "Authorization": `Bearer ${env.DIRECTUS_API_TOKEN}`,
        "CF-Access-Client-Id": env.CLOUDFLARE_ACCESS_CLIENT_ID,
        "CF-Access-Client-Secret": env.CLOUDFLARE_ACCESS_CLIENT_SECRET,
        "Content-Type": "application/json"
    };
}
