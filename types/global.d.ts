export type Lang = 'en' | 'de' | 'fr' | 'ja' | 'cn' | 'ko';

export type OverlayName = 'raidboss' | 'config'

type callOverlayHandler = (param: { call: string; overlay: OverlayName }) => {};
declare global {
  interface Window {
    addOverlayListener: (eventName: string, handler: () => void) => void;
    callOverlayHandler: callOverlayHandler;
  }
}

declare function callOverlayHandler(param: { call: string; overlay: OverlayName }): {};
