import os
import json

# Lấy đường dẫn thư mục hiện tại của file script
base_dir = os.path.dirname(os.path.abspath(__file__))

# Mở file với đường dẫn tuyệt đối
with open(os.path.join(base_dir, 'namelink.txt'), 'r', encoding='utf-8') as f_name:
    names = [line.strip() for line in f_name]

with open(os.path.join(base_dir, 'link.txt'), 'r', encoding='utf-8') as f_link:
    links = [line.strip() for line in f_link]

if len(names) != len(links):
    raise ValueError("Số dòng trong namelink.txt và link.txt không khớp!")

result = [
    {"id": i + 1, "name": names[i], "url": links[i]}
    for i in range(len(names))
]

with open(os.path.join(base_dir, 'sodo.json'), 'w', encoding='utf-8') as f_out:
    json.dump(result, f_out, ensure_ascii=False, indent=2)

print("✅ Đã tạo file sodo.json thành công.")
