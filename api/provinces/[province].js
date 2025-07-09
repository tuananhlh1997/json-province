import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // Chỉ cho phép domain cụ thể
  const allowedOrigins = [
    'https://tra-cuu-tinh-thanh.vercel.app'
  ];
  
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  
  console.log('Origin:', origin); // Debug log
  console.log('Referer:', referer); // Debug log
  
  // Kiểm tra origin
  if (origin && !allowedOrigins.includes(origin)) {
    console.log('Blocked origin:', origin);
    return res.status(403).json({ error: 'Access denied: Invalid origin' });
  }
  
  // Kiểm tra referer
  if (referer && !allowedOrigins.some(allowed => referer.startsWith(allowed))) {
    console.log('Blocked referer:', referer);
    return res.status(403).json({ error: 'Access denied: Invalid referer' });
  }
  
  // Chỉ thiết lập CORS cho domain được phép
  res.setHeader('Access-Control-Allow-Origin', 'https://tra-cuu-tinh-thanh.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { province } = req.query;
    
    if (!province || typeof province !== 'string') {
      return res.status(400).json({ error: 'Invalid province parameter' });
    }
    
    const sanitizedProvince = province.replace(/[^a-zA-Z0-9]/g, '');
    const filePath = path.join(process.cwd(), 'api', 'provinces', `${sanitizedProvince}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Province data not found' });
    }

    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    
    res.status(200).json(jsonData);
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}