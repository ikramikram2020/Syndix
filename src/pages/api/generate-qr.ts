import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';

// Initialize Supabase
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
    const { residentId, residentName, buildingId, apartmentNumber } = req.body;

    if (!residentId || !residentName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique token
    const token = `${residentId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Generate QR code
    const qrDataUrl = await QRCode.toDataURL(token, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
      color: {
        dark: '#0f2260',
        light: '#ffffff'
      }
    });

    // Save to database
    const { error: dbError } = await supabase
      .from('qr_codes')
      .insert({
        resident_id: residentId,
        qr_token: token,
        qr_image: qrDataUrl,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        is_active: true
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ error: 'Failed to save QR code' });
    }

    const accessUrl = `${process.env.NEXT_PUBLIC_APP_URL}/resident/login?token=${token}`;

    return res.status(200).json({
      success: true,
      qrCode: qrDataUrl,
      token,
      accessUrl,
      residentInfo: {
        name: residentName,
        apartment: apartmentNumber
      }
    });

  } catch (error) {
    console.error('QR Generation Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}