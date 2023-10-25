import ICorner from './ICorner';
import IWall from './IWall';

export default interface IFloorPlan {
  id: string;

  corners: ICorner[];

  walls: IWall[];
}
