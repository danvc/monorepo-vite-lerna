import Drawing2DContext from './Drawing2DContext';
import { IModel2DProps } from './IModel2D';
import Model2D from './Model2D';

export default class GuideLines extends Model2D {
  constructor(private rulerHeight: number, private lineWidth: number) {
    super();
  }

  render(drawingContext: Drawing2DContext, props: IModel2DProps): void {
    const rulThickness = this.rulerHeight;
    drawingContext.context.lineWidth = this.lineWidth;
    drawingContext.context.beginPath();

    // horizontal
    drawingContext.context.moveTo(drawingContext.convertX(drawingContext.cursor.x), rulThickness + 0.5);
    drawingContext.context.lineTo(drawingContext.convertX(drawingContext.cursor.x), 0.5);
    // vertical
    drawingContext.context.moveTo(rulThickness + 0.5, drawingContext.convertY(drawingContext.cursor.y));
    drawingContext.context.lineTo(0.5, drawingContext.convertY(drawingContext.cursor.y));

    drawingContext.context.stroke();
  }
}
