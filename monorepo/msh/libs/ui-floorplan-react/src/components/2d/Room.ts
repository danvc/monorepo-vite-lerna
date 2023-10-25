import ICorner from '../../model/ICorner';
import IRoom from '../../model/IRoom';
import { drawPolygon } from '../../utils/CanvasUtils';
import Corner from './Corner';
import Drawing2DContext from './Drawing2DContext';
import HalfEdge from './HalfEdge';
import { IModel2DProps } from './IModel2D';
import Model2D from './Model2D';

export default class Room extends Model2D implements IRoom {
  public corners: ICorner[];

  /** */
  public interiorCorners: Corner[] = [];

  /** */
  public edgePointer?: HalfEdge;

  constructor(rec?: IRoom) {
    super();

    this.corners = rec?.corners || [];

    this.updateWalls();
    this.updateInteriorCorners();
  }

  render(drawingContext: Drawing2DContext, props: IModel2DProps): void {
    if (!this.deleted) {
      drawPolygon(
        drawingContext.context,
        this.corners.map((corner: ICorner) => {
          return drawingContext.convertX(corner.x);
        }),
        this.corners.map((corner: ICorner) => {
          return drawingContext.convertY(corner.y);
        }),
        true,
        props.roomColor,
      );
    }
  }

  /**
   * Populates each wall's half edge relating to this room
   * this creates a fancy doubly connected edge list (DCEL)
   */
  private updateWalls() {
    var prevEdge = undefined;
    var firstEdge = undefined;

    for (var i = 0; i < this.corners.length; i++) {
      var firstCorner = this.corners[i] as Corner;
      var secondCorner = this.corners[(i + 1) % this.corners.length] as Corner;

      // find if wall is heading in that direction
      var wallTo = firstCorner.wallTo(secondCorner);
      var wallFrom = firstCorner.wallFrom(secondCorner);

      let edge: HalfEdge | undefined = undefined;

      if (wallTo) {
        edge = new HalfEdge(wallTo, true);
      } else if (wallFrom) {
        edge = new HalfEdge(wallFrom, false);
      } else {
        // something horrible has happened
        console.log('corners arent connected by a wall, uh oh');
      }

      if (i == 0) {
        firstEdge = edge;
      } else if (edge) {
        edge.prev = prevEdge;
        if (prevEdge) {
          prevEdge.next = edge;
          if (i + 1 == this.corners.length) {
            if (firstEdge) {
              firstEdge.prev = edge;
            }

            edge.next = firstEdge;
          }
        }
      }
      prevEdge = edge;
    }

    // hold on to an edge reference
    this.edgePointer = firstEdge;
  }

  private updateInteriorCorners() {
    let edge: HalfEdge | undefined | null = this.edgePointer;
    let loop = true;
    while (loop && edge) {
      this.interiorCorners.push(edge.interiorStart() as Corner);
      if (edge.next === this.edgePointer) {
        break;
      } else {
        edge = edge.next;
      }
    }
  }
}
