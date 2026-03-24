import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  store: {
    get: (key: string) => ipcRenderer.invoke('store:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('store:set', key, value),
    delete: (key: string) => ipcRenderer.invoke('store:delete', key),
  },
  tts: {
    speak: (text: string, lang: string, rate: string) => ipcRenderer.invoke('tts:speak', text, lang, rate),
    clearCache: () => ipcRenderer.invoke('tts:clearCache'),
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
