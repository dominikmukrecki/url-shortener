import { Router } from 'itty-router';

// Create a new router
const router = Router();

// Retrieve from environment variables
const DIRECTUS_ENDPOINT: string = DIRECTUS_ENDPOINT_BINDING;
const DIRECTUS_AUTH_TOKEN: string = DIRECTUS_AUTH_TOKEN_BINDING;
const CF_ACCESS_CLIENT_ID: string = CF_ACCESS_CLIENT_ID_BINDING;
const CF_ACCESS_CLIENT_SECRET: string = CF_ACCESS_CLIENT_SECRET_BINDING;

/**
 * Fetch the original URL from Directus based on the slug.
 * @param slug The slug from the shortened URL.
 * @returns The original URL if found, null otherwise.
 */
async function fetchOriginalURL(slug: string): Promise<string | null> {
    const response: Response = await fetch(`${DIRECTUS_ENDPOINT}?filter[slug][_eq]=${slug}&limit=1`, {
        headers: {
            'Authorization': `Bearer ${DIRECTUS_AUTH_TOKEN}`,
            'CF-Access-Client-Id': CF_ACCESS_CLIENT_ID,
            'CF-Access-Client-Secret': CF_ACCESS_CLIENT_SECRET
        }
    });
    const data: any = await response.json();
    return data.data && data.data[0] ? data.data[0].original_url : null;
}

router.get('/:slug', async ({ params }: { params: { slug: string } }) => {
    const originalURL: string | null = await fetchOriginalURL(params.slug);
    if (originalURL) {
        return new Response('', { status: 302, headers: { 'Location': originalURL } });
    } else {
        return new Response("URL not found", { status: 404 });
    }
});

router.all('*', () => new Response('404, not found!', { status: 404 }));

export default {
    fetch: router.handle,
};
