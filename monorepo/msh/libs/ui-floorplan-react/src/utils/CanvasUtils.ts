import * as THREE from 'three';
import { BufferGeometry } from 'three';

export interface GridProperties {
  // grid parameters
  gridSpacing: number;
  gridWidth: number;
  gridColor: string;
  gridBgColor: string;
  gridOriginX: number;
  gridOriginY: number;
}

/** returns n where -gridSize/2 < n <= gridSize/2  */
export function calculateGridOffset(config: GridProperties, n: number) {
  if (n >= 0) {
    return ((n + config.gridSpacing / 2.0) % config.gridSpacing) - config.gridSpacing / 2.0;
  } else {
    return ((n - config.gridSpacing / 2.0) % config.gridSpacing) + config.gridSpacing / 2.0;
  }
}

/** */
export function drawLine(
  context: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  width: number,
  color: string,
) {
  // width is an integer
  // color is a hex string, i.e. #ff0000
  context.beginPath();
  context.moveTo(startX, startY);
  context.lineTo(endX, endY);
  context.lineWidth = width;
  context.strokeStyle = color;
  context.stroke();
}

/** */
export function drawPolygon(
  context: CanvasRenderingContext2D,
  xArr: number[],
  yArr: number[],
  fill: boolean,
  fillColor?: string,
  stroke?: boolean,
  strokeColor?: string,
  strokeWidth?: number,
) {
  // fillColor is a hex string, i.e. #ff0000
  fill = fill || false;
  stroke = stroke || false;
  context.beginPath();
  context.moveTo(xArr[0], yArr[0]);
  for (var i = 1; i < xArr.length; i++) {
    context.lineTo(xArr[i], yArr[i]);
  }
  context.closePath();
  if (fill && fillColor) {
    context.fillStyle = fillColor;
    context.fill();
  }
  if (stroke && strokeWidth && strokeColor) {
    context.lineWidth = strokeWidth;
    context.strokeStyle = strokeColor;
    context.stroke();
  }
}

/** */
export function drawCircle(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  fillColor: string,
) {
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  context.fillStyle = fillColor;
  context.fill();
}

export function offset(el: HTMLElement) {
  var rect = el.getBoundingClientRect();

  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
  };
}

export function innerWidth(el: HTMLElement): number {
  return Math.max(el.scrollWidth, el.offsetWidth, el.clientWidth);
}

export function innerHeight(el: HTMLElement): number {
  return Math.max(el.scrollHeight, el.offsetHeight, el.clientHeight);
}

export function resolveNormal(geometry: BufferGeometry | undefined): THREE.Vector3 {
  const faceIndex = 0;
  const tri = new THREE.Triangle(); // for re-use
  const indices = new THREE.Vector3(); // for re-use
  const normal3 = new THREE.Vector3(); // this is the output normal you need
  if (geometry?.index) {
    indices.fromArray(geometry.index.array, faceIndex * 3);
    tri.setFromAttributeAndIndices(geometry.attributes.position, indices.x, indices.y, indices.z);
    tri.getNormal(normal3);
  }

  return normal3;
}

export function drawLabel(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  fontColor: string,
  textBaseline: CanvasTextBaseline,
  textAlign: CanvasTextAlign,
  strokeStyle: string,
  lineWidth: number,
) {
  context.font = font;
  context.fillStyle = fontColor;
  context.textBaseline = textBaseline;
  context.textAlign = textAlign;
  context.strokeStyle = strokeStyle;
  context.lineWidth = lineWidth;

  context.strokeText(text, x, y);
  context.fillText(text, x, y);
}

export function htmlOffset(element: HTMLElement) {
  if (!element.getClientRects().length) {
    return { top: 0, left: 0 };
  }

  let rect = element.getBoundingClientRect();
  let win = element.ownerDocument.defaultView;
  return {
    top: rect.top + (win ? win.pageYOffset : 0),
    left: rect.left + (win ? win.pageXOffset : 0),
  };
}
