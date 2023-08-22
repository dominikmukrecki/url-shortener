import { Request } from 'itty-router';
import { Env } from './config';
import { fetchOriginalURL, logLinkEntry, logErrorEntry } from './api';
import { iframeEmbedContent, arrayToQueryString } from './utils';

export async function handleSlugRoute(request: Request, env: Env): Promise<Response> { //look for query in the request
    const headersArray: { key: string, value: string }[] = [];
    const additionalHeaders: { [key: string]: string } = {};

    for (const [key, value] of request.headers.entries()) {
        headersArray.push({ key, value });
        additionalHeaders[key] = value;
    }

    try {
        const { slug } = request.params as { slug: string };
        const { original_url, id, headers: fetchedHeaders, query: fetchedQuery } = await fetchOriginalURL(slug, env);
        
        if (original_url && id) {
            await logLinkEntry(id, new URL(request.url).searchParams, headersArray, request, env);
            
            const queryString = arrayToQueryString(fetchedQuery);
            const mergedUrl = original_url + (queryString ? '?' + queryString : ''); //you get me wrrong - query from request is a string, but fetched query is an array of objects/ solve this

            const responseHeaders = {
                ...additionalHeaders,
                ...fetchedHeaders,
                'Location': mergedUrl // brilliant for now! but existing query from api /:slug is not merged into it
            };

            return new Response('', { status: 302, headers: responseHeaders });
        } else {
            logErrorEntry(request.url, new URL(request.url).searchParams, headersArray, env);
            return iframeEmbedContent(env);
        }
    } catch (error) {
        console.error("Error in handleSlugRoute:", error.message);
        logErrorEntry(request.url, new URL(request.url).searchParams, headersArray, env);
        return iframeEmbedContent(env);
    }
}



export async function handleFallbackRoute(request: Request, env: Env): Promise<Response> {
    const headersArray: { key: string, value: string }[] = [];
    for (const [key, value] of request.headers.entries()) {
        headersArray.push({ key, value });
    }

    logErrorEntry(request.url, new URL(request.url).searchParams, headersArray, env);
    return iframeEmbedContent(env);
}
