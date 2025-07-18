import { readFileSync } from 'fs';
import { gzipSizeSync } from 'gzip-size';
import { resolve } from 'path';

const MAX_SIZE_BYTES = 6 * 1024; // 6 KB

const bundlePath = resolve(process.cwd(), 'dist', 'index.js');

try {
  const content = readFileSync(bundlePath, 'utf8');
  const gzipSize = gzipSizeSync(content);
  
  console.log(`Bundle size: ${(gzipSize / 1024).toFixed(2)} KB gzipped`);
  
  if (gzipSize > MAX_SIZE_BYTES) {
    console.error(`❌ Bundle size exceeds limit! ${gzipSize} > ${MAX_SIZE_BYTES} bytes`);
    process.exit(1);
  } else {
    console.log('✅ Bundle size within limit');
  }
} catch (error) {
  console.error('Failed to check bundle size:', error);
  process.exit(1);
} 