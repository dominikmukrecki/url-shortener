import { IRequest as Request } from 'itty-router';
import { Env } from './config';
import { fetchOriginalURL, logLinkEntry } from './api';
import { iframeEmbedContent } from './utils';

export async function handleSlugRoute(request: Request, env: Env): Promise<Response> {
    try {
        const { slug } = request.params as { slug: string };
        const { original_url, id, headers: fetchedHeaders, query: fetchedQuery, status } = await fetchOriginalURL(slug, env);
        
        const searchParams = new URL(request.url).searchParams;
        
        const fetchedQueryString = new URLSearchParams(fetchedQuery).toString();
        const existingQueryString = searchParams.toString();
        const mergedQueryString = existingQueryString ? existingQueryString + '&' + fetchedQueryString : fetchedQueryString;
        const mergedUrl = original_url + (mergedQueryString ? '?' + mergedQueryString : '');

        if (original_url && id) {
            await logLinkEntry(id, searchParams, request.headers, request, env, status);
            
            const responseHeaders = {
                ...fetchedHeaders,
                'Location': mergedUrl
            };

            return new Response('', { status: 302, headers: responseHeaders });
        } else {
            await logLinkEntry(null, searchParams, request.headers, request, env, "ERROR_LINK_NOT_FOUND");
            return iframeEmbedContent(env);
        }
    } catch (error) {
        console.error("Error in handleSlugRoute:", error.message);
        await logLinkEntry(null, new URL(request.url).searchParams, request.headers, request, env, "ERROR_IN_ROUTE_HANDLER");
        return iframeEmbedContent(env);
    }
}

export async function handleFallbackRoute(request: Request, env: Env): Promise<Response> {
    await logLinkEntry(null, new URL(request.url).searchParams, request.headers, request, env, "ERROR_IN_FALLBACK");
    return iframeEmbedContent(env);
}
