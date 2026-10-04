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

  it('copyResetDelay 應為正數（Toast 顯示時間）', () => {
    const CONFIG = loadCONFIG();
    expect(typeof CONFIG.copyResetDelay).toBe('number');
    expect(CONFIG.copyResetDelay).toBeGreaterThan(0);
  });

  it('不應殘留已移除功能的設定（相簿輪播、背景輪播）', () => {
    const CONFIG = loadCONFIG();
    ['backgroundImages', 'sliderInterval', 'galleryAutoPlay', 'galleryInterval',
     'galleryTransitionDuration', 'galleryPauseOnHover'].forEach((key) => {
      expect(CONFIG).not.toHaveProperty(key);
    });
  });
});
