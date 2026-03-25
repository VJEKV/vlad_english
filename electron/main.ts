import { app, BrowserWindow, ipcMain, protocol, net } from 'electron';
import { pathToFileURL } from 'url';
import * as path from 'path';
import * as fs from 'fs';
import { EdgeTTS } from 'node-edge-tts';

// ============================================================
// Store (JSON on disk)
// ============================================================
let storePath = '';
function getStorePath() {
  if (!storePath) storePath = path.join(app.getPath('userData'), 'vlad-english-data.json');
  return storePath;
}
function readStore(): Record<string, any> {
  try {
    const p = getStorePath();
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch (e) { console.error('Store read error:', e); }
  return { profiles: [], activeProfileId: null, settings: { volume: 0.7, ttsSpeed: 'slow', defaultGrade: null } };
}
function writeStore(data: Record<string, any>) {
  try { fs.writeFileSync(getStorePath(), JSON.stringify(data, null, 2), 'utf-8'); }
  catch (e) { console.error('Store write error:', e); }
}
function getNestedValue(obj: any, key: string): any { return key.split('.').reduce((o: any, k: string) => o?.[k], obj); }
function setNestedValue(obj: any, key: string, value: any): void {
  const keys = key.split('.'); const last = keys.pop()!;
  const target = keys.reduce((o: any, k: string) => { if (o[k] === undefined) o[k] = {}; return o[k]; }, obj);
  target[last] = value;
}

// ============================================================
// API Keys (stored locally, NEVER in code)
// ============================================================
function getApiKeysPath(): string { return path.join(app.getPath('userData'), 'api-keys.json'); }
function readApiKeys(): Record<string, string> {
  try {
    const p = getApiKeysPath();
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch {}
  return {};
}
function getKey(name: string): string { return readApiKeys()[name] || ''; }

// ============================================================
// HTTP helper (uses Node 22 built-in fetch)
// ============================================================
async function httpPost(url: string, headers: Record<string, string>, body: string): Promise<{ status: number; data: Buffer }> {
  const resp = await fetch(url, { method: 'POST', headers, body, signal: AbortSignal.timeout(30000) });
  const buf = Buffer.from(await resp.arrayBuffer());
  return { status: resp.status, data: buf };
}

// ============================================================
// DeepSeek AI Chat
// ============================================================
async function callDeepSeek(messages: any[]): Promise<string> {
  const key = getKey('deepseek');
  if (!key) throw new Error('DeepSeek API key not set');
  const body = JSON.stringify({ model: 'deepseek-chat', messages, max_tokens: 500, temperature: 0.7 });
  const resp = await httpPost('https://api.deepseek.com/chat/completions',
    { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` }, body);
  const json = JSON.parse(resp.data.toString());
  if (json.choices?.[0]?.message?.content) return json.choices[0].message.content;
  throw new Error(json.error?.message || 'DeepSeek error');
}

// ============================================================
// OpenAI TTS
// ============================================================
async function callOpenAITTS(text: string, voice: string, speed: number): Promise<Buffer> {
  const key = getKey('openai');
  if (!key) throw new Error('OpenAI API key not set');
  const body = JSON.stringify({ model: 'tts-1', input: text, voice, speed, response_format: 'mp3' });
  const resp = await httpPost('https://api.openai.com/v1/audio/speech',
    { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` }, body);
  if (resp.status === 200) return resp.data;
  const err = JSON.parse(resp.data.toString());
  throw new Error(err.error?.message || `OpenAI TTS HTTP ${resp.status}`);
}

// ============================================================
// Window
// ============================================================
// Register tts:// protocol to serve cached mp3 files
protocol.registerSchemesAsPrivileged([
  { scheme: 'tts', privileges: { bypassCSP: true, stream: true, supportFetchAPI: true } }
]);

let mainWindow: BrowserWindow | null = null;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, height: 800, minWidth: 1024, minHeight: 700,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false },
    title: 'VladEnglish', autoHideMenuBar: true,
  });
  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
  mainWindow.on('closed', () => { mainWindow = null; });
}

// ============================================================
// App Ready — register all IPC handlers
// ============================================================
app.whenReady().then(() => {

  // Register tts:// protocol handler — serves mp3 from cache
  const cacheDir = path.join(app.getPath('userData'), 'tts-cache');
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  protocol.handle('tts', (request) => {
    // tts://filename.mp3 → serve from cache directory
    const filename = decodeURIComponent(request.url.replace('tts://', ''));
    const filePath = path.join(cacheDir, filename);
    return net.fetch(pathToFileURL(filePath).toString());
  });

  // --- Store ---
  ipcMain.handle('store:get', (_e, key: string) => { const d = readStore(); return key ? getNestedValue(d, key) : d; });
  ipcMain.handle('store:set', (_e, key: string, value: any) => { const d = readStore(); setNestedValue(d, key, value); writeStore(d); });
  ipcMain.handle('store:delete', (_e, key: string) => {
    const d = readStore(); const ks = key.split('.'); const last = ks.pop()!;
    const t = ks.reduce((o: any, k: string) => o?.[k], d); if (t) delete t[last]; writeStore(d);
  });

  // --- API Keys ---
  ipcMain.handle('apikey:get', (_e, keyName?: string) => {
    const keys = readApiKeys();
    if (keyName) { const v = keys[keyName] || ''; return v ? v.slice(0, 6) + '...' + v.slice(-4) : ''; }
    const r: Record<string, string> = {};
    for (const [k, v] of Object.entries(keys)) r[k] = v ? v.slice(0, 6) + '...' + v.slice(-4) : '';
    return r;
  });
  ipcMain.handle('apikey:set', (_e, keyName: string, keyValue: string) => {
    try { const keys = readApiKeys(); keys[keyName] = keyValue;
      fs.writeFileSync(getApiKeysPath(), JSON.stringify(keys), 'utf-8'); return true;
    } catch { return false; }
  });

  // --- AI Chat (DeepSeek) ---
  let aiCount = 0, aiDate = new Date().toDateString();
  const SYSTEM_PROMPT = `Ты — дружелюбный AI-репетитор английского языка для ребёнка.
СТРОГИЕ ПРАВИЛА:
1. Обсуждаешь ТОЛЬКО английский язык.
2. На другие темы: "Я помогаю только с английским! 😊"
3. Отвечай на РУССКОМ, просто, для ребёнка 8 лет.
4. Используй emoji. Максимум 3-4 предложения.
5. При объяснении правил давай аналогию с русским.`;

  ipcMain.handle('ai:chat', async (_e, messages: any[], context: string) => {
    if (new Date().toDateString() !== aiDate) { aiCount = 0; aiDate = new Date().toDateString(); }
    if (aiCount >= 100) return { error: 'Лимит на сегодня исчерпан.' };
    aiCount++;
    try {
      const full = [{ role: 'system', content: SYSTEM_PROMPT + (context ? '\n' + context : '') }, ...messages.slice(-20)];
      return { content: await callDeepSeek(full), requestsLeft: 100 - aiCount };
    } catch (e: any) { return { error: e.message || 'Ошибка AI' }; }
  });
  ipcMain.handle('ai:getLimit', () => {
    if (new Date().toDateString() !== aiDate) { aiCount = 0; aiDate = new Date().toDateString(); }
    return { used: aiCount, limit: 100, left: 100 - aiCount };
  });

  // --- TTS: OpenAI (EN) → Edge-TTS (fallback) → returns tts:// URL ---

  function speedToNumber(rate: string): number {
    const m = rate.match(/([+-]?\d+)/); if (!m) return 1.0;
    return Math.max(0.25, Math.min(4.0, 1.0 + parseInt(m[1]) / 100));
  }

  ipcMain.handle('tts:speak', async (_e, text: string, lang: string, rate: string) => {
    if (!text || !text.trim()) return null;
    try {
      const hash = Buffer.from(`${text}_${lang}_${rate}`).toString('base64url').slice(0, 80);
      const mp3Path = path.join(cacheDir, `${hash}.mp3`);

      // Generate if not cached
      if (!fs.existsSync(mp3Path)) {
        let ok = false;

        // Try OpenAI TTS (English, if key present)
        if (lang === 'en' && getKey('openai')) {
          try {
            const buf = await callOpenAITTS(text, 'nova', speedToNumber(rate));
            fs.writeFileSync(mp3Path, buf);
            ok = true;
            console.log('[TTS] OpenAI:', text.slice(0, 30));
          } catch (e) {
            console.warn('[TTS] OpenAI failed:', (e as Error).message);
          }
        }

        // Fallback: Edge-TTS
        if (!ok) {
          try {
            const voice = lang === 'ru' ? 'ru-RU-SvetlanaNeural' : 'en-US-JennyNeural';
            const tts = new EdgeTTS({ voice, lang: lang === 'ru' ? 'ru-RU' : 'en-US',
              outputFormat: 'audio-24khz-96kbitrate-mono-mp3', rate: rate || '+0%' });
            await tts.ttsPromise(text, mp3Path);
            ok = true;
            console.log('[TTS] Edge:', text.slice(0, 30));
          } catch (e) {
            console.warn('[TTS] Edge failed:', (e as Error).message);
          }
        }

        if (!ok) return null;
      }

      // Return tts:// URL — served by custom protocol handler
      return `tts://${hash}.mp3`;
    } catch (e) {
      console.error('[TTS] Error:', e);
      return null;
    }
  });

  // Pre-generate batch of words (for module preloading)
  ipcMain.handle('tts:pregenerate', async (_e, words: string[], lang: string) => {
    let done = 0;
    for (const word of words) {
      try {
        const hash = Buffer.from(`${word}_${lang}_+0%`).toString('base64url').slice(0, 80);
        const mp3Path = path.join(cacheDir, `${hash}.mp3`);
        if (!fs.existsSync(mp3Path)) {
          if (lang === 'en' && getKey('openai')) {
            try {
              const buf = await callOpenAITTS(word, 'nova', 1.0);
              fs.writeFileSync(mp3Path, buf);
            } catch {
              // Edge-TTS fallback
              const tts = new EdgeTTS({ voice: 'en-US-JennyNeural', lang: 'en-US',
                outputFormat: 'audio-24khz-96kbitrate-mono-mp3', rate: '+0%' });
              await tts.ttsPromise(word, mp3Path);
            }
          } else {
            const voice = lang === 'ru' ? 'ru-RU-SvetlanaNeural' : 'en-US-JennyNeural';
            const tts = new EdgeTTS({ voice, lang: lang === 'ru' ? 'ru-RU' : 'en-US',
              outputFormat: 'audio-24khz-96kbitrate-mono-mp3', rate: '+0%' });
            await tts.ttsPromise(word, mp3Path);
          }
        }
        done++;
        // Send progress to renderer
        mainWindow?.webContents.send('tts:progress', { done, total: words.length, word });
      } catch (e) {
        console.warn('[TTS] Pregen failed for:', word, e);
        done++;
      }
    }
    return { done, total: words.length };
  });

  // TTS test — check which engine works
  ipcMain.handle('tts:test', async () => {
    const results: Record<string, boolean> = { openai: false, edgeTTS: false };
    // Test OpenAI
    if (getKey('openai')) {
      try {
        await callOpenAITTS('test', 'nova', 1.0);
        results.openai = true;
      } catch {}
    }
    // Test Edge-TTS
    try {
      const testPath = path.join(cacheDir, '_test.mp3');
      const tts = new EdgeTTS({ voice: 'en-US-JennyNeural', lang: 'en-US',
        outputFormat: 'audio-24khz-96kbitrate-mono-mp3' });
      await tts.ttsPromise('test', testPath);
      if (fs.existsSync(testPath)) { results.edgeTTS = true; fs.unlinkSync(testPath); }
    } catch {}
    return results;
  });

  ipcMain.handle('tts:clearCache', async () => {
    try { const files = fs.readdirSync(cacheDir); for (const f of files) fs.unlinkSync(path.join(cacheDir, f)); return files.length; }
    catch { return 0; }
  });

  createWindow();
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (mainWindow === null) createWindow(); });
