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

  ipcMain.handle('apikey:get', () => {
    try {
      if (fs.existsSync(apiKeysPath)) {
        const keys = JSON.parse(fs.readFileSync(apiKeysPath, 'utf-8'));
        // Return masked key for display
        const key = keys.deepseek || '';
        return key ? key.slice(0, 6) + '...' + key.slice(-4) : '';
      }
    } catch {}
    return '';
  });

  ipcMain.handle('apikey:set', (_event, key: string) => {
    try {
      fs.writeFileSync(apiKeysPath, JSON.stringify({ deepseek: key }), 'utf-8');
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

  // === Edge TTS (high quality neural voices) ===
  const audioCacheDir = path.join(app.getPath('userData'), 'tts-cache');
  if (!fs.existsSync(audioCacheDir)) fs.mkdirSync(audioCacheDir, { recursive: true });

  ipcMain.handle('tts:speak', async (_event, text: string, lang: string, rate: string) => {
    try {
      // Cache key from text + lang + rate
      const key = Buffer.from(`${text}_${lang}_${rate}`).toString('base64url').slice(0, 80);
      const filePath = path.join(audioCacheDir, `${key}.mp3`);

      // Return cached if exists
      if (fs.existsSync(filePath)) return filePath;

      const voice = lang === 'ru' ? 'ru-RU-SvetlanaNeural' : 'en-US-JennyNeural';
      const tts = new EdgeTTS({
        voice,
        lang: lang === 'ru' ? 'ru-RU' : 'en-US',
        outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
        rate: rate || '+0%',
      });

      await tts.ttsPromise(text, filePath);
      return filePath;
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
