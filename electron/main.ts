import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as https from 'https';
import { EdgeTTS } from 'node-edge-tts';

// Store path — resolved lazily after app is ready
let storePath = '';

function getStorePath() {
  if (!storePath) {
    storePath = path.join(app.getPath('userData'), 'vlad-english-data.json');
  }
  return storePath;
}

function readStore(): Record<string, any> {
  try {
    const p = getStorePath();
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to read store:', e);
  }
  return {
    profiles: [],
    activeProfileId: null,
    settings: {
      volume: 0.7,
      musicVolume: 0.3,
      ttsSpeed: 0.85,
      ttsVoice: 'en-US',
      theme: 'auto',
      parentPin: '0000',
      showTimer: true,
      autoPlayAudio: true,
      defaultGrade: null,
    },
  };
}

function writeStore(data: Record<string, any>) {
  try {
    fs.writeFileSync(getStorePath(), JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write store:', e);
  }
}

function getNestedValue(obj: any, key: string): any {
  return key.split('.').reduce((o: any, k: string) => o?.[k], obj);
}

function setNestedValue(obj: any, key: string, value: any): void {
  const keys = key.split('.');
  const last = keys.pop()!;
  const target = keys.reduce((o: any, k: string) => {
    if (o[k] === undefined) o[k] = {};
    return o[k];
  }, obj);
  target[last] = value;
}

// === DeepSeek API ===
// Read API key fresh each time (may be set after app start)
function getDeepSeekKey(): string {
  // 1. Environment variable
  if (process.env.DEEPSEEK_API_KEY) return process.env.DEEPSEEK_API_KEY;
  // 2. Settings file in userData
  try {
    const p = path.join(app.getPath('userData'), 'api-keys.json');
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf-8')).deepseek || '';
    }
  } catch {}
  return '';
}
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

function callDeepSeek(messages: any[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'deepseek-chat',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const url = new URL(DEEPSEEK_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getDeepSeekKey()}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk: string) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.choices?.[0]?.message?.content) {
            resolve(json.choices[0].message.content);
          } else {
            reject(new Error(json.error?.message || 'Unknown API error'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(body);
    req.end();
  });
}

// === OpenAI TTS ===
function getOpenAIKey(): string {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  try {
    const p = path.join(app.getPath('userData'), 'api-keys.json');
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf-8')).openai || '';
    }
  } catch {}
  return '';
}

function callOpenAITTS(text: string, voice: string, speed: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: voice,
      speed: speed,
      response_format: 'mp3',
    });

    const options = {
      hostname: 'api.openai.com',
      path: '/v1/audio/speech',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getOpenAIKey()}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (res.statusCode === 200) {
          resolve(buf);
        } else {
          try {
            const err = JSON.parse(buf.toString());
            reject(new Error(err.error?.message || 'OpenAI TTS error'));
          } catch {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(body);
    req.end();
  });
}

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: 'VladEnglish',
    autoHideMenuBar: true,
  });

  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Register IPC handlers after app is ready
  ipcMain.handle('store:get', (_event, key: string) => {
    const data = readStore();
    return key ? getNestedValue(data, key) : data;
  });

  ipcMain.handle('store:set', (_event, key: string, value: any) => {
    const data = readStore();
    setNestedValue(data, key, value);
    writeStore(data);
  });

  ipcMain.handle('store:delete', (_event, key: string) => {
    const data = readStore();
    const keys = key.split('.');
    const last = keys.pop()!;
    const target = keys.reduce((o: any, k: string) => o?.[k], data);
    if (target) delete target[last];
    writeStore(data);
  });

  // === API Key management ===
  const apiKeysPath = path.join(app.getPath('userData'), 'api-keys.json');

  ipcMain.handle('apikey:get', (_event, keyName?: string) => {
    try {
      if (fs.existsSync(apiKeysPath)) {
        const keys = JSON.parse(fs.readFileSync(apiKeysPath, 'utf-8'));
        if (keyName) {
          const key = keys[keyName] || '';
          return key ? key.slice(0, 6) + '...' + key.slice(-4) : '';
        }
        // Return all masked keys
        const result: Record<string, string> = {};
        for (const [k, v] of Object.entries(keys)) {
          const val = v as string;
          result[k] = val ? val.slice(0, 6) + '...' + val.slice(-4) : '';
        }
        return result;
      }
    } catch {}
    return keyName ? '' : {};
  });

  ipcMain.handle('apikey:set', (_event, keyName: string, keyValue: string) => {
    try {
      let keys: Record<string, string> = {};
      if (fs.existsSync(apiKeysPath)) {
        keys = JSON.parse(fs.readFileSync(apiKeysPath, 'utf-8'));
      }
      keys[keyName] = keyValue;
      fs.writeFileSync(apiKeysPath, JSON.stringify(keys), 'utf-8');
      return true;
    } catch { return false; }
  });

  // === DeepSeek AI Chat ===
  let aiRequestCount = 0;
  const AI_DAILY_LIMIT = 100;
  let aiLimitDate = new Date().toDateString();

  const SYSTEM_PROMPT = `Ты — дружелюбный AI-репетитор английского языка для ребёнка.

СТРОГИЕ ПРАВИЛА:
1. Ты обсуждаешь ТОЛЬКО английский язык: слова, произношение, грамматику, чтение, перевод.
2. На ЛЮБЫЕ другие темы (игры, мультики, наука, математика, личные вопросы) отвечай: "Я помогаю только с английским! 😊 Давай учить слова?"
3. Если ребёнок пытается обойти ограничения — мягко возвращай к английскому.
4. Отвечай на РУССКОМ языке, просто и понятно для ребёнка 8 лет.
5. Используй emoji для наглядности.
6. Примеры на английском выделяй.
7. Максимум 3-4 предложения в ответе.
8. При объяснении правил давай аналогию с русским языком.
9. Хвали ребёнка за вопросы.
10. НЕ генерируй длинные тексты и списки — коротко и по делу.`;

  ipcMain.handle('ai:chat', async (_event, messages: any[], context: string) => {
    // Check daily limit
    if (new Date().toDateString() !== aiLimitDate) {
      aiRequestCount = 0;
      aiLimitDate = new Date().toDateString();
    }
    if (aiRequestCount >= AI_DAILY_LIMIT) {
      return { error: 'Лимит запросов на сегодня исчерпан. Попробуй завтра!' };
    }
    aiRequestCount++;

    try {
      const fullMessages = [
        { role: 'system', content: SYSTEM_PROMPT + (context ? `\n\nКонтекст ученика:\n${context}` : '') },
        ...messages.slice(-20), // last 10 pairs
      ];
      const reply = await callDeepSeek(fullMessages);
      return { content: reply, requestsLeft: AI_DAILY_LIMIT - aiRequestCount };
    } catch (e: any) {
      return { error: e.message || 'Ошибка связи с AI' };
    }
  });

  ipcMain.handle('ai:getLimit', () => {
    if (new Date().toDateString() !== aiLimitDate) {
      aiRequestCount = 0;
      aiLimitDate = new Date().toDateString();
    }
    return { used: aiRequestCount, limit: AI_DAILY_LIMIT, left: AI_DAILY_LIMIT - aiRequestCount };
  });

  // === TTS: OpenAI (priority for EN) + Edge-TTS (fallback + RU) ===
  const audioCacheDir = path.join(app.getPath('userData'), 'tts-cache');
  if (!fs.existsSync(audioCacheDir)) fs.mkdirSync(audioCacheDir, { recursive: true });

  // Speed string to OpenAI speed number: "-40%" → 0.6, "+0%" → 1.0, "+20%" → 1.2
  function parseSpeed(rate: string): number {
    const match = rate.match(/([+-]?\d+)/);
    if (!match) return 1.0;
    return Math.max(0.25, Math.min(4.0, 1.0 + parseInt(match[1]) / 100));
  }

  ipcMain.handle('tts:speak', async (_event, text: string, lang: string, rate: string) => {
    try {
      const cacheKey = Buffer.from(`${text}_${lang}_${rate}`).toString('base64url').slice(0, 80);
      const filePath = path.join(audioCacheDir, `${cacheKey}.mp3`);

      // Generate if not cached
      if (!fs.existsSync(filePath)) {
        let generated = false;

        // Try OpenAI TTS for English (best quality)
        if (lang === 'en' && getOpenAIKey()) {
          try {
            const speed = parseSpeed(rate);
            const buf = await callOpenAITTS(text, 'nova', speed);
            fs.writeFileSync(filePath, buf);
            generated = true;
          } catch (e) {
            console.warn('OpenAI TTS failed, falling back to edge-tts:', e);
          }
        }

        // Fallback: Edge-TTS
        if (!generated) {
          const voice = lang === 'ru' ? 'ru-RU-SvetlanaNeural' : 'en-US-JennyNeural';
          const tts = new EdgeTTS({
            voice,
            lang: lang === 'ru' ? 'ru-RU' : 'en-US',
            outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
            rate: rate || '+0%',
          });
          await tts.ttsPromise(text, filePath);
        }
      }

      // Return base64 data URL (works in renderer with contextIsolation)
      const audioData = fs.readFileSync(filePath);
      return 'data:audio/mp3;base64,' + audioData.toString('base64');
    } catch (e) {
      console.error('TTS error:', e);
      return null;
    }
  });

  ipcMain.handle('tts:clearCache', async () => {
    try {
      const files = fs.readdirSync(audioCacheDir);
      for (const f of files) fs.unlinkSync(path.join(audioCacheDir, f));
      return files.length;
    } catch { return 0; }
  });

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
