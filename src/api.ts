import { Env } from './config';
import { getAuthHeaders } from './auth';

export async function fetchOriginalURL(slug: string, env: Env): Promise<{ original_url: string | null, id: string | null, headers: { key: string, value: string }[], query: { key: string, value: string }[] }> {
    try {
        const response: Response = await fetch(`${env.DIRECTUS_API_LINKS_ENDPOINT}?filter[slug][_eq]=${slug}&limit=1`, {
            headers: getAuthHeaders(env)
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch original URL. Status: ${response.status}`);
        }
        const data = await response.json();

        return {
            original_url: data.data && data.data[0] ? data.data[0].original_url : null,
            id: data.data && data.data[0] ? data.data[0].id : null,
            headers: data.data && data.data[0] ? data.data[0].headers : [],
            query: data.data && data.data[0] ? data.data[0].query : []            
            };
    } catch (error) {
        console.error(`Error fetching original URL for slug ${slug}:`, error);
        return {
            original_url: null,
            id: null,
            headers: [],
            query: []
        };
    }
}


export async function logLinkEntry(id: string, query: URLSearchParams, headersArray: { key: string, value: string }[], request: Request, env: Env) {
    const domain = new URL(request.url).hostname;
    const queryArray = Array.from(query.entries()).map(([key, value]) => ({ key, value }));
    
    const eventData = {
        query: JSON.stringify(queryArray),
        headers: JSON.stringify(headersArray), // Log headers as a JSON string
        link: id,
        domain: domain
    };

    await fetch(env.DIRECTUS_API_LINK_ENTRIES_ENDPOINT, {
        method: 'POST',
        headers: getAuthHeaders(env),
        body: JSON.stringify(eventData)
    });
}

export async function logErrorEntry(url: string, query: URLSearchParams, headersArray: { key: string, value: string }[], env: Env) {
    const domain = new URL(url).hostname;
    const path = new URL(url).pathname; // Extracting just the path from the URL
    const queryArray = Array.from(query.entries()).map(([key, value]) => ({ key, value }));
    
    const errorData = {
        path: path, //empty path error not logged
        query: JSON.stringify(queryArray),
        headers: JSON.stringify(headersArray),
        domain: domain
    };

    await fetch(env.DIRECTUS_API_ERROR_ENTRIES_ENDPOINT, {
        method: 'POST',
        headers: getAuthHeaders(env),
        body: JSON.stringify(errorData)
    });
}

