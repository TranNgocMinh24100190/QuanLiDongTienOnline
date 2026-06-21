const express = require('express');
const app = express();
app.use(express.json());
// Mảng lưu trữ dữ liệu User tạm thời (In-memory)
let users = [];
// ==========================================
// 1. CREATE - Tạo người dùng mới
// ==========================================
app.post('/users', (req, res) => {
  const { full_name, email, password_hash, phone } = req.body;
  
  // Kiểm tra các trường bắt buộc theo Schema
  if (!full_name || !email || !password_hash) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Kiểm tra email trùng lặp (UNIQUE trong Database)
  const emailExists = users.some(u => u.email === email);
  if (emailExists) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  const id = users.length + 1;
  const newUser = {
    user_id: id,
    full_name,
    email,
    password_hash,
    phone: phone || null,
    created_at: new Date(),
    updated_at: new Date()
  };

  users.push(newUser);
  res.status(201).json({ message: 'User created successfully', user: newUser });
});
// ==========================================
// 2. READ ALL - Lấy danh sách tất cả người dùng
// ==========================================
app.get('/users', (req, res) => {
  res.json(users);
});
// ==========================================
// 3. READ ONE - Lấy thông tin chi tiết một người dùng theo ID
// ==========================================
app.get('/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.user_id === id);

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});
// ==========================================
// 4. UPDATE - Cập nhật thông tin người dùng theo ID
// ==========================================
app.put('/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.user_id === id);

  if (user) {
    const { full_name, email, password_hash, phone } = req.body;

    // Nếu thay đổi email, cần kiểm tra xem email mới có trùng với ai khác không
    if (email && email !== user.email) {
      const emailExists = users.some(u => u.email === email);
      if (emailExists) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Cập nhật các trường dữ liệu nếu có truyền lên
    if (full_name) user.full_name = full_name;
    if (email) user.email = email;
    if (password_hash) user.password_hash = password_hash;
    if (phone !== undefined) user.phone = phone;
    
    user.updated_at = new Date(); // Cập nhật lại thời gian chỉnh sửa

    res.json({ message: 'User updated successfully', user });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});
// ==========================================
// 5. DELETE - Xóa người dùng theo ID
// ==========================================
app.delete('/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.user_id === id);

  if (userIndex !== -1) {
    users.splice(userIndex, 1);
    res.json({ message: 'User deleted successfully' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));