import { DesignerMode } from '../../@core/types/DesignerMode';
import { drawPolygon } from '../../utils/CanvasUtils';
import Utils2D from '../../utils/Utils2D';
import Drawing2DContext from './Drawing2DContext';
import { IModel2DProps } from './IModel2D';
import Model2D from './Model2D';
import Wall from './Wall';

export default class HalfEdge extends Model2D {
  /** The successor edge in counter clock wise direction. */
  public next?: HalfEdge;

  /** The predecessor edge in counter clock wise direction. */
  public prev?: HalfEdge;

  /** */
  public offset: number;

  /** */
  public height: number;

  /**
   * Constructs a half edge.
   * @param room The associated room.
   * @param wall The corresponding wall.
   * @param front True if front side.
   */
  constructor(public wall: Wall, public front: boolean) {
    super();

    this.front = front || false;

    this.offset = wall.thickness / 2.0;
    this.height = wall.height;

    if (this.front) {
      this.wall.frontEdge = this;
    } else {
      this.wall.backEdge = this;
    }
  }

  /** Get the corners of the half edge.
   * @returns An array of x,y pairs.
   */
  public corners(): { x: number; y: number }[] {
    return [this.interiorStart(), this.interiorEnd(), this.exteriorEnd(), this.exteriorStart()];
  }

  public interiorStart(): { x: number; y: number } {
    var vec = this.halfAngleVector(this.prev, this);
    return {
      x: this.getStart().x + vec.x,
      y: this.getStart().y + vec.y,
    };
  }

  // these return an object with attributes x, y
  public interiorEnd(): { x: number; y: number } {
    var vec = this.halfAngleVector(this, this.next);
    return {
      x: this.getEnd().x + vec.x,
      y: this.getEnd().y + vec.y,
    };
  }

  public exteriorStart(): { x: number; y: number } {
    var vec = this.halfAngleVector(this.prev, this);
    return {
      x: this.getStart().x - vec.x,
      y: this.getStart().y - vec.y,
    };
  }

  public exteriorEnd(): { x: number; y: number } {
    var vec = this.halfAngleVector(this, this.next);
    return {
      x: this.getEnd().x - vec.x,
      y: this.getEnd().y - vec.y,
    };
  }

  private getStart() {
    if (this.front) {
      return this.wall.getStart();
    } else {
      return this.wall.getEnd();
    }
  }

  private getEnd() {
    if (this.front) {
      return this.wall.getEnd();
    } else {
      return this.wall.getStart();
    }
  }

  /**
   * Gets CCW angle from v1 to v2
   */
  private halfAngleVector(v1?: HalfEdge, v2?: HalfEdge): { x: number; y: number } {
    var v1startX = 0,
      v1startY = 0,
      v1endX = 0,
      v1endY = 0;
    var v2startX = 0,
      v2startY = 0,
      v2endX = 0,
      v2endY = 0;

    // make the best of things if we dont have prev or next
    if (!v1 && v2) {
      v1startX = v2.getStart().x - (v2.getEnd().x - v2.getStart().x);
      v1startY = v2.getStart().y - (v2.getEnd().y - v2.getStart().y);
      v1endX = v2.getStart().x;
      v1endY = v2.getStart().y;
    } else if (v1) {
      v1startX = <number>v1.getStart().x;
      v1startY = <number>v1.getStart().y;
      v1endX = v1.getEnd().x;
      v1endY = v1.getEnd().y;
    }

    if (!v2 && v1) {
      v2startX = v1.getEnd().x;
      v2startY = v1.getEnd().y;
      v2endX = v1.getEnd().x + (v1.getEnd().x - v1.getStart().x);
      v2endY = v1.getEnd().y + (v1.getEnd().y - v1.getStart().y);
    } else if (v2) {
      v2startX = v2.getStart().x;
      v2startY = v2.getStart().y;
      v2endX = v2.getEnd().x;
      v2endY = v2.getEnd().y;
    }

    // CCW angle between edges
    var theta = Utils2D.angle2pi(v1startX - v1endX, v1startY - v1endY, v2endX - v1endX, v2endY - v1endY);

    // cosine and sine of half angle
    var cs = Math.cos(theta / 2.0);
    var sn = Math.sin(theta / 2.0);

    // rotate v2
    var v2dx = v2endX - v2startX;
    var v2dy = v2endY - v2startY;

    var vx = v2dx * cs - v2dy * sn;
    var vy = v2dx * sn + v2dy * cs;

    // normalize
    var mag = Utils2D.distance(0, 0, vx, vy);
    var desiredMag = this.offset / sn;
    var scalar = desiredMag / mag;

    var halfAngleVector = {
      x: vx * scalar,
      y: vy * scalar,
    };

    return halfAngleVector;
  }

  render(drawingContext: Drawing2DContext, props: IModel2DProps): void {
    if (!this.deleted) {
      const hover = drawingContext.getProperty('hover');
      let color = props.edgeColor;

      if (hover && props.mode == DesignerMode.DELETE) {
        color = props.deleteColor;
      } else if (hover) {
        color = props.edgeColorHover;
      }
      var corners = this.corners();

      drawPolygon(
        drawingContext.context,
        corners.map(function (corner) {
          return drawingContext.convertX(corner.x);
        }),
        corners.map(function (corner) {
          return drawingContext.convertY(corner.y);
        }),
        false,
        undefined,
        true,
        color,
        props.edgeWidth,
      );
    }
  }

  public interiorDistance(): number {
    var start = this.interiorStart();
    var end = this.interiorEnd();
    return Utils2D.distance(start.x, start.y, end.x, end.y);
  }

  public interiorCenter(): { x: number; y: number } {
    return {
      x: (this.interiorStart().x + this.interiorEnd().x) / 2.0,
      y: (this.interiorStart().y + this.interiorEnd().y) / 2.0,
    };
  }
}
