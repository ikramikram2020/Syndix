import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase (use service role for verification)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Find the QR code in database
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('*, residents(*)')
      .eq('qr_token', token)
      .eq('is_active', true)
      .single();

    if (qrError || !qrCode) {
      return res.status(401).json({ error: 'Invalid or expired QR code' });
    }

    // Check if expired
    if (qrCode.expires_at && new Date(qrCode.expires_at) < new Date()) {
      return res.status(401).json({ error: 'QR code has expired' });
    }

    // Update scan count
    await supabase
      .from('qr_codes')
      .update({ scanned_count: (qrCode.scanned_count || 0) + 1 })
      .eq('id', qrCode.id);

    // Get apartment details
    const { data: apartment } = await supabase
      .from('apartments')
      .select('*')
      .eq('id', qrCode.residents?.apartment_id)
      .single();

    // Get building details
    const { data: building } = await supabase
      .from('buildings')
      .select('*')
      .eq('id', apartment?.building_id)
      .single();

    // Return resident data for session
    return res.status(200).json({
      success: true,
      resident: {
        id: qrCode.resident_id,
        full_name: qrCode.residents?.full_name,
        email: qrCode.residents?.email,
        phone: qrCode.residents?.phone,
        apartment_number: apartment?.apartment_number,
        floor: apartment?.floor,
        building_name: building?.name,
        building_city: building?.city,
      },
      token: qrCode.qr_token,
    });

  } catch (error) {
    console.error('QR Verification Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}