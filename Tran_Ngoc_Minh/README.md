# 💰 QUẢN LÝ DÒNG TIỀN ONLINE

## 📌 Mô tả
Hệ thống quản lý dòng tiền cho phép thực hiện các thao tác CRUD trên bảng Transactions.

---

## 🛠 Công nghệ
- Node.js (Express)
- MariaDB / MySQL
- mysql2
- Thunder Client (test API)

---

## 🔥 CRUD chức năng (Transactions)

### ➕ CREATE
Thêm giao dịch mới

POST /transactions


---

### 📖 READ
Xem danh sách hoặc chi tiết giao dịch

GET /transactions
GET /transactions/:id


---

### ✏️ UPDATE
Cập nhật giao dịch

PUT /transactions/:id


---

### ❌ DELETE
Xóa giao dịch

DELETE /transactions/:id


---

## 🚀 Cách chạy

npm install
node api.js


---

## 🧪 Test API
Dùng Thunder Client hoặc Postman để test các API CRUD ở trên.

---

## 👨‍💻 Ghi chú
Dự án chỉ tập trung vào chức năng CRUD cho bảng Transactions.
