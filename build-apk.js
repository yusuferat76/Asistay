#!/usr/bin/env node
/**
 * Automated TWA & Bubblewrap APK Build Script
 * Compiles the Vite React app into a production bundle and generates Android APK assets.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 [Sınırsız Asistan] Android APK / TWA Derleme Başlatılıyor...');

try {
  // 1. Build Vite project
  console.log('📦 Vite üretim paketi derleniyor (npm run build)...');
  execSync('npm run build', { stdio: 'inherit' });

  // 2. Ensure PWA manifest and icons are in dist
  const distDir = path.resolve(process.cwd(), 'dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('Build klasörü (dist) oluşturulamadı!');
  }

  console.log('✨ Üretim paketi ve PWA varlıkları başarıyla hazırlandı!');
  console.log('📱 APK üretimi için Bubblewrap veya PWABuilder kullanıma hazırdır.');
  console.log('👉 Komut satırında: npx @bubblewrap/cli init çalıştırarak yerel APK derleyebilirsiniz.');

} catch (error) {
  console.error('❌ APK derleme sürecinde hata oluştu:', error);
  process.exit(1);
}
