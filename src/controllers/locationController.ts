import { Request, Response } from 'express';
import { supabaseAdmin } from '../services/supabaseService';
import { io } from '../index';

export async function updateLocation(req: Request, res: Response) {
  const { tripId, userId, lat, lng } = req.body;

  try {
    await supabaseAdmin.from('location_events').insert({
      trip_id: tripId,
      user_id: userId,
      latitude: lat,
      longitude: lng,
    });

    io.to(tripId).emit('location-received', {
      tripId, userId, lat, lng,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getTripLocations(req: Request, res: Response) {
  const { tripId } = req.params;

  try {
    const { data, error } = await supabaseAdmin
      .from('location_events')
      .select('*')
      .eq('trip_id', tripId)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ locations: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
