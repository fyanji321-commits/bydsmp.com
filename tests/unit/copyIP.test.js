/**
 * copyIP.js 單元測試
 * 測試複製 IP 功能、toast 顯示/隱藏、防抖保護與 clipboard fallback
 *
 * 策略：readFileSync + new Function 在 jsdom 全域執行 IIFE，
 * 不修改原始碼，全域 CONFIG / navigator / document 由 jsdom 提供。
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const copyIPCode = readFileSync(
  join(__dirname, '../../assets/js/modules/copyIP.js'),
  'utf8'
);

const FIXTURE_HTML = `
  <button class="ip-box" type="button">立即遊玩</button>
  <div id="copy-toast" class="copy-toast"></div>
`;

function runCopyIP() {
  // new Function 在 jsdom globalThis 作用域執行；
  // CONFIG / document / navigator / setTimeout 均由 jsdom 提供。
  new Function(copyIPCode)();
}

describe('copyIP', () => {
  beforeEach(() => {
    document.body.innerHTML = FIXTURE_HTML;
    window.CONFIG = { serverIP: 'bydsmp.com', copyResetDelay: 3000 };

    // 模擬 Clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true,
    });

    runCopyIP();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('點擊後應呼叫 clipboard.writeText 並傳入 serverIP', async () => {
    document.querySelector('.ip-box').click();
    await Promise.resolve(); // 等待 async click handler 微任務
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('bydsmp.com');
  });

  it('複製成功後 toast 應加上 is-visible class', async () => {
    document.querySelector('.ip-box').click();
    await Promise.resolve();
    expect(document.getElementById('copy-toast').classList.contains('is-visible')).toBe(true);
  });

  it('Toast 應在 copyResetDelay 後自動隱藏', async () => {
    vi.useFakeTimers();
    document.querySelector('.ip-box').click();
    await Promise.resolve(); // 讓 clipboard promise resolve

    const toast = document.getElementById('copy-toast');
    expect(toast.classList.contains('is-visible')).toBe(true);

    vi.advanceTimersByTime(3000);
    expect(toast.classList.contains('is-visible')).toBe(false);
  });

  it('Toast 顯示期間再次點擊應被忽略（isCopying 防抖）', async () => {
    const ipBox = document.querySelector('.ip-box');
    ipBox.click();
    await Promise.resolve();
    ipBox.click();
    await Promise.resolve();
    // clipboard.writeText 只應被呼叫一次
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
  });

  it('clipboard API 失敗時應嘗試 execCommand fallback', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {}); // 預期的「無法複製文字」不輸出 stderr
    navigator.clipboard.writeText = vi.fn().mockRejectedValue(new Error('denied'));
    // jsdom 沒有 document.execCommand，先掛上 mock 再 spy
    if (typeof document.execCommand !== 'function') {
      document.execCommand = vi.fn().mockReturnValue(true);
    }
    const execSpy = vi.spyOn(document, 'execCommand').mockReturnValue(true);

    document.querySelector('.ip-box').click();
    await Promise.resolve(); // clipboard rejected
    await Promise.resolve(); // catch block runs

    expect(execSpy).toHaveBeenCalledWith('copy');
  });

  it('fallback 成功時 toast 應顯示', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    navigator.clipboard.writeText = vi.fn().mockRejectedValue(new Error('denied'));
    if (typeof document.execCommand !== 'function') {
      document.execCommand = vi.fn().mockReturnValue(true);
    }
    vi.spyOn(document, 'execCommand').mockReturnValue(true);

    document.querySelector('.ip-box').click();
    await Promise.resolve();
    await Promise.resolve();

    expect(document.getElementById('copy-toast').classList.contains('is-visible')).toBe(true);
  });
});
