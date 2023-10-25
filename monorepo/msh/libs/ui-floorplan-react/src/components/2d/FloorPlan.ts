import Coordinate from '../../@core/types/Coordinate';
import IFloorPlan from '../../model/IFloorPlan';
import { Utils } from '../../utils/Utils';
import Utils2D from '../../utils/Utils2D';
import Corner from './Corner';
import Drawing2DContext from './Drawing2DContext';
import Grid from './Grid';
import HalfEdge from './HalfEdge';
import { IModel2DProps } from './IModel2D';
import Model2D from './Model2D';
import Room from './Room';
import Ruller, { RulerAlign } from './Ruller';
import Wall from './Wall';

type BOOL_MAP = {
  [key: string]: boolean;
};

const cornerTolerance: number = 20;
const defaultFloorPlanTolerance = 10.0;

export default class FloorPlan extends Model2D implements IFloorPlan {
  public id: string;

  public walls: Wall[];

  public corners: Corner[];

  public rooms: Room[] = [];

  private grid: Grid = new Grid();

  constructor(rec?: IFloorPlan) {
    super();

    this.id = rec?.id || Utils.guid();
    this.walls = rec?.walls?.map((wall) => new Wall(this, wall)) || [];
    this.corners = rec?.corners?.map((corner) => new Corner(this, corner)) || [];
  }

  render(drawingContext: Drawing2DContext, props: IModel2DProps): void {
    this.grid.render(drawingContext, props);

    this.corners.forEach((corner) => corner.render(drawingContext, props));
    this.rooms.forEach((room) => room.render(drawingContext, props));
    this.walls.forEach((wall) => wall.render(drawingContext, props));
  }

  /**
   * Creates a new corner.
   * @param x The x coordinate.
   * @param y The y coordinate.
   * @param id An optional id. If unspecified, the id will be created internally.
   * @returns The new corner.
   */
  public newCorner(x: number, y: number, id?: string): Corner {
    var corner = Corner.createCorner(this, x, y, id);
    this.corners.push(corner);
    return corner;
  }

  /**
   * Creates a new wall.
   * @param start The start corner.
   * @param end he end corner.
   * @returns The new wall.
   */
  public newWall(start: Corner, end: Corner): Wall {
    var wall = Wall.createWall(this, start, end);
    this.walls.push(wall);
    this.update();
    return wall;
  }

  public overlappedCorner(x: number, y: number, tolerance?: number): Corner | null {
    tolerance = tolerance || defaultFloorPlanTolerance;
    for (var i = 0; i < this.corners.length; i++) {
      if (this.corners[i].distanceFrom(x, y) < tolerance) {
        return this.corners[i];
      }
    }
    return null;
  }

  public overlappedWall(x: number, y: number, tolerance?: number): Wall | null {
    tolerance = tolerance || defaultFloorPlanTolerance;
    for (var i = 0; i < this.walls.length; i++) {
      if (this.walls[i].distanceFrom(x, y) < tolerance) {
        return this.walls[i];
      }
    }
    return null;
  }

  public mergeWithIntersected(newCorner: Corner): boolean {
    // check corners
    for (var j = 0; j < this.corners.length; j++) {
      var corner = this.corners[j];
      if (newCorner.distanceFromCorner(corner) < cornerTolerance && corner != newCorner) {
        this.combineCorners(newCorner, corner);
        return true;
      }
    }
    // check walls
    for (var i = 0; i < this.walls.length; i++) {
      var wall = this.walls[i];
      if (newCorner.distanceFromWall(wall) < cornerTolerance && !newCorner.isWallConnected(wall)) {
        // update position to be on wall
        var intersection = Utils2D.closestPointOnLine(
          newCorner.x,
          newCorner.y,
          wall.getStart().x,
          wall.getStart().y,
          wall.getEnd().x,
          wall.getEnd().y,
        );
        newCorner.x = intersection.x;
        newCorner.y = intersection.y;
        // merge this corner into wall by breaking wall into two parts
        this.newWall(newCorner, wall.getEnd());
        wall.setEnd(newCorner);
        this.update();
        return true;
      }
    }
    return false;
  }

  /**
   * Update rooms
   */
  public update() {
    this.walls.forEach((wall) => {
      wall.resetFrontBack();
    });

    var roomCorners = this.findRooms(this.corners);
    this.rooms = [];
    var scope = this;
    roomCorners.forEach((corners) => {
      scope.rooms.push(new Room({ corners: corners }));
    });
    this.assignOrphanEdges();
  }

  /*
   * Find the "rooms" in our planar straight-line graph.
   * Rooms are set of the smallest (by area) possible cycles in this graph.
   * @param corners The corners of the floorplan.
   * @returns The rooms, each room as an array of corners.
   */
  public findRooms(corners: Corner[]): Corner[][] {
    function _calculateTheta(previousCorner: Corner, currentCorner: Corner, nextCorner: Corner) {
      var theta = Utils2D.angle2pi(
        previousCorner.x - currentCorner.x,
        previousCorner.y - currentCorner.y,
        nextCorner.x - currentCorner.x,
        nextCorner.y - currentCorner.y,
      );
      return theta;
    }

    function _removeDuplicateRooms(roomArray: Corner[][]): Corner[][] {
      var results: Corner[][] = [];
      var lookup: BOOL_MAP = {};
      var hashFunc = function (corner: Corner) {
        return corner.id;
      };
      var sep = '-';
      for (var i = 0; i < roomArray.length; i++) {
        // rooms are cycles, shift it around to check uniqueness
        var add = true;
        var str = undefined;
        var room = roomArray[i];
        for (var j = 0; j < room.length; j++) {
          var roomShift = Utils.cycle(room, j);
          str = roomShift.map(hashFunc).join(sep);
          if (Utils.hasProperty(lookup, str)) {
            add = false;
          }
        }

        if (add && str) {
          results.push(roomArray[i]);
          lookup[str] = true;
        }
      }
      return results;
    }

    function _findTightestCycle(firstCorner: Corner, secondCorner: Corner): Corner[] {
      var stack: {
        corner: Corner;
        previousCorners: Corner[];
      }[] = [];

      var next:
        | {
            corner: Corner;
            previousCorners: Corner[];
          }
        | undefined = {
        corner: secondCorner,
        previousCorners: [firstCorner],
      };
      var visited: BOOL_MAP = {};

      if (firstCorner.id) {
        visited[firstCorner.id] = true;
      }

      while (next) {
        // update previous corners, current corner, and visited corners
        var currentCorner = next.corner;
        if (currentCorner.id) {
          visited[currentCorner.id] = true;
        }

        // did we make it back to the startCorner?
        if (next.corner === firstCorner && currentCorner !== secondCorner) {
          return next.previousCorners;
        }

        var addToStack: Corner[] = [];
        var adjacentCorners = next.corner.adjacentCorners();
        for (var i = 0; i < adjacentCorners.length; i++) {
          var nextCorner = adjacentCorners[i];

          // is this where we came from?
          // give an exception if its the first corner and we aren't at the second corner
          if (
            nextCorner?.id &&
            nextCorner?.id in visited &&
            !(nextCorner === firstCorner && currentCorner !== secondCorner)
          ) {
            continue;
          }

          // nope, throw it on the queue
          addToStack.push(nextCorner);
        }

        var previousCorners = next.previousCorners.slice(0);
        previousCorners.push(currentCorner);
        if (addToStack.length > 1) {
          // visit the ones with smallest theta first
          var previousCorner = next.previousCorners[next.previousCorners.length - 1];
          addToStack.sort(function (a, b) {
            return (
              _calculateTheta(previousCorner, currentCorner, b) - _calculateTheta(previousCorner, currentCorner, a)
            );
          });
        }

        if (addToStack.length > 0) {
          // add to the stack
          addToStack.forEach((corner) => {
            stack.push({
              corner: corner,
              previousCorners: previousCorners,
            });
          });
        }

        // pop off the next one
        next = stack.pop();
      }

      return [];
    }

    // find tightest loops, for each corner, for each adjacent
    // TODO: optimize this, only check corners with > 2 adjacents, or isolated cycles
    var loops: Corner[][] = [];

    corners.forEach((firstCorner) => {
      firstCorner.adjacentCorners().forEach((secondCorner) => {
        loops.push(_findTightestCycle(firstCorner, secondCorner));
      });
    });

    // remove duplicates
    var uniqueLoops = _removeDuplicateRooms(loops);
    //remove CW loops
    // var uniqueCCWLoops = Utils.removeIf(uniqueLoops, Utils2D.isClockwise);
    var uniqueCCWLoops = uniqueLoops.filter((points: Coordinate[]) => Utils2D.isClockwise(points));

    return uniqueCCWLoops;
  }

  /** Ensure we do not have duplicate walls (i.e. same start and end points) */
  private removeDuplicateWalls(corner: Corner) {
    // delete the wall between these corners, if it exists
    type ENDPOINTS = {
      [key: string]: boolean;
    };

    var wallEndpoints: ENDPOINTS = {};
    var wallStartpoints: ENDPOINTS = {};
    for (var i = corner.wallStarts.length - 1; i >= 0; i--) {
      const endId: string | undefined = corner.wallStarts[i].getEnd().id;

      if (corner.wallStarts[i].getEnd() === corner) {
        // remove zero length wall
        corner.wallStarts[i].remove();
        this.removeWall(corner.wallStarts[i]);
      } else if (endId && endId in wallEndpoints) {
        // remove duplicated wall
        corner.wallStarts[i].remove();
        this.removeWall(corner.wallStarts[i]);
      } else if (endId) {
        wallEndpoints[endId] = true;
      }
    }
    for (var j = corner.wallEnds.length - 1; j >= 0; j--) {
      const endId = corner.wallEnds[j].getEnd().id;

      if (corner.wallEnds[j].getStart() === corner) {
        // removed zero length wall
        corner.wallEnds[j].remove();
        this.removeWall(corner.wallEnds[j]);
      } else if (endId && endId in wallStartpoints) {
        // removed duplicated wall
        corner.wallEnds[j].remove();
        this.removeWall(corner.wallEnds[j]);
      } else if (endId) {
        wallStartpoints[endId] = true;
      }
    }
  }

  /**
   *
   */
  public combineCorners(targetCorner: Corner, corner: Corner) {
    // update position to other corner's
    targetCorner.x = corner.x;
    targetCorner.y = corner.y;
    // absorb the other corner's wallStarts and wallEnds
    for (var i = corner.wallStarts.length - 1; i >= 0; i--) {
      corner.wallStarts[i].setStart(targetCorner);
    }
    for (var j = corner.wallEnds.length - 1; j >= 0; j--) {
      corner.wallEnds[j].setEnd(targetCorner);
    }
    // delete the other corner
    corner.removeAll();
    this.removeCorner(corner);
    this.removeDuplicateWalls(corner);
    this.update();
  }

  private assignOrphanEdges() {
    // kinda hacky
    // find orphaned wall segments (i.e. not part of rooms) and
    // give them edges
    var orphanWalls = [];
    this.walls.forEach((wall) => {
      if (!wall.backEdge && !wall.frontEdge) {
        wall.orphan = true;
        orphanWalls.push(wall);

        new HalfEdge(wall, false);
        new HalfEdge(wall, true);
      }
    });
  }

  /** Removes a corner.
   * @param corner The corner to be removed.
   */
  private removeCorner(corner: Corner) {
    Utils.removeValue(this.corners, corner);
  }

  /** Removes a wall.
   * @param wall The wall to be removed.
   */
  private removeWall(wall: Wall) {
    Utils.removeValue(this.walls, wall);
    this.update();
  }

  public cleanUp(): void {
    this.update();

    this.corners = this.corners.filter((corner) => !corner.deleted);
    this.walls = this.walls.filter((wall) => !wall.deleted);
    this.rooms = this.rooms.filter((room) => !room.deleted);
  }
}
