import { Env } from './config';
import { getAuthHeaders } from './auth';
import { Request } from '@cloudflare/workers-types'; // Importing Response

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

type ResponseHeaders = {
    [key: string]: string;
};

export async function logLinkEntry(
    id: string | null,
    request: Request,
    response: Response | null,
    env: Env,
    status: string
) {
    const requestUrlObj = new URL(request.url);
    let responseHeaders: ResponseHeaders = {};
    let responseLocation = null;
    let responseUrlObj: URL | null = null; // Explicitly type the variable

    if (response) {
        responseHeaders = Object.fromEntries(response.headers.entries());
        responseLocation = responseHeaders?.['location'] || null;

        if (responseLocation) try {
            responseUrlObj = new URL(responseLocation);
        } catch (error) {
            console.error("Invalid response location:", responseLocation);
            responseUrlObj = null;
        }
    }

    const eventData = {
        link: id,
        status: status,
        request_headers: Object.fromEntries(request.headers.entries()),
        request_url: request.url,
        request_domain: requestUrlObj.hostname,
        request_path: requestUrlObj.pathname,
        response_headers: responseHeaders,
        response_url: responseLocation,
        response_query: responseUrlObj ? Object.fromEntries(responseUrlObj.searchParams.entries()) : {},
        request_query: Object.fromEntries(requestUrlObj.searchParams.entries()),
        request_cf: request.cf,
    };

    fetch(env.DIRECTUS_API_LINK_ENTRIES_ENDPOINT, {
        method: 'POST',
        headers: getAuthHeaders(env),
        body: JSON.stringify(eventData)
    });
}
