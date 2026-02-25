/**
 * main.js 契約測試：先執行 config.js 再執行 main.js 後，window.CONFIG 應與 CONFIG 一致
 * 在同一 scope 依序執行兩支腳本，模擬瀏覽器載入順序
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { describe, it, expect } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, '../../assets/js/config.js');
const mainPath = join(__dirname, '../../assets/js/main.js');

const configCode = readFileSync(configPath, 'utf8');
const mainCode = readFileSync(mainPath, 'utf8');

describe('main.js', () => {
  it('執行 config 後再執行 main，window.CONFIG 應存在', () => {
    const window = {};
    const fn = new Function('window', configCode + mainCode);
    fn(window);
    expect(window.CONFIG).toBeDefined();
  });

  it('window.CONFIG 應包含 serverIP', () => {
    const window = {};
    const fn = new Function('window', configCode + mainCode);
    fn(window);
    expect(window.CONFIG.serverIP).toBeDefined();
    expect(typeof window.CONFIG.serverIP).toBe('string');
  });
});
