// api/provinces/[province].js - Server Code (Simple Base64)
import fs from 'fs';
import path from 'path';

// Simple Base64 encoding function
function simpleBase64Encode(data) {
  const jsonString = JSON.stringify(data);
  // Proper UTF-8 encoding for Vietnamese characters
  return Buffer.from(jsonString, 'utf8').toString('base64');
}

export default function handler(req, res) {
  // FORCE NO CACHE
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
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
  
  // Block logic
  if (!referer && !origin) {
    console.log('BLOCKED: No referer or origin');
    return res.status(403).json({ error: 'Access Denied' });
  }
  
  if (referer && !allowedDomains.some(domain => referer.startsWith(domain))) {
    console.log('BLOCKED: Invalid referer:', referer);
    return res.status(403).json({ error: 'Access Denied' });
  }
  
  if (origin && !allowedDomains.includes(origin)) {
    console.log('BLOCKED: Invalid origin:', origin);
    return res.status(403).json({ error: 'Access Denied' });
  }
  
  // Set CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://tra-cuu-tinh-thanh.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Token, X-Time');
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
    
    // Simple Base64 encode
    const encodedData = simpleBase64Encode(jsonData);
    
    console.log('ACCESS GRANTED for:', referer || origin);
    console.log('Data encoded successfully, length:', encodedData.length);
    
    // Return encoded response
    res.status(200).json({
      status: 'ok',
      payload: encodedData,
      ts: Date.now()
    });
    
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}