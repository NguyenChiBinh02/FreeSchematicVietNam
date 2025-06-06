# FREESCHEMATICVIETNAM

FREESCHEMATICVIETNAM là một ứng dụng web được thiết kế để cung cấp một thư viện file sơ đồ có thể tìm kiếm, dành riêng cho người dùng Việt Nam. Ứng dụng cho phép người dùng duyệt, tìm kiếm và tải xuống các loại file như PDF, CAD, FZ, v.v., với giao diện thân thiện và đáp ứng. Ứng dụng sử dụng thiết kế hiện đại với Tailwind CSS, chức năng tìm kiếm hiệu quả nhờ Fuse.js và phân trang phía client để tối ưu hiệu suất.

## Tính năng

- **Giao diện đáp ứng**: Được xây dựng với Tailwind CSS, ứng dụng hoạt động mượt mà trên mọi thiết bị.
- **Tìm kiếm thông minh**: Sử dụng Fuse.js cho tìm kiếm mờ, cho phép tìm file theo tên, loại (PDF, CAD, FZ) hoặc kích thước với đánh dấu từ khóa.
- **Biểu tượng loại file**: Hiển thị biểu tượng phù hợp cho các loại file (PDF, RAR, ZIP, CAD, v.v.) để dễ nhận diện.
- **Phân trang phía client**: Hỗ trợ phân trang với số lượng file mỗi trang có thể tùy chỉnh (mặc định: 20).
- **Giao diện skeleton khi tải**: Hiển thị giao diện skeleton trong khi tải dữ liệu để cải thiện trải nghiệm người dùng.
- **Bộ nhớ đệm**: Sử dụng bộ nhớ đệm trong RAM cho kết quả tìm kiếm và dữ liệu file để tăng hiệu suất.
- **Xử lý lỗi**: Hiển thị thông báo lỗi thân thiện khi gặp sự cố mạng hoặc dữ liệu.
- **Nút lên đầu trang**: Cung cấp nút tiện lợi để quay lại đầu trang.
- **Tìm kiếm tối ưu**: Tối ưu tìm kiếm với cơ chế debounce 300ms để giảm xử lý không cần thiết.
- **Bản địa hóa tiếng Việt**: Giao diện và placeholder được tối ưu cho người dùng Việt Nam.

## Công nghệ sử dụng

- **HTML5**: Cấu trúc của ứng dụng web.
- **Tailwind CSS**: Dùng để tạo kiểu và thiết kế đáp ứng.
- **JavaScript**: Xử lý logic tìm kiếm, phân trang và hiển thị động.
- **Fuse.js**: Cung cấp chức năng tìm kiếm mờ.
- **Fetch API**: Tải file JSON dữ liệu.
- **Biểu tượng tùy chỉnh**: Biểu tượng cục bộ cho các loại file khác nhau.

## Cài đặt

1. **Sao chép kho lưu trữ**:
   ```bash
   git clone https://github.com/your-username/FREESCHEMATICVIETNAM.git
   cd FREESCHEMATICVIETNAM
   ```

2. **Thiết lập server cục bộ**:
   Vì ứng dụng sử dụng Fetch API để tải file JSON, bạn cần chạy ứng dụng qua HTTP. Có thể sử dụng server đơn giản như `http-server` hoặc server tích hợp của Python:
   ```bash
   # Sử dụng Python
   python -m http.server 8000
   ```
   hoặc
   ```bash
   # Sử dụng http-server của npm
   npm install -g http-server
   http-server
   ```

3. **Chuẩn bị file dữ liệu**:
   - Tạo file `filelist.json` trong thư mục gốc, liệt kê các file JSON chứa dữ liệu sơ đồ.
   - Ví dụ `filelist.json`:
     ```json
     [
       "data/schematics1.json",
       "data/schematics2.json"
     ]
     ```
   - Mỗi file JSON (ví dụ: `schematics1.json`) phải chứa mảng các đối tượng với chi tiết file:
     ```json
     [
       { "name": "Schematic1.pdf", "size": "1.2 MB", "url": "https://example.com/schematic1.pdf" },
       { "name": "Schematic2.cad", "size": "3.5 MB", "url": "https://example.com/schematic2.cad" }
     ]
     ```

4. **Thêm biểu tượng**:
   - Đặt các biểu tượng loại file (ví dụ: `PDF.png`, `rar.png`, `cad.png`) vào thư mục `icons/`.
   - Đảm bảo biểu tượng `vietnam.png` có sẵn cho favicon và thanh điều hướng.

5. **Mở ứng dụng**:
   - Truy cập `http://localhost:8000` (hoặc cổng mà server của bạn cung cấp) trên trình duyệt.

## Cách sử dụng

1. **Tìm kiếm file**:
   - Nhập truy vấn tìm kiếm vào ô nhập liệu (ví dụ: tên file hoặc loại như "PDF", "CAD").
   - Tìm kiếm hỗ trợ khớp mờ và sắp xếp kết quả theo thứ tự bảng chữ cái.
   - Sử dụng nút xóa (X) để đặt lại tìm kiếm.

2. **Duyệt file**:
   - File được hiển thị dưới dạng lưới với thông tin như tên, loại và kích thước.
   - Nhấn vào liên kết "Tải file" để tải xuống (liên kết bị vô hiệu nếu không có URL).

3. **Phân trang**:
   - Sử dụng nút "Trước" và "Sau" để di chuyển giữa các trang kết quả.
   - Mỗi trang hiển thị tối đa 20 file (mặc định).

4. **Lên đầu trang**:
   - Nhấn nút "Lên đầu trang" ở góc dưới bên phải để quay lại đầu trang.

## Cấu trúc thư mục

```
FREESCHEMATICVIETNAM/
├── index.html          # File HTML chính
├── script.js           # Logic JavaScript cho tìm kiếm, phân trang và hiển thị
├── schematics1.json
├── schematics2.json
├── icons/              # Thư mục chứa biểu tượng loại file
│   ├── vietnam.png     # Biểu tượng favicon và thanh điều hướng
│   ├── PDF.png         # Biểu tượng cho file PDF
│   ├── rar.png         # Biểu tượng cho file RAR
│   ├── zip.png         # Biểu tượng cho file ZIP
│   ├── cad.png         # Biểu tượng cho file CAD
│   ├── tvw.png         # Biểu tượng cho file TVW
│   ├── Fz.png          # Biểu tượng cho file FZ
│   ├── brd.png         # Biểu tượng cho file BRD
│   ├── BDV.png         # Biểu tượng cho file BDV
│   ├── boardview.png   # Biểu tượng cho file BOARDVIEW
│   ├── file.png        # Biểu tượng dự phòng cho loại file không xác định
├── filelist.json       # Danh sách các file JSON dữ liệu
├── data/               # Thư mục chứa các file JSON sơ đồ
└── README.md           # File này
```

## Tùy chỉnh

- **Số file mỗi trang**: Thay đổi hằng số `filesPerPage` trong `script.js` để điều chỉnh số file hiển thị mỗi trang.
- **Ngưỡng tìm kiếm**: Điều chỉnh giá trị `threshold` trong `fuseOptions` để thay đổi độ nghiêm ngặt của tìm kiếm.
- **Kích thước bộ nhớ đệm**: Cập nhật `maxCacheSize` trong `script.js` để kiểm soát số lượng kết quả tìm kiếm được lưu.
- **Tùy chỉnh giao diện**: Sửa các lớp Tailwind hoặc CSS nội tuyến trong `index.html` để thay đổi giao diện.
- **Biểu tượng**: Thay thế hoặc thêm biểu tượng mới vào thư mục `icons/` và cập nhật hàm `getFileIconPath` trong `script.js`.

## Lưu ý

- Ứng dụng yêu cầu `filelist.json` và các file JSON được truy cập qua HTTP. Đảm bảo cấu hình server hỗ trợ CORS nếu file được lưu trữ ở nơi khác.
- Tìm kiếm không phân biệt hoa thường và hỗ trợ dấu tiếng Việt thông qua chuẩn hóa văn bản.
- Ứng dụng xử lý phía client, vì vậy dữ liệu lớn có thể ảnh hưởng đến hiệu suất trên thiết bị yếu.

## Đóng góp

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng mở một issue hoặc gửi pull request để cải thiện hoặc sửa lỗi.
