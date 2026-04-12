#!/usr/bin/env node
/**
 * Pre-generate ALL audio files for VladEnglish
 * Uses OpenAI TTS API to generate mp3 for:
 * - All words (whole)
 * - All syllables (in context of word)
 * - Key sentences from modules
 *
 * Run: OPENAI_API_KEY=sk-... node scripts/generate-audio.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('Set OPENAI_API_KEY environment variable');
  process.exit(1);
}

const AUDIO_DIR = path.join(__dirname, '..', 'assets', 'audio');
const WORDS_DIR = path.join(AUDIO_DIR, 'words');
const SYLLABLES_DIR = path.join(AUDIO_DIR, 'syllables');

// Create dirs
[AUDIO_DIR, WORDS_DIR, SYLLABLES_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// TTS call
async function generateTTS(text, outputPath, instructions) {
  if (fs.existsSync(outputPath)) {
    console.log('  [SKIP]', text, '(cached)');
    return;
  }

  const model = instructions ? 'gpt-4o-mini-tts' : 'tts-1';
  const payload = { model, input: text, voice: 'nova', speed: 0.9, response_format: 'mp3' };
  if (instructions) payload.instructions = instructions;

  const body = JSON.stringify(payload);

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/audio/speech',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (res.statusCode === 200) {
          fs.writeFileSync(outputPath, buf);
          console.log('  [OK]', text, `(${buf.length} bytes)`);
          resolve();
        } else {
          console.error('  [ERR]', text, res.statusCode, buf.toString().slice(0, 100));
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(body);
    req.end();
  });
}

// Delay between requests to avoid rate limiting
const delay = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  // Load syllables
  const syllablesContent = fs.readFileSync(path.join(__dirname, '..', 'src', 'content', 'syllables.ts'), 'utf8');

  // Extract all words from SYLLABLES dict
  const syllableEntries = {};
  const lines = syllablesContent.split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*['"]?([a-zA-Z'-]+)['"]?\s*:\s*\[(.+)\]/);
    if (match) {
      const word = match[1].toLowerCase();
      const syls = match[2].match(/'([^']+)'/g)?.map(s => s.replace(/'/g, '')) || [];
      if (syls.length > 0) syllableEntries[word] = syls;
    }
  }

  const allWords = Object.keys(syllableEntries);
  console.log(`Found ${allWords.length} words in syllable dictionary`);

  // Generate whole word audio
  console.log('\n=== Generating whole word audio ===');
  let count = 0;
  for (const word of allWords) {
    const safeName = word.replace(/[^a-z0-9-]/g, '_');
    const outPath = path.join(WORDS_DIR, `${safeName}.mp3`);
    try {
      await generateTTS(word, outPath);
      count++;
      if (count % 10 === 0) await delay(500); // rate limit
    } catch (e) {
      console.error('  Failed:', word, e.message);
      await delay(2000);
    }
  }
  console.log(`\nGenerated ${count} word files`);

  // Generate syllable audio (only for multi-syllable words)
  console.log('\n=== Generating syllable audio ===');
  let sylCount = 0;
  for (const [word, syls] of Object.entries(syllableEntries)) {
    if (syls.length <= 1) continue;
    for (const syl of syls) {
      const safeName = `${syl}_${word}`.replace(/[^a-z0-9-]/g, '_');
      const outPath = path.join(SYLLABLES_DIR, `${safeName}.mp3`);
      const instruction = `You are reading the word "${word}" syllable by syllable for a child learning to read. Now say ONLY the syllable "${syl}". Pronounce it exactly as it sounds inside "${word}". Speak slowly and clearly. Say nothing else.`;
      try {
        await generateTTS(syl, outPath, instruction);
        sylCount++;
        if (sylCount % 10 === 0) await delay(500);
      } catch (e) {
        console.error('  Failed:', syl, 'of', word, e.message);
        await delay(2000);
      }
    }
  }
  console.log(`\nGenerated ${sylCount} syllable files`);
  console.log(`\nTotal: ${count + sylCount} audio files`);
  console.log(`Directory: ${AUDIO_DIR}`);
}

main().catch(e => { console.error(e); process.exit(1); });
