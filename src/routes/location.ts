import { Router } from 'express';
import { updateLocation, getTripLocations } from '../controllers/locationController';

const router = Router();

router.post('/update', updateLocation);
router.get('/trip/:tripId', getTripLocations);

export default router;
