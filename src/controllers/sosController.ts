import { Request, Response } from 'express';
import { supabaseAdmin } from '../services/supabaseService';
import { io } from '../index';
import dotenv from 'dotenv';
dotenv.config();

export async function triggerSOS(req: Request, res: Response) {
  const { userId, lat, lng } = req.body;

  if (!userId || !lat || !lng) {
    return res.status(400).json({ error: 'userId, lat and lng are required' });
  }

  try {
    const { data: sosEvent } = await supabaseAdmin
      .from('sos_events')
      .insert({
        user_id: userId,
        latitude: lat,
        longitude: lng,
        status: 'active',
      })
      .select()
      .single();

    const { data: guardians } = await supabaseAdmin
      .from('guardians')
      .select('guardian_phone, guardian_name')
      .eq('user_id', userId);

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('full_name')
      .eq('id', userId)
      .single();

    const userName = user?.full_name || 'SheRiff User';
    const mapsLink = 'https://maps.google.com/?q=' + lat + ',' + lng;
    const smsMessage = 'EMERGENCY ALERT from SheRiff\n' + userName + ' needs help!\nLocation: ' + mapsLink;

    // Only use Twilio if credentials are configured
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
      const twilio = require('twilio');
      const twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      const smsPromises = guardians?.map(guardian =>
        twilioClient.messages.create({
          body: smsMessage,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: guardian.guardian_phone,
        })
      ) || [];
      await Promise.all(smsPromises);
    } else {
      console.log('Twilio not configured - SMS skipped');
      console.log('Would send to:', guardians?.map(g => g.guardian_phone));
    }

    io.to('sos-' + userId).emit('sos-alert', {
      sosId: sosEvent?.id,
      lat, lng,
      timestamp: new Date().toISOString(),
      userName,
    });

    res.json({
      success: true,
      sosId: sosEvent?.id,
      guardianCount: guardians?.length || 0,
      message: 'SOS triggered successfully',
    });

  } catch (error: any) {
    console.error('SOS Error:', error);
    res.status(500).json({ error: 'Failed to trigger SOS' });
  }
}

export async function resolveSOS(req: Request, res: Response) {
  const { sosId } = req.body;

  try {
    await supabaseAdmin
      .from('sos_events')
      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
      .eq('id', sosId);

    res.json({ success: true, message: 'SOS resolved' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
