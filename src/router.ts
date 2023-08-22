import { Router } from 'itty-router';
import { handleSlugRoute, handleFallbackRoute } from './handlers';

const router = Router();

router.get('/:slug', handleSlugRoute);
router.all('*', handleFallbackRoute);

export default router;
