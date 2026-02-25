/**
 * CONFIG 契約測試：確保 assets/js/config.js 存在且具備必要欄位與型別
 * 以讀檔 + 執行方式取得 CONFIG，不修改原始碼
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { describe, it, expect } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, '../../assets/js/config.js');

function loadCONFIG() {
  const code = readFileSync(configPath, 'utf8');
  const fn = new Function(code + '; return typeof CONFIG !== "undefined" ? CONFIG : undefined;');
  return fn();
}

describe('CONFIG (config.js)', () => {
  it('應存在且為物件', () => {
    const CONFIG = loadCONFIG();
    expect(CONFIG).toBeDefined();
    expect(typeof CONFIG).toBe('object');
    expect(CONFIG).not.toBeNull();
  });

  it('應包含伺服器資訊：serverIP、serverName', () => {
    const CONFIG = loadCONFIG();
    expect(CONFIG.serverIP).toBeDefined();
    expect(CONFIG.serverName).toBeDefined();
    expect(typeof CONFIG.serverIP).toBe('string');
    expect(typeof CONFIG.serverName).toBe('string');
  });

  it('應包含外部連結：discordLink、email', () => {
    const CONFIG = loadCONFIG();
    expect(CONFIG.discordLink).toBeDefined();
    expect(CONFIG.email).toBeDefined();
    expect(typeof CONFIG.discordLink).toBe('string');
    expect(typeof CONFIG.email).toBe('string');
  });

  it('應包含 backgroundImages 陣列', () => {
    const CONFIG = loadCONFIG();
    expect(Array.isArray(CONFIG.backgroundImages)).toBe(true);
  });

  it('應包含數值型設定：sliderInterval、copyResetDelay、galleryInterval、galleryTransitionDuration', () => {
    const CONFIG = loadCONFIG();
    expect(typeof CONFIG.sliderInterval).toBe('number');
    expect(typeof CONFIG.copyResetDelay).toBe('number');
    expect(typeof CONFIG.galleryInterval).toBe('number');
    expect(typeof CONFIG.galleryTransitionDuration).toBe('number');
  });

  it('應包含布林型設定：galleryAutoPlay、galleryPauseOnHover', () => {
    const CONFIG = loadCONFIG();
    expect(typeof CONFIG.galleryAutoPlay).toBe('boolean');
    expect(typeof CONFIG.galleryPauseOnHover).toBe('boolean');
  });
});
