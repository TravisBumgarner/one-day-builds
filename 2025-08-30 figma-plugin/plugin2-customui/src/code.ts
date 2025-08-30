import skmeans from "skmeans";

function base64ToUint8Array(base64: string): Uint8Array {
  const base64Chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let bufferLength = base64.length * 0.75;
  if (base64[base64.length - 1] === "=") bufferLength--;
  if (base64[base64.length - 2] === "=") bufferLength--;
  const bytes = new Uint8Array(bufferLength);
  let p = 0;
  let encoded1, encoded2, encoded3, encoded4;
  for (let i = 0; i < base64.length; i += 4) {
    encoded1 = base64Chars.indexOf(base64[i]);
    encoded2 = base64Chars.indexOf(base64[i + 1]);
    encoded3 = base64Chars.indexOf(base64[i + 2]);
    encoded4 = base64Chars.indexOf(base64[i + 3]);
    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (encoded3 !== 64 && encoded3 !== -1) {
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    }
    if (encoded4 !== 64 && encoded4 !== -1) {
      bytes[p++] = ((encoded3 & 3) << 6) | encoded4;
    }
  }
  return bytes;
}

function samplePixels(data: number[][], sampleSize = 250_000) {
  if (data.length <= sampleSize) return data;
  const sampled: number[][] = [];
  for (let i = 0; i < sampleSize; i++) {
    sampled.push(data[Math.floor(Math.random() * data.length)]);
  }
  return sampled;
}

/**
 * Runs k-means clustering on pixel data.
 * @param data Array of pixels, each pixel is [r, g, b] (0-255)
 * @param k Number of clusters (colors)
 * @param sampleSize Optional: number of pixels to sample for speed
 * @returns Array of centroids, each centroid is [r, g, b]
 */
const kmeans = (
  data: Array<[number, number, number]>,
  k: number,
  sampleSize = 250_000
): Array<[number, number, number]> => {
  const sampled = samplePixels(data, sampleSize);
  const result = skmeans(sampled, k);
  // skmeans returns centroids as number[][], but we want [r,g,b] arrays
  return result.centroids as Array<[number, number, number]>;
};

// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);
figma.loadFontAsync({ family: "Inter", style: "Regular" });

type CreateShapesMessage = {
  type: "create-shapes";
  count: number;
};

type ImageUploadMessage = {
  type: "upload-image";
  pixelData: number[];
  width: number;
  height: number;
  imageData: string;
};

type Message = CreateShapesMessage | ImageUploadMessage;

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = (msg: Message) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === "create-shapes") {
    // This plugin creates rectangles on the screen.
    const numberOfRectangles = msg.count;

    const nodes: SceneNode[] = [];
    for (let i = 0; i < numberOfRectangles; i++) {
      const rect = figma.createRectangle();
      rect.x = i * 150;
      rect.fills = [{ type: "SOLID", color: { r: 1, g: 0.5, b: 0 } }];
      figma.currentPage.appendChild(rect);
      nodes.push(rect);
    }
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }

  if (msg.type === "upload-image") {
    // 1. Decode base64 into Uint8Array so Figma can create an image
    const base64 = msg.imageData.split(",")[1];
    const uint8Array = base64ToUint8Array(base64);
    const figmaImage = figma.createImage(uint8Array);

    // Create a rectangle with the image fill
    const imageRect = figma.createRectangle();
    imageRect.resize(msg.width, msg.height);
    imageRect.fills = [
      { type: "IMAGE", scaleMode: "FILL", imageHash: figmaImage.hash },
    ];
    figma.currentPage.appendChild(imageRect);

    // 2. Use pixel data for kmeans
    const pixels = msg.pixelData as number[]; // [r,g,b,a,...]
    const rgbData: [number, number, number][] = [];
    for (let i = 0; i < pixels.length; i += 4) {
      rgbData.push([pixels[i], pixels[i + 1], pixels[i + 2]]);
    }

    const kmeans_data = kmeans(rgbData, 5);

    // Draw rectangles with palette
    kmeans_data.forEach((color, i) => {
      const swatch = figma.createRectangle();
      swatch.x = i * 150;
      swatch.y = msg.height + 20; // put below the image
      swatch.resize(100, 100);
      swatch.fills = [
        {
          type: "SOLID",
          color: { r: color[0] / 255, g: color[1] / 255, b: color[2] / 255 },
        },
      ];
      figma.currentPage.appendChild(swatch);
    });

    figma.ui.postMessage({ type: "done" });
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};
