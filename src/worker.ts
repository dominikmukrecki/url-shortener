import { Router } from 'itty-router';

const router = Router();

interface Env {
    DIRECTUS_API_LINKS_ENDPOINT: string;
    DIRECTUS_API_LINK_ENTRIES_ENDPOINT: string;
    DIRECTUS_API_TOKEN: string;
    CLOUDFLARE_ACCESS_CLIENT_ID: string;
    CLOUDFLARE_ACCESS_CLIENT_SECRET: string;
    FALLBACK_PROXY_URL: string; // Added this to the Env interface
}

function getAuthHeaders(env: Env): HeadersInit {
    return {
        "Authorization": `Bearer ${env.DIRECTUS_API_TOKEN}`,
        "CF-Access-Client-Id": env.CLOUDFLARE_ACCESS_CLIENT_ID,
        "CF-Access-Client-Secret": env.CLOUDFLARE_ACCESS_CLIENT_SECRET,
        "Content-Type": "application/json"
    };
}

async function fetchOriginalURL(slug: string, env: Env): Promise<string | null> {
    const response: Response = await fetch(`${env.DIRECTUS_API_LINKS_ENDPOINT}?filter[slug][_eq]=${slug}&limit=1`, {
        headers: getAuthHeaders(env)
    });
    const data = await response.json();
    return data.data && data.data[0] ? data.data[0].original_url : null;
}

async function logLinkEntry(slug: string, query: URLSearchParams, request: Request, env: Env) {
    const domain = new URL(request.url).hostname;
    const queryArray = Array.from(query.entries()).map(([key, value]) => ({ key, value }));
    
    const eventData = {
        query: JSON.stringify(queryArray),
        link: slug,
        domain: domain
    };

    await fetch(env.DIRECTUS_API_LINK_ENTRIES_ENDPOINT, {
        method: 'POST',
        headers: getAuthHeaders(env),
        body: JSON.stringify(eventData)
    });
}

let preloadedContent: Response | null = null;

async function preloadProxyContent(env: Env) {
    const response = await fetch(env.FALLBACK_PROXY_URL);
    preloadedContent = response.clone();
}

async function proxyErrorContent(env: Env): Promise<Response> {
    if (preloadedContent) {
        return preloadedContent.clone();
    }
    return await fetch(env.FALLBACK_PROXY_URL);
}

router.get('/:slug', async (request: Request, env: Env) => {
    try {
        const { slug } = request.params as { slug: string };
        const originalURL: string | null = await fetchOriginalURL(slug, env);
        if (originalURL) {
            await logLinkEntry(slug, new URL(request.url).searchParams, request, env);
            return new Response('', { status: 302, headers: { 'Location': originalURL } });
        } else {
            return await proxyErrorContent(env);
        }
    } catch (error) {
        // In case of any error, proxy the content from the fallback URL
        return await proxyErrorContent(env);
    }
});

router.all('*', async (env: Env) => await proxyErrorContent(env));

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        // Preload the content asynchronously
        preloadProxyContent(env);
        return router.handle(request, env);
    }
};
