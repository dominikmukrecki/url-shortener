// import { IRequest as Request } from 'itty-router';
import { Env } from './config';
import { fetchOriginalURL } from './api';
import { iframeEmbedContent } from './utils';
import { Request } from '@cloudflare/workers-types'; // Importing Response

export async function handleSlugRoute(request: Request, env: Env): Promise<Response> {
    try {
        // Assuming you're using some kind of routing library that attaches params to the Request object
        const { slug } = (request as any).params as { slug: string }; // Cast to any to bypass type checking for this line
        const { original_url, id, request_headers: fetchedHeaders, request_query: fetchedQuery } = await fetchOriginalURL(slug, env);
        
        if (original_url && id) {
            const searchParams = new URL(request.url).searchParams;
            const originalUrlObj = new URL(original_url);
            
            // Merge the query parameters
            const mergedQuery = {
                ...Object.fromEntries(originalUrlObj.searchParams),
                ...fetchedQuery,
                ...Object.fromEntries(searchParams)
            };
            const mergedQueryString = new URLSearchParams(mergedQuery).toString();
            const baseUrl = original_url.split('?')[0];  // Extract base URL without query parameters
            const mergedUrl = baseUrl + (mergedQueryString ? '?' + mergedQueryString : '');

            // Merge the headers
            const mergedHeaders = {
                ...Object.fromEntries(request.headers.entries()),
                ...fetchedHeaders,
                'Location': mergedUrl
            };

            const responseToRedirect = new Response('', { status: 302, headers: mergedHeaders });
            return responseToRedirect;
        } else {
            return iframeEmbedContent(env);
        }
    } catch (error) {
        console.error("Error in handleSlugRoute:", error.message);
        return iframeEmbedContent(env);
    }
}

export async function handleFallbackRoute(request: Request, env: Env): Promise<Response> {
    return iframeEmbedContent(env);
}
