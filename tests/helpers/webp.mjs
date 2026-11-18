// Read intrinsic dimensions from the container without decoding or modifying it.
// Supports the three still-image headers found in WebP (VP8, VP8L and VP8X).
export function webpDimensions(buffer) {
  if (buffer.length < 20 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error('Not a WebP container');
  }
  for (let offset = 12; offset + 8 <= buffer.length;) {
    const kind = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (start + size > buffer.length) throw new Error('Truncated WebP chunk');
    if (kind === 'VP8X' && size >= 10) return { width: buffer.readUIntLE(start + 4, 3) + 1, height: buffer.readUIntLE(start + 7, 3) + 1 };
    if (kind === 'VP8 ' && size >= 10 && buffer.toString('hex', start + 3, start + 6) === '9d012a') {
      return { width: buffer.readUInt16LE(start + 6) & 0x3fff, height: buffer.readUInt16LE(start + 8) & 0x3fff };
    }
    if (kind === 'VP8L' && size >= 5 && buffer[start] === 0x2f) {
      const packed = buffer.readUInt32LE(start + 1);
      return { width: (packed & 0x3fff) + 1, height: ((packed >>> 14) & 0x3fff) + 1 };
    }
    offset = start + size + (size % 2);
  }
  throw new Error('WebP dimensions not found');
}
