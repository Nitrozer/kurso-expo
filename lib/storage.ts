import { createMMKV } from 'react-native-mmkv';

export type KeyValueStore = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  remove: (key: string) => void;
};

// Natif : MMKV. La variante web (storage.web.ts) utilise localStorage — MMKV
// repose sur Nitro et n'a aucune implementation navigateur.
export function createStorage(id: string): KeyValueStore {
  const mmkv = createMMKV({ id });
  return {
    getString: (key) => mmkv.getString(key),
    set: (key, value) => mmkv.set(key, value),
    remove: (key) => { mmkv.remove(key); },
  };
}
