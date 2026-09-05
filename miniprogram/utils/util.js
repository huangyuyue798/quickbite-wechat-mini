// 通用工具函数

// 金额格式化：9 -> 9.00
function formatPrice(price) {
  return (Number(price) || 0).toFixed(2);
}

// 时间格式化：2026-09-05 12:30
function formatTime(value) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// 月售格式化：1260 -> 1260+，12000 -> 1.2万
function formatSales(sales) {
  const n = Number(sales) || 0;
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  return String(n);
}

// 防抖
function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

module.exports = {
  formatPrice,
  formatTime,
  formatSales,
  debounce
};
