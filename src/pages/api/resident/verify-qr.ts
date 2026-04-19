import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    const { token } = req.body;

    console.log('🔍 Verifying token:', token);

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
      console.error('❌ QR code not found:', qrError);
      return res.status(401).json({ error: 'Invalid or expired QR code' });
    }

    // Check if expired
    if (qrCode.expires_at && new Date(qrCode.expires_at) < new Date()) {
      return res.status(401).json({ error: 'QR code has expired' });
    }

    // Get apartment details
    let apartmentNumber = null;
    let floor = null;
    let buildingName = null;
    let buildingCity = null;

    if (qrCode.residents?.apartment_id) {
      const { data: apartment } = await supabase
        .from('apartments')
        .select('*')
        .eq('id', qrCode.residents.apartment_id)
        .single();

      if (apartment) {
        apartmentNumber = apartment.apartment_number;
        floor = apartment.floor;

        const { data: building } = await supabase
          .from('buildings')
          .select('*')
          .eq('id', apartment.building_id)
          .single();

        if (building) {
          buildingName = building.name;
          buildingCity = building.city;
        }
      }
    }

    console.log('✅ Resident verified:', qrCode.residents?.full_name);

    return res.status(200).json({
      success: true,
      resident: {
        id: qrCode.resident_id,
        full_name: qrCode.residents?.full_name,
        email: qrCode.residents?.email,
        phone: qrCode.residents?.phone,
        apartment_number: apartmentNumber,
        floor: floor,
        building_name: buildingName,
        building_city: buildingCity,
      },
      token: qrCode.qr_token,
    });

  } catch (error) {
    console.error('❌ QR Verification Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}