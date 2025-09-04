import { LETTERS_PLEASE, SinglePayload, WINDOW_HEIGHT, WINDOW_WIDTH } from '../consts';

figma.showUI(__html__, { width: WINDOW_WIDTH, height: WINDOW_HEIGHT });

function findLetterLayers(node: BaseNode & ChildrenMixin): SceneNode[] {
  let results: SceneNode[] = [];

  for (const child of node.children) {
    if ('children' in child) {
      results = results.concat(findLetterLayers(child));
    }

    if (child.name.startsWith('letter_')) {
      results.push(child);
    }
  }

  return results;
}

type LetterData = {
  node: SceneNode; // original node reference
  pngBase64: string; // base64 PNG string
  rawSvg: Uint8Array; // raw SVG string
};

async function buildLetterData(nodes: SceneNode[]): Promise<LetterData[]> {
  const results: LetterData[] = [];

  for (const n of nodes) {
    const bytes = await n.exportAsync({ format: 'PNG' });
    const pngBase64 = figma.base64Encode(bytes);
    const rawSvg = await n.exportAsync({ format: 'SVG' });

    results.push({
      node: n,
      pngBase64,
      rawSvg,
    });
  }

  return results;
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === LETTERS_PLEASE) {
    const matches = findLetterLayers(figma.currentPage);
    const data = await buildLetterData(matches);

    // ⚠️ Careful: nodes themselves can’t be serialized to UI
    // They’re live objects only usable inside code.ts.
    // To send info to UI, extract the props you need:
    const payload: SinglePayload[] = data.map((d) => ({
      id: d.node.id,
      name: d.node.name,
      width: 'width' in d.node ? d.node.width : undefined,
      height: 'height' in d.node ? d.node.height : undefined,
      pngBase64: d.pngBase64,
      rawSvg: d.rawSvg,
    }));

    figma.ui.postMessage({ type: LETTERS_PLEASE, data: payload });
  }
};
