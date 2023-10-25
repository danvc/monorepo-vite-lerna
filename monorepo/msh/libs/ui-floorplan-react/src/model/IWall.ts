import Corner from '../components/2d/Corner';
import IItem from './IItem';

export default interface IWall {
  /** The unique id of each wall. */
  id: string;

  start: Corner;

  end: Corner;

  /** Items attached to this wall */
  items: IItem[];

  /** Wall thickness. */
  thickness: number;
}
