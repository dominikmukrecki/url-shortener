import { Env } from './config';
import { getAuthHeaders } from './auth';

interface DirectusResponse {
    data: {
        original_url: string;
        id: string;
        request_headers: any;
        request_query: any;
    }[];
}

export async function fetchOriginalURL(slug: string, env: Env): Promise<{ original_url: string | null, id: string | null, request_headers: any, request_query: any }> {
    try {
        const response: Response = await fetch(`${env.DIRECTUS_API_LINKS_ENDPOINT}?filter[slug][_eq]=${slug}&limit=1`, {
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
            original_url: data.data && data.data[0] ? data.data[0].original_url : null,
            id: data.data && data.data[0] ? data.data[0].id : null,
            request_headers: data.data && data.data[0] ? data.data[0].request_headers : {},
            request_query: data.data && data.data[0] ? data.data[0].request_query : {},
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