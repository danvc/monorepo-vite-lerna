import Drawing2DContext from './Drawing2DContext';
import GuideLines from './GuideLines';
import { IModel2DProps } from './IModel2D';
import Model2D from './Model2D';
import Ruller, { RulerAlign } from './Ruller';

export default class DraftingDesk extends Model2D {
  private horizontalRuller: Ruller = new Ruller({ align: RulerAlign.Horizontal });

  private verticalRuller: Ruller = new Ruller({ align: RulerAlign.Vertical });

  private guideLines: GuideLines = new GuideLines(20, 2);

  render(drawingContext: Drawing2DContext, props: IModel2DProps): void {
    this.horizontalRuller.render(drawingContext, props);
    this.verticalRuller.render(drawingContext, props);
    this.guideLines.render(drawingContext, props);
  }
}
