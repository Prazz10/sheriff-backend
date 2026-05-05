import { Request, Response } from 'express';
import { supabaseAdmin } from '../services/supabaseService';

export async function getProfile(req: Request, res: Response) {
  const { userId } = req.params;

  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const { data: guardians } = await supabaseAdmin
      .from('guardians')
      .select('*')
      .eq('user_id', userId);

    res.json({ user, guardians });
  } catch (error: any) {
    res.status(404).json({ error: 'User not found' });
  }
}

export async function updateProfile(req: Request, res: Response) {
  const { userId } = req.params;
  const { fullName, phone } = req.body;

  try {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ full_name: fullName, phone })
      .eq('id', userId);

    if (error) throw error;
    res.json({ success: true, message: 'Profile updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function addGuardian(req: Request, res: Response) {
  const { userId, name, phone, relationship } = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('guardians')
      .insert({
        user_id: userId,
        guardian_name: name,
        guardian_phone: phone,
        relationship,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, guardian: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function removeGuardian(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const { error } = await supabaseAdmin
      .from('guardians')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Guardian removed' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
