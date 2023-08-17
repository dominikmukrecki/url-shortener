import { Directus, Auth } from '@directus/sdk';

// Initialize the Directus SDK
const directus = new Directus(DIRECTUS_ENDPOINT);

// Set the authentication token
directus.auth = new Auth(directus, {
    mode: 'json',
    token: DIRECTUS_AUTH_TOKEN,
    storage: null  // We don't use storage in Cloudflare Workers
});

/**
 * Fetch the original URL from Directus based on the slug using Directus SDK.
 * @param slug The slug from the shortened URL.
 * @returns The original URL if found, null otherwise.
 */
export async function fetchOriginalURLWithSDK(slug: string): Promise<string | null> {
    try {
        const filters = {
            filter: {
                slug: {
                    _eq: slug
                }
            },
            limit: 1
        };
        const response = await directus.items('your_collection_name').readMany(filters);
        const data = response.data;
        return data && data[0] ? data[0].original_url : null;
    } catch (error) {
        console.error('Error fetching URL from Directus:', error);
        return null;
    }
}
