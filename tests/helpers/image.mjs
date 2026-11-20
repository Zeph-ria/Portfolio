import { webpDimensions } from './webp.mjs';

// Inspect dimensions only; never transcode or strip metadata from an original.
export function imageDimensions(buffer) {
  if (buffer.length >= 24 && buffer.toString('hex', 0, 8) === '89504e470d0a1a0a') {
    if (buffer.readUInt32BE(8) !== 13 || buffer.toString('ascii', 12, 16) !== 'IHDR') throw new Error('Invalid PNG header');
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  return webpDimensions(buffer);
}
