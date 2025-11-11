import 'fake-indexeddb/auto';
import { vi } from 'vitest';

// Mock the global Dexie object that the userscript expects.
// The userscript doesn't import Dexie, but expects it to be on the window.
import Dexie from 'dexie';
global.Dexie = Dexie;

// Mock for window.matchMedia, which is used by some libraries under the hood in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
