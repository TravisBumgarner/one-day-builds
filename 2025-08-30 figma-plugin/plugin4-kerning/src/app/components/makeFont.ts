import { Path, Glyph, Font } from 'opentype.js';
import { parseSVG } from 'svg-path-parser';

import { type CharDict } from './types';

function svgToOpenTypePath(svg: string) {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const d = doc.querySelector('path')?.getAttribute('d');
  if (!d) throw new Error('No path found');

  const commands = parseSVG(d);
  const path = new Path();

  commands.forEach((cmd) => {
    switch (cmd.code) {
      case 'M':
        path.moveTo(cmd.x, cmd.y);
        break;
      case 'L':
        path.lineTo(cmd.x, cmd.y);
        break;
      case 'C':
        path.curveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
        break;
      case 'Q':
        path.quadTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
        break;
      case 'Z':
        path.close();
        break;
      // Add more cases as needed
    }
  });

  return path;
}

const makeGlyph = (char: string, svgString: string) => {
  return new Glyph({
    name: char,
    unicode: char.charCodeAt(0),
    advanceWidth: 600,
    path: svgToOpenTypePath(svgString),
  });
};

const makeFont = (name: string, kerningPairs: Record<string, number>, glyphs: Glyph[]) => {
  return new Font({
    familyName: name,
    styleName: 'Regular',
    unitsPerEm: 1000,
    ascender: 800,
    descender: -200,
    glyphs,
    kerningPairs,
  });
};

/**
 * Saves an OpenType.js Font as a downloadable .ttf in the browser.
 *
 * @param font - The opentype.js Font object
 * @param fileName - Suggested filename (should end with .ttf)
 */
export function saveFontToDisk(font: Font, fileName: string) {
  if (!fileName.endsWith('.ttf')) {
    throw new Error(`File name must end with .ttf: ${fileName}`);
  }

  const arrayBuffer = font.toArrayBuffer();
  const blob = new Blob([arrayBuffer], { type: 'font/ttf' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log(`✅ Font download triggered: ${fileName}`);
}

const doItAll = (charDict: CharDict, kerningPairs: Record<string, number>, outputPath: string) => {
  const glyphs = Array.from(charDict.entries()).map(([char, { svg }]) => makeGlyph(char, svg));
  const font = makeFont('MyCustomFont', kerningPairs, glyphs);
  saveFontToDisk(font, outputPath);
};

export default doItAll;
