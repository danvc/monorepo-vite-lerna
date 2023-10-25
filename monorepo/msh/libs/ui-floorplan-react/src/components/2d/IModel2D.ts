import Color from '../../@core/types/Color';
import { DesignerMode } from '../../@core/types/DesignerMode';
import Corner from './Corner';
import Drawing2DContext from './Drawing2DContext';
import Wall from './Wall';

export interface IModel2DProps {
  mode: DesignerMode;

  // room config
  roomColor: Color;

  // wall config
  wallWidth: number;
  wallWidthHover: number;
  wallColor: Color;
  wallColorHover: Color;
  edgeColor: Color;
  edgeColorHover: Color;
  edgeWidth: number;

  deleteColor: Color;

  // corner config
  cornerRadius: number;
  cornerRadiusHover: number;
  cornerColor: Color;
  cornerColorHover: Color;

  // grid parameters
  gridSpacing: number; // pixels
  gridWidth: number;
  gridColor: Color;
  gridOriginX: number;
  gridOriginY: number;
  gridBgColor: Color;

  activeCorner?: Corner;
  activeWall?: Wall;
}

export default interface IModel2D {
  deleted: boolean;

  render(drawingContext: Drawing2DContext, props: IModel2DProps): void;
}
