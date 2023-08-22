import { Env } from './config';

export function iframeEmbedContent(env: Env): Response {
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <!-- Favicon with SVG circle -->
            <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='48' fill='%23C93F3A' /%3E%3C/svg%3E" type="image/svg+xml">
        </head>
        <body style="margin:0; padding:0; overflow:hidden;">
            <iframe src="${env.EMBEDDED_FALLBACK_URL}" frameborder="0" style="overflow:hidden; overflow-x:hidden; overflow-y:hidden; height:100%; width:100%; position:absolute; top:0; left:0;"></iframe>
        </body>
        </html>
    `;

    return new Response(htmlContent, { status: 200, headers: { 'Content-Type': 'text/html' } });
}

export function mergeQueryParams(originalUrl: string, requestQuery: string): string {
    const originalUrlObj = new URL(originalUrl);
    const requestUrlObj = new URL(`http://example.com${requestQuery}`); // dummy domain just to parse query

    for (const [key, value] of requestUrlObj.searchParams.entries()) {
        originalUrlObj.searchParams.set(key, value);
    }

    return originalUrlObj.toString();
}

export function arrayToQueryString(queryArray) {
    return queryArray.map(({ key, value }) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
}
