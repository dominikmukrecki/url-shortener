import { Env } from './config';
import { getAuthHeaders } from './auth';

export async function fetchOriginalURL(slug: string, env: Env): Promise<{ original_url: string | null, id: string | null, headers: any, query: any, status: string }> {
    try {
        const response: Response = await fetch(`${env.DIRECTUS_API_LINKS_ENDPOINT}?filter[slug][_eq]=${slug}&limit=1`, {
            headers: getAuthHeaders(env)
        });
        if (!response.ok) {
            return {
                original_url: null,
                id: null,
                headers: {},
                query: {},
                status: "ERROR_FETCH_FAILED" // More descriptive status for a failed fetch
            };
        }
        const data = await response.json();

        return {
            original_url: data.data && data.data[0] ? data.data[0].original_url : null,
            id: data.data && data.data[0] ? data.data[0].id : null,
            headers: data.data && data.data[0] ? data.data[0].headers : {},
            query: data.data && data.data[0] ? data.data[0].query : {},
            status: "SUCCESS"
        };
    } catch (error) {
        console.error(`Error fetching original URL for slug ${slug}:`, error);
        return {
            original_url: null,
            id: null,
            headers: {},
            query: {},
            status: "ERROR_LINK_NOT_FOUND" // More descriptive status for a link that doesn't exist
        };
    }
}

export async function logLinkEntry(id: string | null, query: URLSearchParams, headers: any, request: Request, env: Env, status: string) {
    const domain = new URL(request.url).hostname;
    const path = new URL(request.url).pathname; // Extracting the path from the request URL
    
    const eventData = {
        query: JSON.stringify(query),
        headers: JSON.stringify(headers),
        link: id,
        domain: domain,
        path: path,
        status: status
    };

    await fetch(env.DIRECTUS_API_LINK_ENTRIES_ENDPOINT, {
        method: 'POST',
        headers: getAuthHeaders(env),
        body: JSON.stringify(eventData)
    });
}
