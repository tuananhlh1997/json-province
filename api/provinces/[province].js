import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // FORCE NO CACHE
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  
  // Debug info
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Request from:`, {
    origin: req.headers.origin,
    referer: req.headers.referer,
    userAgent: req.headers['user-agent'],
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
  });
  
  // STRICT BLOCKING
  const allowedDomains = ['https://tra-cuu-tinh-thanh.vercel.app'];
  const referer = req.headers.referer;
  const origin = req.headers.origin;
  
  // Block if no referer AND no origin
  if (!referer && !origin) {
    console.log('BLOCKED: No referer or origin');
    return res.status(403).json({ 
      error: 'Access Denied',
      message: 'Direct access not allowed',
      timestamp 
    });
  }
  
  // Block if referer exists but not from allowed domain
  if (referer && !allowedDomains.some(domain => referer.startsWith(domain))) {
    console.log('BLOCKED: Invalid referer:', referer);
    return res.status(403).json({ 
      error: 'Access Denied',
      message: 'Invalid referer',
      referer,
      timestamp 
    });
  }
  
  // Block if origin exists but not allowed
  if (origin && !allowedDomains.includes(origin)) {
    console.log('BLOCKED: Invalid origin:', origin);
    return res.status(403).json({ 
      error: 'Access Denied',
      message: 'Invalid origin',
      origin,
      timestamp 
    });
  }
  
  // Set CORS for allowed domain only
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
    
    console.log('ACCESS GRANTED for:', referer || origin);
    res.status(200).json(jsonData);
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}