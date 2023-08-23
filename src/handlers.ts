import { IRequest as Request } from 'itty-router';
import { Env } from './config';
import { fetchOriginalURL, logLinkEntry } from './api';
import { iframeEmbedContent } from './utils';

export async function handleSlugRoute(request: Request, env: Env): Promise<Response> {
    try {
        const { slug } = request.params as { slug: string };
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
            logLinkEntry(id, request, responseToRedirect, env, "REDIRECT_INITIATED");
            return responseToRedirect;
        } else {
            logLinkEntry(null, request, null, env, "ERROR_LINK_NOT_FOUND");
            return iframeEmbedContent(env);
        }
    } catch (error) {
        console.error("Error in handleSlugRoute:", error.message);
        logLinkEntry(null, request, null, env, "ERROR_IN_ROUTE_HANDLER");
        return iframeEmbedContent(env);
    }
}

export async function handleFallbackRoute(request: Request, env: Env): Promise<Response> {
    await logLinkEntry(null, request, null, env, "ERROR_IN_FALLBACK");
    return iframeEmbedContent(env);
}
