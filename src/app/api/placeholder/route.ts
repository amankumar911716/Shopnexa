import { NextRequest, NextResponse } from 'next/server';

// Color palettes per category for beautiful placeholders
const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  'electronics': { bg: '#1e3a5f', text: '#64b5f6', icon: '📱' },
  'fashion': { bg: '#5c1a3a', text: '#f48fb1', icon: '👗' },
  'home-furniture': { bg: '#2e4a3e', text: '#81c784', icon: '🏠' },
  'home & furniture': { bg: '#2e4a3e', text: '#81c784', icon: '🏠' },
  'sports-fitness': { bg: '#3e2723', text: '#ffab91', icon: '💪' },
  'sports & fitness': { bg: '#3e2723', text: '#ffab91', icon: '💪' },
  'books-media': { bg: '#311b52', text: '#b39ddb', icon: '📚' },
  'books & media': { bg: '#311b52', text: '#b39ddb', icon: '📚' },
  'beauty-personal-care': { bg: '#4a1942', text: '#f06292', icon: '✨' },
  'beauty & personal care': { bg: '#4a1942', text: '#f06292', icon: '✨' },
  'toys-games': { bg: '#1a3c4a', text: '#4dd0e1', icon: '🎮' },
  'toys & games': { bg: '#1a3c4a', text: '#4dd0e1', icon: '🎮' },
  'grocery-gourmet': { bg: '#33691e', text: '#aed581', icon: '🛒' },
  'grocery & gourmet': { bg: '#33691e', text: '#aed581', icon: '🛒' },
};

const DEFAULT_COLORS = { bg: '#37474f', text: '#90a4ae', icon: '📦' };

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const text = searchParams.get('text') || 'Product';
  const category = (searchParams.get('category') || '').toLowerCase();
  const w = parseInt(searchParams.get('w') || '600', 10);
  const h = parseInt(searchParams.get('h') || '600', 10);

  const colors = CATEGORY_COLORS[category] || DEFAULT_COLORS;

  // Split text into lines if too long
  const maxCharsPerLine = Math.max(8, Math.floor(w / 40));
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
    } else if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  if (lines.length > 3) lines.splice(3);

  const lineHeight = Math.min(28, h / (lines.length + 4));
  const fontSize = lineHeight;
  const startY = h / 2 - ((lines.length - 1) * lineHeight) / 2 + 20;
  const iconSize = Math.min(60, h / 5);
  const iconY = startY - iconSize - 15;

  const textLines = lines
    .map((line, i) => `<text x="${w / 2}" y="${startY + i * lineHeight}" text-anchor="middle" fill="${colors.text}" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="600">${escapeXml(line)}</text>`)
    .join('\n          ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.bg}" />
      <stop offset="100%" stop-color="${adjustColor(colors.bg, -20)}" />
    </linearGradient>
    <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="${colors.text}" opacity="0.07" />
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)" />
  <rect width="${w}" height="${h}" fill="url(#dots)" />
  <text x="${w / 2}" y="${iconY}" text-anchor="middle" font-size="${iconSize}">${colors.icon}</text>
  ${textLines}
  <rect x="${w * 0.3}" y="${h * 0.85}" width="${w * 0.4}" height="3" rx="1.5" fill="${colors.text}" opacity="0.3" />
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
