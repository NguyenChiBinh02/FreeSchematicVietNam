let allFiles = [];
let filteredFiles = [];
let currentPage = 1;
let currentQuery = ''; // Lưu rawQuery toàn cục
const filesPerPage = 20;
const cache = new Map();
const maxSearchResults = 500;
const maxCacheSize = 50;

// Hàm tiện ích
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Giải mã HTML entities
const decodeHTMLEntities = (text) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

// Chuẩn hóa văn bản
const normalizeText = str => {
  if (typeof str !== 'string') return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\W_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Lấy phần mở rộng file
const getFileType = item => {
  const name = item.name || '';
  const extensionMatch = name.match(/\.([a-zA-Z0-9]+)$/i);
  return extensionMatch ? `File ${extensionMatch[1].toUpperCase()}` : 'File UNKNOWN';
};

// Lấy đường dẫn biểu tượng cục bộ
const getFileIconPath = (type) => {
  const normalizedType = type.toUpperCase().replace('FILE ', '');
  const icons = {
    PDF: 'icons/PDF.png',
    RAR: 'icons/rar.png',
    ZIP: 'icons/zip.png',
    CAD: 'icons/cad.png',
    TVW: 'icons/tvw.png',
    FZ: 'icons/Fz.png',
    BRD: 'icons/brd.png',
    BDV: 'icons/BDV.png',
    BOARDVIEW: 'icons/boardview.png',
    UNKNOWN: 'icons/file.png'
  };
  return icons[normalizedType] || icons.UNKNOWN;
};

// Highlight từ khóa
const highlightAllKeywords = (text, rawQuery) => {
  if (!rawQuery || !text) return text;
  const keywords = normalizeText(rawQuery).split(/\s+/).filter(Boolean);
  let result = text;
  keywords.forEach(keyword => {
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedKeyword.replace(/\s/g, '[\\s_-]?')})(?![^<]*>)`, 'ig');
    result = result.replace(regex, `<mark class="bg-yellow-200">$1</mark>`);
  });
  return result;
};

// Cấu hình Fuse.js
const fuseOptions = {
  keys: [
    { name: 'searchKey', weight: 0.8 },
    { name: 'fileType', weight: 0.15 },
    { name: 'size', weight: 0.05 }
  ],
  threshold: 0.2,
  ignoreLocation: true,
  minMatchCharLength: 1,
  useExtendedSearch: true,
  includeScore: true,
  includeMatches: false,
  distance: 1000,
  maxPatternLength: 32
};

// Kiểm tra thứ tự từ khóa
const checkKeywordOrder = (text, keywords) => {
  if (keywords.length < 2) return true;
  const normalizedText = normalizeText(text);
  const pattern = keywords.map(kw => normalizeText(kw).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[\\s_-]?');
  const regex = new RegExp(pattern, 'i');
  return regex.test(normalizedText);
};

// Cache tìm kiếm
const searchCache = new Map();

// Hiển thị skeleton UI
const showSkeleton = () => {
  const list = document.getElementById('fileList');
  list.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const div = document.createElement('div');
    div.className = 'bg-white p-4 rounded-lg shadow border border-gray-100';
    div.innerHTML = `
      <div class="flex items-start space-x-4">
        <div class="h-10 w-10 skeleton rounded"></div>
        <div class="flex-1 space-y-2">
          <div class="h-6 w-3/4 skeleton"></div>
          <div class="h-4 w-1/2 skeleton"></div>
          <div class="h-4 w-1/2 skeleton"></div>
          <div class="h-4 w-1/3 skeleton"></div>
        </div>
      </div>
    `;
    list.appendChild(div);
  }
};

// Hiển thị danh sách file
const displayFiles = (files, rawQuery = '') => {
  console.log('Displaying files, total:', files.length);
  const list = document.getElementById('fileList');
  list.innerHTML = '';
  
  if (!files.length) {
    list.innerHTML = '<p class="text-center text-gray-500 col-span-full">Không tìm thấy file.</p>';
    return;
  }

  const start = (currentPage - 1) * filesPerPage;
  const end = start + filesPerPage;
  const paginatedFiles = files.slice(start, end);

  const renderBatch = (items, index = 0) => {
    if (index >= items.length) {
      updatePagination();
      return;
    }
    const file = items[index];
    const name = highlightAllKeywords(decodeHTMLEntities(file.name || 'Không xác định'), rawQuery);
    const type = getFileType(file);
    const size = file.size || 'Không xác định';
    const div = document.createElement('div');
    div.className = 'bg-white p-4 rounded-lg shadow hover-scale border border-gray-100 schematic-card';
    div.innerHTML = `
      <div class="flex items-start space-x-4">
        <div class="flex-shrink-0">
          <img src="${getFileIconPath(type)}" alt="Biểu tượng ${type}" class="h-10 w-10">
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-lg font-semibold truncate" title="${file.name}">${name}</h2>
          <p class="text-sm text-gray-500">Loại: ${type}</p>
          <p class="text-sm text-gray-500">Dung lượng: ${size}</p>
          <a href="${file.url || '#'}" target="_blank" 
             class="text-blue-500 hover:underline mt-2 inline-block rounded" 
             ${!file.url ? 'pointer-events-none opacity-50' : ''}>
             Tải file
          </a>
        </div>
      </div>
    `;
    list.appendChild(div);
    requestAnimationFrame(() => renderBatch(items, index + 1));
  };

  renderBatch(paginatedFiles);
};

// Cập nhật phân trang
const updatePagination = () => {
  const totalPages = Math.ceil(filteredFiles.length / filesPerPage);
  document.getElementById('pageInfo').textContent = `Trang ${currentPage} / ${totalPages}`;
  const prevButton = document.querySelector('button[onclick="prevPage()"]');
  const nextButton = document.querySelector('button[onclick="nextPage()"]');
  if (prevButton) prevButton.disabled = currentPage === 1;
  if (nextButton) nextButton.disabled = currentPage === totalPages;
};

// Tải dữ liệu
const loadData = async () => {
  const loading = document.getElementById('loading');
  const list = document.getElementById('fileList');
  loading.classList.remove('hidden');
  showSkeleton();

  try {
    console.log('Fetching filelist.json...');
    const response = await fetch('filelist.json');
    if (!response.ok) throw new Error(`Lỗi HTTP khi lấy filelist.json: ${response.status}`);
    const fileList = await response.json();
    console.log('File list loaded:', fileList);

    if (!Array.isArray(fileList) || !fileList.length) {
      throw new Error('Danh sách file trống hoặc không đúng định dạng');
    }

    const jsonFiles = fileList.filter(file => file.endsWith('.json'));
    if (!jsonFiles.length) {
      throw new Error('Không tìm thấy file .json nào trong danh sách');
    }

    const filePromises = jsonFiles.map(async (file) => {
      if (cache.has(file)) {
        console.log(`Using cached data for ${file}`);
        return cache.get(file);
      }
      try {
        console.log(`Fetching ${file}...`);
        const response = await fetch(file);
        if (!response.ok) throw new Error(`Lỗi HTTP khi lấy file ${file}: ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error(`Dữ liệu trong ${file} không đúng định dạng`);
        cache.set(file, data);
        console.log(`Loaded ${file}: ${data.length} items`);
        return data;
      } catch (error) {
        console.error(`Lỗi khi đọc file ${file}:`, error);
        return [];
      }
    });

    allFiles = (await Promise.all(filePromises)).flat().map(item => ({
      ...item,
      name: decodeHTMLEntities(item.name || 'Không xác định'),
      searchKey: normalizeText(item.name || ''),
      fileType: normalizeText(getFileType(item).replace('File ', '')),
      size: item.size || 'Không xác định',
      url: item.url || ''
    }));

    if (!allFiles.length) {
      throw new Error('Không có dữ liệu hợp lệ từ các file');
    }

    filteredFiles = [...allFiles];
    window.fuse = new Fuse(allFiles, fuseOptions);
    displayFiles(filteredFiles);
  } catch (error) {
    console.error('Lỗi tải dữ liệu:', error);
    list.innerHTML = `
      <p class="text-red-500 text-center col-span-full error-message">
        Lỗi: Không thể tải dữ liệu. Vui lòng kiểm tra kết nối hoặc file filelist.json.
      </p>`;
  } finally {
    loading.classList.add('hidden');
  }
};

// Xử lý tìm kiếm
const handleSearch = debounce(async (rawQuery) => {
  currentQuery = rawQuery; // Lưu rawQuery
  const query = normalizeText(rawQuery);
  const list = document.getElementById('fileList');

  if (!allFiles.length) {
    list.innerHTML = '<p class="text-center text-gray-500 col-span-full">Dữ liệu chưa được tải.</p>';
    return;
  }

  if (!query) {
    searchCache.clear();
    filteredFiles = [...allFiles];
    currentPage = 1;
    displayFiles(filteredFiles, rawQuery);
    return;
  }

  if (searchCache.has(query)) {
    filteredFiles = searchCache.get(query);
    currentPage = 1;
    displayFiles(filteredFiles, rawQuery);
    return;
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 0));
    const keywords = query.split(/\s+/).filter(Boolean);
    const searchQuery = keywords.map(kw => `'${kw}`).join(' ');

    const processBatch = (items, batchSize = 1000) => {
      const results = [];
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        results.push(...batch.filter(item => checkKeywordOrder(item.name, keywords)));
      }
      return results;
    };

    let results = window.fuse.search(searchQuery)
      .slice(0, maxSearchResults)
      .map(r => r.item);

    if (keywords.length >= 2) {
      results = processBatch(results);
    }

    if (!results.length) {
      results = window.fuse.search(searchQuery)
        .slice(0, maxSearchResults)
        .map(r => r.item);
    }

    results.sort((a, b) => a.name.localeCompare(b.name));

    searchCache.set(query, results);
    if (searchCache.size > maxCacheSize) {
      searchCache.delete(searchCache.keys().next().value);
    }

    filteredFiles = results;
    currentPage = 1;
    displayFiles(filteredFiles, rawQuery);
  } catch (error) {
    console.error('Lỗi tìm kiếm:', error);
    list.innerHTML = '<p class="text-red-500 text-center col-span-full">Lỗi tìm kiếm. Vui lòng thử lại.</p>';
  }
}, 300);

// Gắn sự kiện
document.getElementById('searchInput').addEventListener('input', e => {
  const clearButton = document.getElementById('clearSearch');
  clearButton.classList.toggle('hidden', !e.target.value);
  handleSearch(e.target.value.trim());
  console.log('Search input value:', e.target.value);
});

document.getElementById('clearSearch').addEventListener('click', () => {
  const searchInput = document.getElementById('searchInput');
  searchInput.value = '';
  searchInput.focus();
  handleSearch('');
});

// Phân trang
function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    displayFiles(filteredFiles, currentQuery); // Truyền currentQuery
    scrollToTop();
  }
}

function nextPage() {
  if (currentPage < Math.ceil(filteredFiles.length / filesPerPage)) {
    currentPage++;
    displayFiles(filteredFiles, currentQuery); // Truyền currentQuery
    scrollToTop();
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Khởi động
document.addEventListener('DOMContentLoaded', () => {
  console.log('Starting to load file list...');
  loadData();
});