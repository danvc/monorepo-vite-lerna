import Drawing2DContext from './Drawing2DContext';
import { IModel2DProps } from './IModel2D';
import Model2D from './Model2D';

export enum RulerAlign {
  Vertical,
  Horizontal,
}

export const RULLER_WIDTH = 2;

export interface RullerOptions {
  align?: RulerAlign;
  rulerHeight?: number; // thickness of ruler
  fontFamily?: string; // font for points
  fontSize?: string;
  strokeStyle?: string | CanvasGradient | CanvasPattern;
  lineWidth?: number;
  enableMouseTracking?: boolean;
  enableToolTip?: boolean;
}

interface RullerOptionsInternal {
  align: RulerAlign;
  rulerHeight: number; // thickness of ruler
  fontFamily: string; // font for points
  fontSize: string;
  fontColor: string;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  lineWidth: number;
  enableMouseTracking: boolean;
  enableToolTip: boolean;
}

export default class Ruller extends Model2D {
  static defaultProps = {
    rulerHeight: 20, // thickness of ruler
    fontFamily: 'arial', // font for points
    fontSize: '8px',
    strokeStyle: '#3f3f3f',
    lineWidth: 1,
    enableMouseTracking: true,
    enableToolTip: true,
  } as RullerOptionsInternal;

  private options: RullerOptionsInternal;

  constructor(options: RullerOptions) {
    super();

    this.options = Object.assign({}, Ruller.defaultProps, options);
  }

  render(drawingContext: Drawing2DContext, props: IModel2DProps): void {
    const rulThickness = this.options.rulerHeight;
    const rulLength =
      this.options.align === RulerAlign.Horizontal ? drawingContext.canvas.width : drawingContext.canvas.height;

    if (this.options.align === RulerAlign.Horizontal) {
      drawingContext.context.fillStyle = '#F1F3FA';
      drawingContext.context.fillRect(0, 0, drawingContext.canvas.width, rulThickness + 0.5);
    } else {
      drawingContext.context.fillStyle = '#F1F3FA';
      drawingContext.context.fillRect(0, 0, rulThickness + 1, drawingContext.canvas.height);
    }

    drawingContext.context.strokeStyle = this.options.strokeStyle;
    drawingContext.context.font = this.options.fontSize + ' ' + this.options.fontFamily;
    drawingContext.context.lineWidth = this.options.lineWidth;
    drawingContext.context.beginPath();

    const lineLengthMax = 0,
      lineLengthMed = rulThickness / 2,
      lineLengthMin = rulThickness / 3;

    for (let pos = 10; pos <= rulLength; pos += 5) {
      let drawLabel = null;
      let pointLength = lineLengthMed;
      if (pos % 50 === 0) {
        pointLength = lineLengthMax;
        drawLabel = true;
        drawLabel = '' + drawingContext.cmToMeasure(pos); // pos;
      }

      if (this.options.align === RulerAlign.Horizontal) {
        drawingContext.context.moveTo(pos + 0.5, rulThickness + 0.5);
        drawingContext.context.lineTo(pos + 0.5, pointLength + 0.5);
      } else {
        drawingContext.context.moveTo(rulThickness + 0.5, pos + 0.5);
        drawingContext.context.lineTo(pointLength + 0.5, pos + 0.5);
      }

      if (drawLabel) {
        drawingContext.context.save();
        drawingContext.context.fillStyle = this.options.strokeStyle;
        drawingContext.context.textBaseline = 'alphabetic';
        drawingContext.context.textAlign = 'left';
        if (this.options.align === RulerAlign.Horizontal) {
          drawingContext.context.fillText(drawLabel, pos + 3, rulThickness / 2 - 1);
        } else {
          drawingContext.context.translate(rulThickness / 2 - lineLengthMin, pos + 3);
          drawingContext.context.rotate(Math.PI / 2);
          drawingContext.context.fillText(drawLabel, 0, 0);
        }
        drawingContext.context.restore();
      }
    }

    drawingContext.context.stroke();
  }
}
