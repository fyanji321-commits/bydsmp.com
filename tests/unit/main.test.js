/**
 * main.js 契約測試：先執行 config.js 再執行 main.js 後，CONFIG 的值應注入共用 DOM 佔位元素
 * 在同一 scope 依序執行兩支腳本，模擬瀏覽器載入順序
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { describe, it, expect, beforeEach } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, '../../assets/js/config.js');
const mainPath = join(__dirname, '../../assets/js/main.js');

const configCode = readFileSync(configPath, 'utf8');
const mainCode = readFileSync(mainPath, 'utf8');

// 回傳 config.js 的 CONFIG，供斷言比對
function runConfigAndMain() {
  return new Function(configCode + mainCode + '\nreturn CONFIG;')();
}

describe('main.js', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <strong id="footer-server-ip"></strong>
      <a id="footer-email" href="#">...</a>
      <a id="nav-discord-btn-hero" href="#">Discord</a>
      <a id="sponsor-cta-link" href="#">CTA</a>
    `;
  });

  it('頁尾應顯示 CONFIG.serverIP', () => {
    const config = runConfigAndMain();
    expect(document.getElementById('footer-server-ip').textContent).toBe(config.serverIP);
  });

  it('頁尾信箱應顯示 CONFIG.email 並設 mailto 連結', () => {
    const config = runConfigAndMain();
    const email = document.getElementById('footer-email');
    expect(email.textContent).toBe(config.email);
    expect(email.getAttribute('href')).toBe('mailto:' + config.email);
  });

  it('Hero 與贊助頁 CTA 應連到 CONFIG.discordLink', () => {
    const config = runConfigAndMain();
    expect(document.getElementById('nav-discord-btn-hero').getAttribute('href')).toBe(config.discordLink);
    expect(document.getElementById('sponsor-cta-link').getAttribute('href')).toBe(config.discordLink);
  });

  it('頁面缺少佔位元素時不應拋錯', () => {
    document.body.innerHTML = '';
    expect(() => runConfigAndMain()).not.toThrow();
  });
});
