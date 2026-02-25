/**
 * copyIP.js 整合測試
 * 驗證：點擊複製 IP、Toast 顯示/隱藏、防抖保護、Clipboard API 不可用時的 fallback
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(__dirname, '../fixtures/copyIP.html');
const modulePath = join(__dirname, '../../assets/js/modules/copyIP.js');

const fixtureHTML = readFileSync(fixturePath, 'utf8');
const copyIPCode = readFileSync(modulePath, 'utf8');

function buildMockNavigator(resolves = true) {
  const writeText = resolves
    ? vi.fn().mockResolvedValue(undefined)
    : vi.fn().mockRejectedValue(new Error('NotAllowedError'));
  return { clipboard: { writeText } };
}

function runCopyIP(nav) {
  const fn = new Function('document', 'window', 'CONFIG', 'navigator', copyIPCode);
  fn(document, window, window.CONFIG, nav);
}

describe('copyIP (integration)', () => {
  let mockNavigator;

  beforeEach(() => {
    document.body.innerHTML = fixtureHTML;
    window.CONFIG = {
      serverIP: 'bydsmp.com',
      copyResetDelay: 3000,
    };
    mockNavigator = buildMockNavigator(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('點擊後應呼叫 clipboard.writeText，傳入 serverIP', async () => {
    runCopyIP(mockNavigator);
    document.querySelector('.ip-box').click();
    await Promise.resolve(); // 讓 clipboard Promise 完成
    expect(mockNavigator.clipboard.writeText).toHaveBeenCalledWith('bydsmp.com');
  });

  it('複製成功後 toast 應顯示（加上 is-visible 類別）', async () => {
    runCopyIP(mockNavigator);
    document.querySelector('.ip-box').click();
    await Promise.resolve();
    const toast = document.getElementById('copy-toast');
    expect(toast.classList.contains('is-visible')).toBe(true);
  });

  it('toast 應在 copyResetDelay 毫秒後隱藏', async () => {
    vi.useFakeTimers();
    runCopyIP(mockNavigator);

    document.querySelector('.ip-box').click();
    await Promise.resolve(); // flush clipboard microtask

    const toast = document.getElementById('copy-toast');
    expect(toast.classList.contains('is-visible')).toBe(true);

    vi.advanceTimersByTime(3000);
    expect(toast.classList.contains('is-visible')).toBe(false);
  });

  it('冷卻中再次點擊應被忽略（不重複呼叫 clipboard）', async () => {
    vi.useFakeTimers();
    runCopyIP(mockNavigator);
    const ipBox = document.querySelector('.ip-box');

    ipBox.click();
    await Promise.resolve();
    ipBox.click(); // 第二次點擊，isCopying 為 true，應被忽略
    await Promise.resolve();

    expect(mockNavigator.clipboard.writeText).toHaveBeenCalledTimes(1);
  });

  it('clipboard API 失敗後 isCopying 應重置，允許再次點擊', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {}); // 預期的「無法複製文字」不輸出 stderr
    const rejectNavigator = buildMockNavigator(false);
    // execCommand fallback：回傳 false → isCopying 重置為 false
    document.execCommand = vi.fn().mockReturnValue(false);

    runCopyIP(rejectNavigator);
    const ipBox = document.querySelector('.ip-box');

    // 第一次點擊：writeText 失敗 → catch 執行 → isCopying = false
    ipBox.click();
    await Promise.resolve(); // 讓 rejected Promise 的 microtask 完成

    // 第二次點擊：isCopying 已重置，應再次呼叫 writeText
    ipBox.click();
    await Promise.resolve();

    expect(rejectNavigator.clipboard.writeText).toHaveBeenCalledTimes(2);
  });
});
