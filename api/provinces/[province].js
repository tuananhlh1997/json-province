import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // Kiểm tra origin và referer
  const allowedOrigins = [
    'https://tra-cuu-tinh-thanh.vercel.app',
    'http://localhost:3000', // Cho development (tùy chọn)
  ];
  
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  
  // Kiểm tra origin
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Access denied: Invalid origin' });
  }
  
  // Kiểm tra referer (bảo mật thêm)
  if (referer && !allowedOrigins.some(allowed => referer.startsWith(allowed))) {
    return res.status(403).json({ error: 'Access denied: Invalid referer' });
  }
  
  // Chỉ thiết lập CORS cho domain được phép
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://tra-cuu-tinh-thanh.vercel.app');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Referer');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Xử lý OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Chỉ cho phép GET request
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Lấy tên tỉnh từ URL parameter
    const { province } = req.query;
    
    // Validate province parameter
    if (!province || typeof province !== 'string') {
      return res.status(400).json({ error: 'Invalid province parameter' });
    }
    
    // Sanitize filename để tránh path traversal
    const sanitizedProvince = province.replace(/[^a-zA-Z0-9]/g, '');
    
    // Tạo đường dẫn đến file JSON
    const filePath = path.join(process.cwd(), 'api', 'provinces', `${sanitizedProvince}.json`);
    
    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Province data not found' });
    }

    // Đọc và parse JSON data
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    
    // Thêm cache headers
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache 1 giờ
    
    // Trả về dữ liệu
    res.status(200).json(jsonData);
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}