export const LETTERS_PLEASE = 'letters-please';

export const WINDOW_WIDTH = 400;
export const WINDOW_HEIGHT = 800;

export type SinglePayload = {
  id: string;
  name: string;
  width?: number;
  height?: number;
  pngBase64: string;
  rawSvg: Uint8Array;
};
