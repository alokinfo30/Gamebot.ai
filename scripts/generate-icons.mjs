import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Helper: Calculate CRC32 for PNG chunks
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// Generate raw RGBA buffer with GAMEBOT.AI futuristic glowing icon
function generateGamebotIconBuffer(width, height) {
  const rowSize = 1 + width * 4;
  const raw = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.42;
  const cornerRadius = width * 0.22;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    raw[rowOffset] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      
      // Calculate distance to center
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Rounded rectangle for icon background
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      const boxW = width * 0.44;
      const boxH = height * 0.44;

      let inBox = false;
      if (absX <= boxW && absY <= boxH) {
        if (absX > boxW - cornerRadius && absY > boxH - cornerRadius) {
          const cornerDist = Math.hypot(absX - (boxW - cornerRadius), absY - (boxH - cornerRadius));
          inBox = cornerDist <= cornerRadius;
        } else {
          inBox = true;
        }
      }

      if (!inBox) {
        // Transparent outer border
        raw[pxOffset + 0] = 0;
        raw[pxOffset + 1] = 0;
        raw[pxOffset + 2] = 0;
        raw[pxOffset + 3] = 0;
        continue;
      }

      // Background Gradient: Deep Slate to Vibrant Indigo / Purple
      const gradT = (x + y) / (width + height);
      let r = Math.floor(15 + gradT * 60);
      let g = Math.floor(23 + gradT * 40);
      let b = Math.floor(42 + gradT * 180);
      let a = 255;

      // Draw Inner Glowing Dice & AI Bot Motif
      // Outer Dice Diamond / Cube
      const diceSize = width * 0.24;
      const inDice = Math.abs(dx) + Math.abs(dy) <= diceSize;

      // Dice Border Glow
      const borderDist = Math.abs((Math.abs(dx) + Math.abs(dy)) - diceSize);
      if (borderDist < width * 0.025) {
        r = 56;  // Cyan glow #38bdf8
        g = 189;
        b = 248;
      } else if (inDice) {
        // Indigo / Cyan core
        const coreT = (y - cy) / diceSize;
        r = Math.floor(79 + coreT * 30);
        g = Math.floor(70 + coreT * 20);
        b = Math.floor(229 + coreT * 20);

        // Dice Pips (5 dots pattern)
        const pipRadius = width * 0.026;
        const pipOffsets = [
          [0, 0],
          [-diceSize * 0.45, -diceSize * 0.45],
          [diceSize * 0.45, -diceSize * 0.45],
          [-diceSize * 0.45, diceSize * 0.45],
          [diceSize * 0.45, diceSize * 0.45],
        ];

        for (const [pox, poy] of pipOffsets) {
          const pdist = Math.hypot(dx - pox, dy - poy);
          if (pdist <= pipRadius) {
            r = 255; // Crisp White Glowing Pip
            g = 255;
            b = 255;
          }
        }
      }

      // Modern Gaming Star Accent on Top-Right
      const starDx = x - (cx + width * 0.28);
      const starDy = y - (cy - height * 0.28);
      const starDist = Math.hypot(starDx, starDy);
      if (starDist < width * 0.05) {
        r = 251; // Amber Gold Sparkle #fbbf24
        g = 191;
        b = 36;
      }

      raw[pxOffset + 0] = r;
      raw[pxOffset + 1] = g;
      raw[pxOffset + 2] = b;
      raw[pxOffset + 3] = a;
    }
  }

  return raw;
}

function createPng(width, height) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);  // bit depth
  ihdrData.writeUInt8(6, 9);  // color type RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT chunk
  const rawData = generateGamebotIconBuffer(width, height);
  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate multi-resolution ICO file
function createIco(png32, png16) {
  const count = 2;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(count, 4); // Number of images

  const dirEntrySize = 16;
  const offset0 = 6 + count * dirEntrySize;
  const offset1 = offset0 + png32.length;

  const entry0 = Buffer.alloc(16);
  entry0.writeUInt8(32, 0); // Width
  entry0.writeUInt8(32, 1); // Height
  entry0.writeUInt8(0, 2);  // Colors
  entry0.writeUInt8(0, 3);  // Reserved
  entry0.writeUInt16LE(1, 4); // Color planes
  entry0.writeUInt16LE(32, 6); // Bits per pixel
  entry0.writeUInt32LE(png32.length, 8); // Size
  entry0.writeUInt32LE(offset0, 12); // Offset

  const entry1 = Buffer.alloc(16);
  entry1.writeUInt8(16, 0);
  entry1.writeUInt8(16, 1);
  entry1.writeUInt8(0, 2);
  entry1.writeUInt8(0, 3);
  entry1.writeUInt16LE(1, 4);
  entry1.writeUInt16LE(32, 6);
  entry1.writeUInt32LE(png16.length, 8);
  entry1.writeUInt32LE(offset1, 12);

  return Buffer.concat([header, entry0, entry1, png32, png16]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA and Favicon assets...');

// Generate 192x192 and 512x512
const png192 = createPng(192, 192);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);
console.log('✓ Created public/pwa-192x192.png');

const png512 = createPng(512, 512);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
console.log('✓ Created public/pwa-512x512.png');

// Generate 32x32 and 16x16 for ICO
const png32 = createPng(32, 32);
const png16 = createPng(16, 16);
const icoBuffer = createIco(png32, png16);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
console.log('✓ Created public/favicon.ico');

// Generate favicon.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#4338ca"/>
    </linearGradient>
    <linearGradient id="diceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#bg)"/>
  <rect x="156" y="156" width="200" height="200" rx="36" transform="rotate(45 256 256)" fill="url(#diceGrad)" stroke="#38bdf8" stroke-width="8"/>
  <circle cx="256" cy="256" r="16" fill="#ffffff"/>
  <circle cx="206" cy="206" r="14" fill="#ffffff"/>
  <circle cx="306" cy="206" r="14" fill="#ffffff"/>
  <circle cx="206" cy="306" r="14" fill="#ffffff"/>
  <circle cx="306" cy="306" r="14" fill="#ffffff"/>
  <polygon points="380,100 395,135 430,150 395,165 380,200 365,165 330,150 365,135" fill="#fbbf24"/>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent.trim());
console.log('✓ Created public/favicon.svg');

// Generate robots.txt
const robotsTxt = `User-agent: *
Allow: /
Sitemap: https://gamebotai.netlify.app/sitemap.xml
`;
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt.trim());
console.log('✓ Created public/robots.txt');

console.log('All static PWA & Favicon assets successfully generated!');
