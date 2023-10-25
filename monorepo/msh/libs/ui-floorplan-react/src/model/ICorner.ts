import Coordinates from '../@core/types/Coordinate';
import IWall from './IWall';

export default interface ICorner extends Coordinates {
  /** The unique id of each wall. */
  id: string;
}
