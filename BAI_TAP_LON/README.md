```markdown
# Quản lý dòng tiền online

Ứng dụng này gồm hai phần:

- `backend/` — API server Node.js + Express
- `frontend/` — React app

## Công nghệ

- Backend: Node.js, Express, MySQL/MariaDB
- Frontend: React, React Router, Axios
- DB: MariaDB (SQL file có trong `backend/database.sql`)

## Yêu cầu

- Node.js
- npm
- MariaDB / MySQL

## Cấu trúc thư mục

- `backend/`
  - `src/` — source code backend
  - `test/` — test backend
  - `.env.example` — mẫu cấu hình môi trường
  - `database.sql` — file SQL import database
- `frontend/`
  - `src/` — source code React
  - `src/test/` — test frontend
  - `public/`
- package.json gốc — scripts chạy đồng thời backend và frontend (nếu có)

## Cài đặt

### 1. Cài dependencies chung

```bash
cd Duong_dan_cua_ban\Quan-li-dong-tien-online\BAI_TAP_LON
npm install
```

### 2. Backend

```bash
cd backend
npm install
```

### 3. Frontend

```bash
cd frontend
npm install
```

## Cấu hình môi trường

### Backend

Trong thư mục `backend/` đã có file mẫu `backend/.env.example`. Sao chép file mẫu thành `.env` và điền giá trị thật trước khi chạy.

Windows CMD:
```bash
copy backend\.env.example backend\.env
```

PowerShell / Bash:
```bash
cp backend/.env.example backend/.env
```

Ví dụ (mẫu `backend/.env.example`):
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_db_password
DB_NAME=QuanLyDongTien
PORT=5000
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

Không commit file `backend/.env`. Thêm `backend/.env` vào `.gitignore`. Nếu bạn lỡ commit `backend/.env`, làm theo các bước sau để loại bỏ nó khỏi git history (tại thư mục gốc project):

```bash
# 1) Thêm backend/.env vào .gitignore (nếu chưa có)
echo "backend/.env" >> .gitignore

# 2) Bỏ tracking file .env đã được commit và commit lại
git rm --cached backend/.env
git commit -m "Remove backend .env from repo"
```

Luôn chỉ commit `backend/.env.example` (không chứa secrets).

### Database

Import file SQL (tạo database `QuanLyDongTien` trước nếu cần):

```bash
mysql -u root -p QuanLyDongTien < backend/database.sql
```

Hoặc mở MariaDB Client và chạy nội dung `backend/database.sql`.

#### Frontend

Hiện tại frontend không sử dụng biến môi trường (.env).
Địa chỉ API được cấu hình trực tiếp trong source code.

Nếu sau này cần tách cấu hình API URL theo môi trường (development/production),
có thể tạo file frontend/.env và sử dụng biến môi trường phù hợp.

## Chạy ứng dụng

### Chạy cả hai cùng lúc
(nếu project có script root để chạy đồng thời)
```bash
cd Duong_dan_cua_ban\Quan-li-dong-tien-online\BAI_TAP_LON
npm run dev
```

### Chạy riêng backend
```bash
cd backend
npm run dev   # hoặc npm start
```

### Chạy riêng frontend
```bash
cd frontend
npm start
```

## Kiểm tra

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## Scripts (tham khảo)
- Root / project: `npm run dev` — chạy đồng thời backend + frontend (nếu đã cấu hình)
- Backend: `npm start`, `npm run dev`, `npm test`
- Frontend: `npm start`, `npm run build`, `npm test`

## Ghi chú

- Chạy backend trước, sau đó frontend.
- Nếu frontend không kết nối được API, kiểm tra `REACT_APP_API_URL` hoặc endpoint trong code.
- Đảm bảo server MariaDB đang hoạt động trước khi chạy backend.
```