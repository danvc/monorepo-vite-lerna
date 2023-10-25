import { DesignerMode } from '../../@core/types/DesignerMode';
import ICorner from '../../model/ICorner';
import { drawCircle } from '../../utils/CanvasUtils';
import { Utils } from '../../utils/Utils';
import Utils2D from '../../utils/Utils2D';
import Drawing2DContext from './Drawing2DContext';
import FloorPlan from './FloorPlan';
import { IModel2DProps } from './IModel2D';
import Model2D from './Model2D';
import Wall from './Wall';

export default class Corner extends Model2D implements ICorner {
  public id: string;
  public x: number;
  public y: number;

  /** Array of start walls. */
  public wallStarts: Wall[] = [];

  /** Array of end walls. */
  public wallEnds: Wall[] = [];

  static createCorner(floorplan: FloorPlan, x: number, y: number, id?: string): Corner {
    return new Corner(floorplan, { x: x, y: y, id: id || Utils.guid() });
  }

  constructor(private floorplan: FloorPlan, rec?: ICorner) {
    super();

    this.id = rec?.id || Utils.guid();
    this.x = rec?.x || 0;
    this.y = rec?.y || 0;

    if (rec) {
      const cornerImpl = rec as Corner;
      if (cornerImpl.wallStarts) {
        this.wallStarts = [...cornerImpl.wallStarts];
      }
      if (cornerImpl.wallEnds) {
        this.wallEnds = [...cornerImpl.wallEnds];
      }
    }
  }

  render(drawingContext: Drawing2DContext, props: IModel2DProps): void {
    if (!this.deleted) {
      var color = props.cornerColor;
      const hover = this === props.activeCorner;
      if (hover && props.mode == DesignerMode.DELETE) {
        color = props.deleteColor;
      } else if (hover) {
        color = props.cornerColorHover;
      }

      drawCircle(
        drawingContext.context,
        drawingContext.convertX(this.x),
        drawingContext.convertY(this.y),
        hover ? props.cornerRadiusHover : props.cornerRadius,
        color,
      );
    }
  }

  /** Attaches a start wall.
   * @param wall A wall.
   */
  public attachStart(wall: Wall) {
    this.wallStarts.push(wall);
  }

  /** Attaches an end wall.
   * @param wall A wall.
   */
  public attachEnd(wall: Wall) {
    this.wallEnds.push(wall);
  }

  /**
   *
   */
  public distanceFrom(x: number, y: number): number {
    var distance = Utils2D.distance(x, y, this.x, this.y);
    //console.log('x,y ' + x + ',' + y + ' to ' + this.getX() + ',' + this.getY() + ' is ' + distance);
    return distance;
  }

  /** Gets the distance from a wall.
   * @param wall A wall.
   * @returns The distance.
   */
  public distanceFromWall(wall: Wall): number {
    return wall.distanceFrom(this.x, this.y);
  }

  /** Gets the distance from a corner.
   * @param corner A corner.
   * @returns The distance.
   */
  public distanceFromCorner(corner: Corner): number {
    return this.distanceFrom(corner.x, corner.y);
  }

  /** Moves corner to new position.
   * @param newX The new x position.
   * @param newY The new y position.
   */
  public move(newX: number, newY: number) {
    this.x = newX;
    this.y = newY;
    this.floorplan.mergeWithIntersected(this);
  }

  /**
   *
   */
  public snapToAxis(tolerance: number): { x: boolean; y: boolean } {
    // try to snap this corner to an axis
    var snapped = {
      x: false,
      y: false,
    };

    var scope = this;

    this.adjacentCorners().forEach((corner) => {
      if (Math.abs(corner.x - scope.x) < tolerance) {
        scope.x = corner.x;
        snapped.x = true;
      }
      if (Math.abs(corner.y - scope.y) < tolerance) {
        scope.y = corner.y;
        snapped.y = true;
      }
    });
    return snapped;
  }

  /** Gets the adjacent corners.
   * @returns Array of corners.
   */
  public adjacentCorners(): Corner[] {
    var retArray = [];
    for (var i = 0; i < this.wallStarts.length; i++) {
      retArray.push(this.wallStarts[i].getEnd());
    }
    for (var j = 0; j < this.wallEnds.length; j++) {
      retArray.push(this.wallEnds[j].getStart());
    }
    return retArray;
  }

  /** Checks if a wall is connected.
   * @param wall A wall.
   * @returns True in case of connection.
   */
  public isWallConnected(wall: Wall): boolean {
    for (var i = 0; i < this.wallStarts.length; i++) {
      if (this.wallStarts[i] == wall) {
        return true;
      }
    }
    for (var j = 0; j < this.wallEnds.length; j++) {
      if (this.wallEnds[j] == wall) {
        return true;
      }
    }
    return false;
  }

  /** Detaches a wall.
   * @param wall A wall.
   */
  public detachWall(wall: Wall) {
    Utils.removeValue(this.wallStarts, wall);
    Utils.removeValue(this.wallEnds, wall);
    if (this.wallStarts.length == 0 && this.wallEnds.length == 0) {
      this.remove();
    }
  }

  /** Get wall to corner.
   * @param corner A corner.
   * @return The associated wall or null.
   */
  public wallTo(corner: Corner): Wall | null {
    for (var i = 0; i < this.wallStarts.length; i++) {
      if (this.wallStarts[i].getEnd() === corner) {
        return this.wallStarts[i];
      }
    }
    return null;
  }

  /** Get wall from corner.
   * @param corner A corner.
   * @return The associated wall or null.
   */
  public wallFrom(corner: Corner): Wall | null {
    for (var i = 0; i < this.wallEnds.length; i++) {
      if (this.wallEnds[i].getStart() === corner) {
        return this.wallEnds[i];
      }
    }
    return null;
  }

  /** Removes all walls. */
  public removeAll() {
    for (var i = 0; i < this.wallStarts.length; i++) {
      this.wallStarts[i].remove();
    }
    for (var j = 0; j < this.wallEnds.length; j++) {
      this.wallEnds[j].remove();
    }
    this.remove();
  }

  /** Remove callback. Fires the delete callbacks. */
  public remove() {
    this.deleted = true;
  }

  /** Moves corner relatively to new position.
   * @param dx The delta x.
   * @param dy The delta y.
   */
  public relativeMove(dx: number, dy: number) {
    this.move(this.x + dx, this.y + dy);
  }
}
