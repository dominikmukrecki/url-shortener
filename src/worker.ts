import { Env } from './config';
import router from './router';

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        return router.handle(request, env);
    }
};
