// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This plugin creates rectangles on the screen.
const numberOfRectangles = 10;

const nodes: SceneNode[] = [];
for (let i = 0; i < numberOfRectangles; i++) {
  const rect = figma.createRectangle();
  rect.x = i * 150;
  rect.fills = [
    {
      type: "SOLID",
      color: { r: Math.random(), g: Math.random(), b: Math.random() },
    },
  ];
  figma.currentPage.appendChild(rect);
  nodes.push(rect);
}
figma.currentPage.selection = nodes;
figma.viewport.scrollAndZoomIntoView(nodes);

// Make sure to close the plugin when you're done. Otherwise the plugin will
// keep running, which shows the cancel button at the bottom of the screen.
figma.closePlugin();
