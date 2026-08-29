export type KeyValueStore = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  remove: (key: string) => void;
};

// Web : localStorage, avec les cles prefixees par l'id pour reproduire le
// cloisonnement par instance de MMKV. Chaque acces est protege : localStorage
// leve une exception en navigation privee ou si les donnees de site sont
// bloquees, et l'app doit continuer a fonctionner sans persistance.
export function createStorage(id: string): KeyValueStore {
  const scoped = (key: string) => `${id}:${key}`;
  return {
    getString: (key) => {
      try { return window.localStorage.getItem(scoped(key)) ?? undefined; }
      catch { return undefined; }
    },
    set: (key, value) => {
      try { window.localStorage.setItem(scoped(key), value); } catch { /* stockage indisponible */ }
    },
    remove: (key) => {
      try { window.localStorage.removeItem(scoped(key)); } catch { /* stockage indisponible */ }
    },
  };
}
