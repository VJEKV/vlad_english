/**
 * Audio player for pre-generated mp3 files.
 * Files are in assets/audio/words/ and assets/audio/syllables/
 * Plays via HTML Audio element from app resources.
 */

let currentAudio: HTMLAudioElement | null = null;

export function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

function getBasePath(): string {
  // In Electron production: app resources path
  // In dev: relative to index.html
  return './assets/audio';
}

function safeName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9-]/g, '_');
}

// Play a whole word mp3
export function playWord(word: string): Promise<void> {
  const clean = word.toLowerCase().replace(/[.,!?;:'"()]/g, '');
  const src = `${getBasePath()}/words/${safeName(clean)}.mp3`;
  return playFile(src);
}

// Play a syllable mp3 (in context of word)
export function playSyllable(syllable: string, fullWord: string): Promise<void> {
  const name = `${safeName(syllable)}_${safeName(fullWord)}`;
  const src = `${getBasePath()}/syllables/${name}.mp3`;
  return playFile(src);
}

// Play any mp3 file
function playFile(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    stopAudio();
    const audio = new Audio(src);
    currentAudio = audio;
    audio.onended = () => { currentAudio = null; resolve(); };
    audio.onerror = () => {
      currentAudio = null;
      // Fallback to TTS API if file not found
      reject(new Error(`Audio not found: ${src}`));
    };
    audio.play().catch(e => {
      currentAudio = null;
      reject(e);
    });
  });
}

// Check if audio file exists (try to load it)
export async function hasAudioFile(word: string): Promise<boolean> {
  const clean = word.toLowerCase().replace(/[.,!?;:'"()]/g, '');
  const src = `${getBasePath()}/words/${safeName(clean)}.mp3`;
  try {
    const resp = await fetch(src, { method: 'HEAD' });
    return resp.ok;
  } catch {
    return false;
  }
}
