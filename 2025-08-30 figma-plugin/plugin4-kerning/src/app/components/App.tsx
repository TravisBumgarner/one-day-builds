import React, { useEffect } from 'react';
import '../styles/ui.css';
import { LETTERS_PLEASE, SinglePayload } from '../../consts';
import doItAll from './makeFont';

function uint8ArrayToString(uint8: Uint8Array): string {
  return new TextDecoder('utf-8').decode(uint8);
}

import { type CharDict } from './types';

const Pairs = ({
  letterPairings,
  setActivePair,
}: {
  letterPairings: string[][];
  setActivePair: (pair: [string, string]) => void;
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {Array.from(
        letterPairings.reduce((acc, [left, right]) => {
          if (!acc.has(left)) acc.set(left, []);
          acc.get(left)!.push([left, right]);
          return acc;
        }, new Map<string, string[][]>())
      ).map(([left, pairs]) => (
        <div key={left} style={{ display: 'flex', marginBottom: 4 }}>
          {pairs.map(([l, r]) => (
            <button
              style={{
                width: '42px',
                borderRadius: 0,
                margin: 2,
                padding: 5,
                borderWidth: 0,
              }}
              key={`${l}-${r}`}
              onClick={() => setActivePair([l, r])}
            >
              {l} - {r}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

const createLetterPairings = (chars: string[]) => {
  const pairs = [];
  for (const leftChar of chars) {
    for (const rightChar of chars) {
      pairs.push([leftChar, rightChar]);
    }
  }
  console.log('called and returning', chars, pairs);
  return pairs;
};

// const serializeKerningDict = (dict: Map<string, Map<string, number>>) => {
//   const obj: Record<string, Record<string, number>> = {};
//   dict.forEach((innerMap, left) => {
//     obj[left] = {};
//     innerMap.forEach((value, right) => {
//       obj[left][right] = value;
//     });
//   });
//   return obj;
// };

function App() {
  // const [activeKerning, setActiveKerning] = React.useState(0);
  const readOnlyCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const kerningCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [activePair, setActivePair] = React.useState<[string, string] | null>(null);
  const [kerningDict, setKerningDict] = React.useState<Map<string, Map<string, number>>>(new Map());
  const [charDict, setCharDict] = React.useState<CharDict>(new Map());
  const [letterPairings, setLetterPairings] = React.useState<string[][]>([]);

  const handleCreate = () => {
    parent.postMessage({ pluginMessage: { type: LETTERS_PLEASE } }, '*');
  };

  const downloadKerningDict = () => {
    const kerningPairs: Record<string, number> = {};
    kerningDict.forEach((innerMap, left) => {
      innerMap.forEach((value, right) => {
        kerningPairs[`${left}${right}`] = value;
      });
    });

    doItAll(charDict, kerningPairs, 'output/MyCustomFont.ttf');
  };

  const paintCharsToReadOnlyCanvas = () => {
    if (readOnlyCanvasRef.current && charDict.size > 0) {
      const ctx = readOnlyCanvasRef.current.getContext('2d');
      let offset = 0;
      if (ctx) {
        ctx.clearRect(0, 0, readOnlyCanvasRef.current.width, readOnlyCanvasRef.current.height);
        charDict.forEach(({ pngBase64, width }) => {
          const img = new Image();
          img.src = 'data:image/png;base64,' + pngBase64;
          const currentOffset = offset;
          img.onload = () => {
            ctx.drawImage(img, currentOffset, 0);
          };
          offset += width;
        });
      }
    }
  };

  React.useEffect(() => {
    // This is how we read messages sent from the plugin controller
    window.onmessage = (event) => {
      const msg = event.data.pluginMessage;
      console.log('msg received', msg);
      if (msg.type === LETTERS_PLEASE) {
        const data = msg.data as SinglePayload[];
        const newCharData = data.reduce((accum, { name, width, height, pngBase64, rawSvg }) => {
          const char = name.replace('letter_', '');
          return {
            ...accum,
            [char]: { width: width || 0, height: height || 0, pngBase64, svg: uint8ArrayToString(rawSvg) },
          };
        }, {});
        setCharDict(new Map(Object.entries(newCharData)));
      }
    };
  }, []);

  const populateKerningDict = (letterPairings: string[][]) => {
    const newKerningDict = new Map<string, Map<string, number>>();
    letterPairings.forEach(([left, right]) => {
      const kerning = 0;
      if (!newKerningDict.has(left)) newKerningDict.set(left, new Map());
      newKerningDict.get(left)!.set(right, kerning);
    });
    setKerningDict(newKerningDict);
  };

  useEffect(() => {
    // When charDict is loaded, paint the read only version onto the canvas
    // Generate all the possible letter pairings.
    if (charDict) {
      paintCharsToReadOnlyCanvas();
      const letterPairings = createLetterPairings(Array.from(charDict.keys()));
      setLetterPairings(letterPairings);
      populateKerningDict(letterPairings);
    }
  }, [charDict]);

  const drawKerningOnCanvas = ({ left, right, kerning }: { left: string; right: string; kerning: number }) => {
    const ctx = kerningCanvasRef.current?.getContext('2d');
    if (ctx) {
      const leftImage = new Image();
      leftImage.src = 'data:image/png;base64,' + charDict.get(left)?.pngBase64;
      const rightImage = new Image();
      rightImage.src = 'data:image/png;base64,' + charDict.get(right)?.pngBase64;

      ctx.clearRect(0, 0, kerningCanvasRef.current.width, kerningCanvasRef.current.height);
      // Draw the active pair on the kerning canvas
      ctx.drawImage(leftImage, 0, 0);
      ctx.drawImage(rightImage, leftImage.width + kerning, 0);
    }
  };

  useEffect(() => {
    // When a new active pair is set, draw it on the canvas.
    // When the active pair's activeKerning is changed, draw an update on the canvas.
    if (activePair) {
      const [left, right] = activePair;
      drawKerningOnCanvas({ left, right, kerning: kerningDict.get(left)?.get(right) || 0 });
      setKerningDict((prev) => {
        const newDict = new Map(prev);
        newDict.get(left)?.set(right, kerningDict.get(left)?.get(right) || 0);
        return newDict;
      });
    }
  }, [kerningDict, activePair]);

  const updateKerning = (delta: number) => {
    if (activePair) {
      const [left, right] = activePair;
      setKerningDict((prev) => {
        const newDict = new Map(prev);
        const previousKerning = newDict.get(left)?.get(right) || 0;
        newDict.get(left)?.set(right, previousKerning + delta);
        return newDict;
      });
    }
  };

  return (
    <div>
      <button id="create" onClick={handleCreate}>
        Kern!
      </button>
      <p>SVGs</p>
      <div style={{ display: 'flex' }}>
        {Array.from(charDict.entries()).map(([char, { svg }]) => (
          <div key={char}>
            <p>{char}</p>
            <div
              dangerouslySetInnerHTML={{
                __html: svg,
              }}
            ></div>
          </div>
        ))}
      </div>
      <p>Loaded Char PNGs</p>
      <canvas ref={readOnlyCanvasRef} style={{ width: 200, height: 100, border: '1px solid red' }}></canvas>
      <p>Pairs</p>
      <Pairs letterPairings={letterPairings} setActivePair={setActivePair} />
      <p>Current Pairing</p>
      <canvas ref={kerningCanvasRef} style={{ width: 200, height: 100, border: '1px solid red' }}></canvas>
      <div>
        <button style={deltaButtonCSS} onClick={() => updateKerning(-10)}>
          -10
        </button>
        <button style={deltaButtonCSS} onClick={() => updateKerning(-1)}>
          -1
        </button>
        <button style={deltaButtonCSS} onClick={() => updateKerning(-0.1)}>
          -0.1
        </button>
        <button style={deltaButtonCSS} onClick={() => updateKerning(0.1)}>
          +0.1
        </button>
        <button style={deltaButtonCSS} onClick={() => updateKerning(1)}>
          +1
        </button>
        <button style={deltaButtonCSS} onClick={() => updateKerning(10)}>
          +10
        </button>
      </div>
      <button onClick={downloadKerningDict}>Download</button>
    </div>
  );
}

const deltaButtonCSS = {
  borderRadius: 0,
  margin: 1,
};

export default App;
