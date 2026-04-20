import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to get base URL dynamically
const getBaseUrl = (req: NextApiRequest) => {
  // In production, use environment variable if set
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  // In development, get from the request
  const protocol = req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const host = req.headers.host;
  return `${protocol}://${host}`;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { residentId, residentName, buildingId, apartmentNumber } = req.body;

    console.log('📱 Generating QR for:', { residentId, residentName });

    if (!residentId || !residentName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique token
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const token = `RES_${timestamp}_${random}`;
    
    // Get base URL dynamically (works on any port)
    const baseUrl = getBaseUrl(req);
    const accessUrl = `${baseUrl}/resident?token=${token}`;
    
    console.log('🔗 Access URL:', accessUrl);
    
    // Generate QR code image
    const qrDataUrl = await QRCode.toDataURL(accessUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
      color: {
        dark: '#1C2B6B',
        light: '#FFFFFF'
      }
    });

    // Save to database
    const { data, error: dbError } = await supabase
      .from('qr_codes')
      .insert({
        resident_id: residentId,
        qr_token: token,
        qr_image: qrDataUrl,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ Database error:', dbError);
      return res.status(500).json({ error: 'Failed to save QR code: ' + dbError.message });
    }

    console.log('✅ QR code saved successfully');
    
    return res.status(200).json({
      success: true,
      qrCode: qrDataUrl,
      token: token,
      accessUrl: accessUrl,
      residentInfo: {
        name: residentName,
        apartment: apartmentNumber
      }
    });

  } catch (error) {
    console.error('❌ QR Generation Error:', error);
    return res.status(500).json({ error: 'Internal server error: ' + (error as Error).message });
  }
}