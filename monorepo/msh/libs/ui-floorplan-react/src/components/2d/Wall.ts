import { DesignerMode } from '../../@core/types/DesignerMode';
import IItem from '../../model/IItem';
import IWall from '../../model/IWall';
import { drawLabel, drawLine } from '../../utils/CanvasUtils';
import Utils2D from '../../utils/Utils2D';
import Corner from './Corner';
import Drawing2DContext from './Drawing2DContext';
import FloorPlan from './FloorPlan';
import HalfEdge from './HalfEdge';
import { IModel2DProps } from './IModel2D';
import Model2D from './Model2D';

export const DEFAULT_WALL_HEIGHT = 250;
export const DEFAULT_WALL_THICKNESS = 10;

const generateId = (start: Corner, end: Corner): string => {
  return [start.id, end.id].join();
};

export default class Wall extends Model2D implements IWall {
  /** The unique id of each wall. */
  public id: string;

  public start: Corner;

  public end: Corner;

  /** Front is the plane from start to end. */
  public frontEdge?: HalfEdge;

  /** Back is the plane from end to start. */
  public backEdge?: HalfEdge;

  /** Items attached to this wall */
  public items: IItem[] = [];

  /** Wall thickness. */
  public thickness = DEFAULT_WALL_THICKNESS;

  /** Wall height. */
  public height = DEFAULT_WALL_HEIGHT;

  public orphan: boolean = false;

  static createWall(floorplan: FloorPlan, start: Corner, end: Corner): Wall {
    return new Wall(floorplan, {
      id: generateId(start, end),
      start: start,
      end: end,
      thickness: DEFAULT_WALL_THICKNESS,
      items: [],
    });
  }

  constructor(private floorplan: FloorPlan, rec?: IWall) {
    super();

    this.start = rec?.start ? rec?.start : new Corner(floorplan);
    this.end = rec?.end ? rec?.end : new Corner(floorplan);
    this.id = rec?.id || generateId(this.start, this.end);

    this.items = rec?.items || [];
    this.thickness = rec?.thickness || DEFAULT_WALL_THICKNESS;

    this.start.attachStart(this);
    this.end.attachEnd(this);
  }

  render(drawingContext: Drawing2DContext, props: IModel2DProps): void {
    if (!this.deleted) {
      this.drawWall(drawingContext, props);
      this.drawWallLabels(drawingContext, props);
    }
  }

  public remove() {
    this.start.detachWall(this);
    this.end.detachWall(this);
    this.deleted = true;
  }

  /** */
  private drawWall(drawingContext: Drawing2DContext, props: IModel2DProps) {
    var hover = this === props.activeWall;
    var color = props.wallColor;
    if (hover && props.mode == DesignerMode.DELETE) {
      color = props.deleteColor;
    } else if (hover) {
      color = props.wallColorHover;
    }

    drawLine(
      drawingContext.context,
      drawingContext.convertX(this.getStartX()),
      drawingContext.convertY(this.getStartY()),
      drawingContext.convertX(this.getEndX()),
      drawingContext.convertY(this.getEndY()),
      hover ? props.wallWidthHover : props.wallWidth,
      color,
    );

    const newDrawingContext = drawingContext.withProperties({ hover: hover });
    if (!hover && this.frontEdge) {
      this.frontEdge.render(newDrawingContext, props);
    }
    if (!hover && this.backEdge) {
      this.backEdge.render(newDrawingContext, props);
    }
  }

  /** */
  private drawWallLabels(drawingContext: Drawing2DContext, props: IModel2DProps) {
    // we'll just draw the shorter label... idk
    if (this.backEdge && this.frontEdge) {
      if (this.backEdge.interiorDistance() < this.frontEdge.interiorDistance()) {
        this.drawEdgeLabel(drawingContext, this.backEdge, props);
      } else {
        this.drawEdgeLabel(drawingContext, this.frontEdge, props);
      }
    } else if (this.backEdge) {
      this.drawEdgeLabel(drawingContext, this.backEdge, props);
    } else if (this.frontEdge) {
      this.drawEdgeLabel(drawingContext, this.frontEdge, props);
    }
  }

  /** */
  private drawEdgeLabel(drawingContext: Drawing2DContext, edge: HalfEdge, props: IModel2DProps) {
    var pos = edge.interiorCenter();
    var length = edge.interiorDistance();
    if (length < 60) {
      // dont draw labels on walls this short
      return;
    }

    drawLabel(
      drawingContext.context,
      drawingContext.cmToMeasure(length),
      drawingContext.convertX(pos.x),
      drawingContext.convertY(pos.y),
      'normal 12px Arial',
      '#000000',
      'middle',
      'center',
      '#ffffff',
      4,
    );
  }

  public distanceFrom(x: number, y: number): number {
    return Utils2D.pointDistanceFromLine(x, y, this.getStartX(), this.getStartY(), this.getEndX(), this.getEndY());
  }

  public relativeMove(dx: number, dy: number) {
    this.start.relativeMove(dx, dy);
    this.end.relativeMove(dx, dy);
  }

  public snapToAxis(tolerance: number) {
    // order here is important, but unfortunately arbitrary
    this.start.snapToAxis(tolerance);
    this.end.snapToAxis(tolerance);
  }

  public getStart(): Corner {
    return this.start;
  }

  public getEnd(): Corner {
    return this.end;
  }

  public getStartX(): number {
    return this.start.x;
  }

  public getEndX(): number {
    return this.end.x;
  }

  public getStartY(): number {
    return this.start.y;
  }

  public getEndY(): number {
    return this.end.y;
  }

  public resetFrontBack() {
    this.frontEdge = undefined;
    this.backEdge = undefined;
    this.orphan = false;
  }

  public setStart(corner: Corner) {
    this.start.detachWall(this);
    corner.attachStart(this);
    this.start = corner;
  }

  public setEnd(corner: Corner) {
    this.end.detachWall(this);
    corner.attachEnd(this);
    this.end = corner;
  }
}
