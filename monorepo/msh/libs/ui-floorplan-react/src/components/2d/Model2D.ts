import Drawing2DContext from './Drawing2DContext';
import IModel2D, { IModel2DProps } from './IModel2D';

export default abstract class Model2D implements IModel2D {
  private _deleted: boolean = false;

  public get deleted(): boolean {
    return this._deleted;
  }

  public set deleted(deleted: boolean) {
    this._deleted = deleted;
  }

  render(drawingContext: Drawing2DContext, props: IModel2DProps): void {
    throw new Error('Method not implemented.');
  }
}
