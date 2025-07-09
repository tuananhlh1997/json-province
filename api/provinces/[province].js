import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // Thiết lập CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-type', 'application/json');

  // Xử lý OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Lấy tên tỉnh từ URL parameter
    const { province } = req.query;
    
    // Tạo đường dẫn đến file JSON
    const filePath = path.join(process.cwd(), 'api', 'provinces', `${province}.json`);
    
    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Province data not found' });
    }

    // Đọc và parse JSON data
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    
    // Trả về dữ liệu
    res.status(200).json(jsonData);
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}