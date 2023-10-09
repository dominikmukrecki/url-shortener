import { Env } from './config';
import { getAuthHeaders } from './auth';

interface DirectusResponse {
    data: {
        original_url: string;
        id: string;
        request_headers: any;
        request_query: any;
    };
}
export async function fetchOriginalURL(slug: string, env: Env): Promise<{ original_url: string | null, id: string | null, request_headers: any, request_query: any }> {
    try {
        const response: Response = await fetch(`${env.DIRECTUS_API_LINKS_ENDPOINT}/${slug}`, {
            headers: getAuthHeaders(env),
        }) as unknown as Response;
        if (!response.ok) {
            return {
                original_url: null,
                id: null,
                request_headers: {},
                request_query: {},
            };
        }
        
        const data = await response.json() as DirectusResponse;

        return {
            original_url: data.data && data.data ? data.data.original_url : null,
            id: data.data && data.data ? data.data.id : null,
            request_headers: data.data && data.data ? data.data.request_headers : {},
            request_query: data.data && data.data ? data.data.request_query : {},
        };
            } catch (error) {
        console.error(`Error fetching original URL for slug ${slug}:`, error);
        return {
            original_url: null,
            id: null,
            request_headers: {},
            request_query: {},
        };
    }
}

interface LogPayload {
    link: string | null;  // add this field for the UUID of the fetched link
    response: Record<string, unknown>;
    request: Record<string, unknown>;
}

export async function logToDirectus(payload: LogPayload, env: Env): Promise<void> {
    try {
        const response = await fetch(env.DIRECTUS_API_LINK_ENTRIES_ENDPOINT, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(env),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)  // Flatten the payload structure here
        });

        if (!response.ok) {
            console.error('Error logging data to Directus:', await response.text());
        }
    } catch (error) {
        console.error('Error in logToDirectus:', error);
    }
}
