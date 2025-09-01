import React, { useCallback, useEffect, useState } from 'react';
import '../styles/ui.css';
import { LETTERS_PLEASE, SinglePayload, WINDOW_HEIGHT, WINDOW_WIDTH } from '../../consts';

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

function App() {
  const [activeKerning, setActiveKerning] = React.useState(0);
  const readOnlyCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const kerningCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [activePair, setActivePair] = React.useState<[string, string] | null>(null);
  const [kerningDict, setKerningDict] = React.useState<Map<string, Map<string, number>>>(new Map());
  const [charDict, setCharDict] = React.useState<Map<string, { width: number; height: number; image: string }>>(
    new Map()
  );
  const [letterPairings, setLetterPairings] = React.useState<string[][]>([]);

  const handleCreate = () => {
    parent.postMessage({ pluginMessage: { type: LETTERS_PLEASE } }, '*');
  };

  const paintCharsToReadOnlyCanvas = () => {
    if (readOnlyCanvasRef.current && charDict.size > 0) {
      const ctx = readOnlyCanvasRef.current.getContext('2d');
      let offset = 0;
      if (ctx) {
        ctx.clearRect(0, 0, readOnlyCanvasRef.current.width, readOnlyCanvasRef.current.height);
        charDict.forEach(({ image, width }) => {
          const img = new Image();
          img.src = 'data:image/png;base64,' + image;
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
        const newCharData = data.reduce((accum, { name, width, height, image }) => {
          const char = name.replace('letter_', '');
          return { ...accum, [char]: { width: width || 0, height: height || 0, image } };
        }, {});
        setCharDict(new Map(Object.entries(newCharData)));
      }
    };
  }, []);

  useEffect(() => {
    if (charDict) {
      paintCharsToReadOnlyCanvas();
      setLetterPairings(createLetterPairings(Array.from(charDict.keys())));
    }
  }, [charDict]);

  const drawKerningOnCanvas = ({ left, right, kerning }: { left: string; right: string; kerning: number }) => {
    const ctx = kerningCanvasRef.current?.getContext('2d');
    if (ctx) {
      const leftImage = new Image();
      leftImage.src = 'data:image/png;base64,' + charDict.get(left)?.image;
      const rightImage = new Image();
      rightImage.src = 'data:image/png;base64,' + charDict.get(right)?.image;

      ctx.clearRect(0, 0, kerningCanvasRef.current.width, kerningCanvasRef.current.height);
      // Draw the active pair on the kerning canvas
      ctx.drawImage(leftImage, 0, 0);
      ctx.drawImage(rightImage, leftImage.width + kerning, 0);
    }
  };

  useEffect(() => {
    console.log('activepair', activePair);
    if (activePair) {
      const [left, right] = activePair;
      drawKerningOnCanvas({ left, right, kerning: activeKerning });
    }
  }, [activeKerning, activePair]);

  return (
    <div>
      <button id="create" onClick={handleCreate}>
        Kern!
      </button>
      <p>Loaded Chars</p>
      <canvas ref={readOnlyCanvasRef} style={{ width: 200, height: 100, border: '1px solid red' }}></canvas>
      <p>Pairs</p>
      <Pairs letterPairings={letterPairings} setActivePair={setActivePair} />
      <p>Current Pairing</p>
      <canvas ref={kerningCanvasRef} style={{ width: 200, height: 100, border: '1px solid red' }}></canvas>
      <div>
        <button onClick={() => setActiveKerning((prev) => prev - 10)}>-10</button>
        <button onClick={() => setActiveKerning((prev) => prev - 1)}>-1</button>
        <button onClick={() => setActiveKerning((prev) => prev - 0.1)}>-0.1</button>
        <button onClick={() => setActiveKerning((prev) => prev + 0.1)}>+0.1</button>
        <button onClick={() => setActiveKerning((prev) => prev + 1)}>+1</button>
        <button onClick={() => setActiveKerning((prev) => prev + 10)}>+10</button>
      </div>
    </div>
  );
}

export default App;
