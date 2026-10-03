/**
 * Indian Standard Time (IST) formatting utility for React frontend
 * Always enforces Asia/Kolkata timezone (UTC+05:30)
 */

export function formatIST(dateInput, includeDate = true) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const options = {
    timeZone: 'Asia/Kolkata',
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };

  if (includeDate) {
    options.day = '2-digit';
    options.month = 'short';
    options.year = 'numeric';
  }

  // Format as: 29 Sept 2026, 02:15:30 pm IST
  return d.toLocaleString('en-IN', options) + ' IST';
}

export function getCurrentISTClock() {
  const d = new Date();
  return d.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }) + ' IST';
}
