    import { Request } from '@cloudflare/workers-types';
    import { Env } from './config';
    import router from './router';
    import { logToDirectus } from './api';

    export default {
        async fetch(request: Request, env: Env): Promise<Response> {
            let response = await router.handle(request, env);
    
            // Create the payload object with comprehensive details from request and response
            const payload = {
                request: {
                    method: request.method,
                    url: request.url,
                    headers: Object.fromEntries(request.headers.entries()),
                    redirect: request.redirect,
                    cf: request.cf, // Cloudflare-specific details
                    integrity: request.integrity,
                    keepalive: request.keepalive
                },
                response: {
                    headers: Object.fromEntries(response.headers.entries()),
                    ok: response.ok,
                    redirected: response.redirected,
                    status: response.status,
                    statusText: response.statusText,
                    type: response.type,
                    url: response.url
                    // If you need to log the response body, ensure it's serialized correctly.
                    // Note: Logging the entire response body might not always be ideal due to size or sensitivity.
                }
            };
    
            // Log the payload to Directus
            await logToDirectus(payload, env);
    
            return response;
        }
    };
    