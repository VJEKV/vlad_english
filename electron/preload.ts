import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  store: {
    get: (key: string) => ipcRenderer.invoke('store:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('store:set', key, value),
    delete: (key: string) => ipcRenderer.invoke('store:delete', key),
  },
  tts: {
    speak: (text: string, lang: string, rate: string) => ipcRenderer.invoke('tts:speak', text, lang, rate),
    speakSyllable: (syllable: string, fullWord: string) => ipcRenderer.invoke('tts:speakSyllable', syllable, fullWord),
    pregenerate: (words: string[], lang: string) => ipcRenderer.invoke('tts:pregenerate', words, lang),
    test: () => ipcRenderer.invoke('tts:test'),
    clearCache: () => ipcRenderer.invoke('tts:clearCache'),
    onProgress: (callback: (data: any) => void) => {
      ipcRenderer.on('tts:progress', (_e, data) => callback(data));
    },
  },
  ai: {
    chat: (messages: any[], context: string) => ipcRenderer.invoke('ai:chat', messages, context),
    getLimit: () => ipcRenderer.invoke('ai:getLimit'),
  },
  apikey: {
    get: (keyName?: string) => ipcRenderer.invoke('apikey:get', keyName),
    set: (keyName: string, keyValue: string) => ipcRenderer.invoke('apikey:set', keyName, keyValue),
  },
});
