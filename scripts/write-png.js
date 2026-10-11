#!/usr/bin/env node
const fs = require('fs');
const zlib = require('zlib');

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function png(size, paint) {
  const row = Buffer.alloc(1 + size * 4);
  const raw = [];
  for (let y = 0; y < size; y++) {
    row[0] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = paint(x, y, size);
      const i = 1 + x * 4;
      row[i] = r; row[i + 1] = g; row[i + 2] = b; row[i + 3] = a;
    }
    raw.push(row);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const idat = zlib.deflateSync(Buffer.concat(raw), { level: 9 });
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

function iconPaint(x, y, size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;
  const dx = x + 0.5 - cx;
  const dy = y + 0.5 - cy;
  const inRound = dx * dx + dy * dy <= r * r;
  if (!inRound) return [0, 0, 0, 0];
  const accent = [15, 157, 118, 255];
  const mint = [94, 224, 181, 255];
  const ink = [20, 33, 61, 255];
  if (dy < -size * 0.05 && Math.abs(dx) < size * 0.12) return mint;
  if (dx > size * 0.18 && dy < -size * 0.12) return accent;
  return ink;
}

const out = process.argv[2];
const size = Number(process.argv[3] || 32);
fs.writeFileSync(out, png(size, iconPaint));
console.log('wrote', out, size + 'x' + size);
