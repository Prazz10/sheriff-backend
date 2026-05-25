import { Request, Response } from 'express';
import { supabaseAdmin } from '../services/supabaseService';
import { sendSMS } from '../services/smsService';

export async function sendSOSAlert(req: Request, res: Response) {
  const { userId, lat, lng } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const { data: guardians } = await supabaseAdmin
      .from('guardians')
      .select('*')
      .eq('user_id', userId);

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('full_name')
      .eq('id', userId)
      .single();

    if (!guardians || guardians.length === 0) {
      return res.json({ success: true, sent: 0, message: 'No guardians found' });
    }

    const userName = user?.full_name || 'SheRiff User';
    const mapsLink = 'https://maps.google.com/?q=' + lat + ',' + lng;
    const message = 'EMERGENCY SOS from SheRiff! ' +
      userName + ' needs help! Location: ' + mapsLink +
      ' Time: ' + new Date().toLocaleString('en-IN');

    let sent = 0;
    for (const guardian of guardians) {
      const success = await sendSMS(guardian.guardian_phone, message);
      if (success) sent++;
    }

    // Save SOS to database
    await supabaseAdmin.from('sos_events').insert({
      user_id: userId,
      latitude: lat || 0,
      longitude: lng || 0,
      status: 'active',
    });

    res.json({ success: true, sent, total: guardians.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function sendLocationAlert(req: Request, res: Response) {
  const { userId, lat, lng, duration } = req.body;

  try {
    const { data: guardians } = await supabaseAdmin
      .from('guardians')
      .select('*')
      .eq('user_id', userId);

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('full_name')
      .eq('id', userId)
      .single();

    if (!guardians || guardians.length === 0) {
      return res.json({ success: true, sent: 0 });
    }

    const userName = user?.full_name || 'SheRiff User';
    const mapsLink = 'https://maps.google.com/?q=' + lat + ',' + lng;
    const message = 'SheRiff Location Share: ' +
      userName + ' is sharing live location for ' + duration + ' min. ' +
      'Track here: ' + mapsLink;

    let sent = 0;
    for (const guardian of guardians) {
      const success = await sendSMS(guardian.guardian_phone, message);
      if (success) sent++;
    }

    res.json({ success: true, sent });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
