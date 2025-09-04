import { Path, Glyph, Font } from 'opentype.js';
import { parseSVG } from 'svg-path-parser';

import { type CharDict } from './types';

function svgToOpenTypePath(svg: string) {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const pathElem = doc.querySelector('path');
  const d = pathElem?.getAttribute('d');
  console.log(`Glyph e path d:`, d);
  if (!d) throw new Error('No path found');

  // Get viewBox info
  const svgElem = doc.querySelector('svg');
  let viewBox = svgElem?.getAttribute('viewBox');
  let [vbX, vbY, _vbW, vbH] = [0, 0, 1000, 1000]; // defaults
  if (viewBox) {
    [vbX, vbY, _vbW, vbH] = viewBox.split(' ').map(Number);
  }

  // OpenType.js expects y=0 at baseline, so we need to flip Y and scale
  const unitsPerEm = 1000; // match your font config
  const scale = unitsPerEm / vbH;

  const commands = parseSVG(d);
  const path = new Path();

  commands.forEach((cmd) => {
    // Flip Y and scale
    const x = (cmd.x - vbX) * scale;
    const y = (vbH - (cmd.y - vbY)) * scale; // flip Y

    switch (cmd.code) {
      case 'M':
        path.moveTo(x, y);
        break;
      case 'L':
        path.lineTo(x, y);
        break;
      case 'C':
        path.curveTo(
          (cmd.x1 - vbX) * scale,
          (vbH - (cmd.y1 - vbY)) * scale,
          (cmd.x2 - vbX) * scale,
          (vbH - (cmd.y2 - vbY)) * scale,
          x,
          y
        );
        break;
      case 'Q':
        path.quadTo((cmd.x1 - vbX) * scale, (vbH - (cmd.y1 - vbY)) * scale, x, y);
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
  console.log('Making glyph for', char, svgString);
  return new Glyph({
    name: char,
    unicode: char.charCodeAt(0),
    advanceWidth: 600,
    path: svgToOpenTypePath(svgString),
  });
};

const makeFont = (name: string, kerningPairs: Record<string, number>, glyphs: Glyph[]) => {
  return new Font({
    familyName: name + Math.floor(Math.random() * 1000),
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

const doItAll = (charDict: CharDict, kerningPairs: Record<string, number>) => {
  const glyphs = Array.from(charDict.entries()).map(([char, { svg }]) => makeGlyph(char, svg));
  const font = makeFont('FooBar', kerningPairs, glyphs);
  saveFontToDisk(font, `$font${Math.random()}.ttf`);
};

export default doItAll;
