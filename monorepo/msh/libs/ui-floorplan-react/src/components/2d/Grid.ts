import { calculateGridOffset, drawLine, GridProperties } from '../../utils/CanvasUtils';
import Drawing2DContext from './Drawing2DContext';
import { IModel2DProps } from './IModel2D';
import Model2D from './Model2D';
import { RULLER_WIDTH } from './Ruller';

export default class Grid extends Model2D {
  render(drawingContext: Drawing2DContext, props: IModel2DProps): void {
    this.drawGrid(drawingContext.canvas, drawingContext.context, props as GridProperties);
  }

  drawGrid(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, config: GridProperties) {
    var offsetX = calculateGridOffset(config, -config.gridOriginX);
    var offsetY = calculateGridOffset(config, -config.gridOriginY);

    // this is to avoid blury lines
    context.translate(0.5, 0.5);

    var width = canvas.width;
    var height = canvas.height;
    for (var x = RULLER_WIDTH; x <= width / config.gridSpacing; x++) {
      drawLine(
        context,
        config.gridSpacing * x + offsetX,
        config.gridSpacing * RULLER_WIDTH + offsetX,
        config.gridSpacing * x + offsetX,
        height,
        config.gridWidth,
        config.gridColor,
      );
    }
    for (var y = RULLER_WIDTH; y <= height / config.gridSpacing; y++) {
      drawLine(
        context,
        config.gridSpacing * RULLER_WIDTH + offsetY,
        config.gridSpacing * y + offsetY,
        width,
        config.gridSpacing * y + offsetY,
        config.gridWidth,
        config.gridColor,
      );
    }

    // restore after context.translate
    context.setTransform(1, 0, 0, 1, 0, 0);
  }
}
