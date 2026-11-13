#!/usr/bin/env node
/**
 * Automated WebDev Android APK & TWA Build Script
 * Compiles the Vite React app into a production bundle and prepares Android APK manifests.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 [Asistay] WebDev Android APK / TWA Derleme Başlatılıyor...');

try {
  // 1. Build Vite project
  console.log('📦 Vite üretim paketi derleniyor (npm run build)...');
  execSync('npm run build', { stdio: 'inherit' });

  // 2. Ensure PWA manifest and dist folder exist
  const distDir = path.resolve(process.cwd(), 'dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('Build klasörü (dist) oluşturulamadı!');
  }

  // 3. Copy twa-manifest.json and build metadata into dist
  const twaSrc = path.resolve(process.cwd(), 'twa-manifest.json');
  if (fs.existsSync(twaSrc)) {
    fs.copyFileSync(twaSrc, path.join(distDir, 'twa-manifest.json'));
  }

  const buildMeta = {
    app: 'Asistay',
    version: '2.6.0',
    packageId: 'com.asistay.security.app',
    builtAt: new Date().toISOString(),
    webBundleReady: true,
    hasManifest: fs.existsSync(path.join(distDir, 'manifest.webmanifest')),
    hasTwaConfig: fs.existsSync(path.join(distDir, 'twa-manifest.json')),
  };
  fs.writeFileSync(
    path.join(distDir, 'android-build-status.json'),
    JSON.stringify(buildMeta, null, 2)
  );

  console.log('✨ Üretim paketi, PWA manifesti ve WebDev Android TWA yapılandırması hazır!');
  console.log('📲 APK üretimi için .github/workflows/android-apk.yml veya Bubblewrap CLI hazırdır.');
} catch (error) {
  console.error('❌ Android derleme sürecinde hata oluştu:', error);
  process.exit(1);
}
