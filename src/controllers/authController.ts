import { Request, Response } from 'express';
import { supabaseAdmin } from '../services/supabaseService';

export async function signUp(req: Request, res: Response) {
  const { email, password, fullName, phone } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Email, password and name are required' });
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      phone,
      user_metadata: { full_name: fullName },
      email_confirm: true,
    });

    if (error) throw error;

    await supabaseAdmin.from('users').insert({
      id: data.user.id,
      full_name: fullName,
      email,
      phone,
    });

    res.status(201).json({
      message: 'Account created successfully',
      userId: data.user.id,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function signIn(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    res.json({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata.full_name,
      }
    });
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid email or password' });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  const { phone, token } = req.body;

  try {
    const { data, error } = await supabaseAdmin.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (error) throw error;

    res.json({
      token: data.session?.access_token,
      user: data.user,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
