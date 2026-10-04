/**
 * main.js 契約測試：先執行 config.js 再執行 main.js 後，CONFIG 的值應注入帶 data-config-* 的元素
 * 在同一 scope 依序執行兩支腳本，模擬瀏覽器載入順序
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { describe, it, expect, beforeEach } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configCode = readFileSync(join(__dirname, '../../assets/js/config.js'), 'utf8');
const mainCode = readFileSync(join(__dirname, '../../assets/js/main.js'), 'utf8');

// 回傳 config.js 的 CONFIG，供斷言比對
function runConfigAndMain() {
  return new Function(configCode + mainCode + '\nreturn CONFIG;')();
}

describe('main.js', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <strong id="footer-server-ip" data-config-text="serverIP">old-ip</strong>
      <span class="btn__ip" data-config-text="serverIP">old-ip</span>
      <a id="footer-email" href="#" data-config-mailto="email">...</a>
      <a id="nav-discord" href="#" data-config-href="discordLink">Discord</a>
      <a id="sponsor-cta-link" href="#" data-config-href="discordLink">CTA</a>
      <a id="unknown-key" href="/keep" data-config-href="noSuchKey">keep</a>
    `;
  });

  it('所有 data-config-text="serverIP" 都應顯示 CONFIG.serverIP', () => {
    const config = runConfigAndMain();
    document.querySelectorAll('[data-config-text="serverIP"]').forEach((el) => {
      expect(el.textContent).toBe(config.serverIP);
    });
  });

  it('data-config-mailto 應顯示信箱並設 mailto 連結', () => {
    const config = runConfigAndMain();
    const email = document.getElementById('footer-email');
    expect(email.textContent).toBe(config.email);
    expect(email.getAttribute('href')).toBe('mailto:' + config.email);
  });

  it('所有 data-config-href="discordLink" 都應連到 CONFIG.discordLink', () => {
    const config = runConfigAndMain();
    expect(document.getElementById('nav-discord').getAttribute('href')).toBe(config.discordLink);
    expect(document.getElementById('sponsor-cta-link').getAttribute('href')).toBe(config.discordLink);
  });

  it('CONFIG 沒有的 key 應保留 HTML 原本的值', () => {
    runConfigAndMain();
    expect(document.getElementById('unknown-key').getAttribute('href')).toBe('/keep');
  });

  it('頁面缺少佔位元素時不應拋錯', () => {
    document.body.innerHTML = '';
    expect(() => runConfigAndMain()).not.toThrow();
  });
});
