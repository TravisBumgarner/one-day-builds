figma.showUI(__html__, { width: 300, height: 200 });

figma.ui.onmessage = (msg) => {
  if (msg.type === "create-rect") {
    const rect = figma.createRectangle();
    rect.fills = [{ type: "SOLID", color: { r: 1, g: 0, b: 0 } }];
    figma.currentPage.appendChild(rect);
  }
};
