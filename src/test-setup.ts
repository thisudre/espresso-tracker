import { JSDOM } from 'jsdom';

const dom = new JSDOM('', { url: 'http://localhost' });

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: dom.window.localStorage,
    writable: true,
    configurable: true,
  });
}
