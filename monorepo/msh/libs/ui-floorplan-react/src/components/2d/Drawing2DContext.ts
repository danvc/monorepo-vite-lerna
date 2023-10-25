import { Coordinate } from '../../model';
import {
  configDimUnit,
  Configuration,
  dimCentiMeter,
  dimInch,
  dimMeter,
  dimMilliMeter,
} from '../../utils/configuration';

export type PROPERTIES_MAP = {
  [key: string]: any;
};

export default class Drawing2DContext {
  private properties: PROPERTIES_MAP = {};

  constructor(
    public canvas: HTMLCanvasElement,
    public context: CanvasRenderingContext2D,
    private originX: number,
    private originY: number,
    private cmPerPixel: number,
    private pixelsPerCm: number,
    public cursor: Coordinate,
  ) {}

  /** Convert from THREEjs coords to canvas coords. */
  public convertX(x: number): number {
    return (x - this.originX * this.cmPerPixel) * this.pixelsPerCm;
  }

  /** Convert from THREEjs coords to canvas coords. */
  public convertY(y: number): number {
    return (y - this.originY * this.cmPerPixel) * this.pixelsPerCm;
  }

  public withProperties(properties: PROPERTIES_MAP): Drawing2DContext {
    const newContext = new Drawing2DContext(
      this.canvas,
      this.context,
      this.originX,
      this.originY,
      this.cmPerPixel,
      this.pixelsPerCm,
      this.cursor,
    );
    newContext.properties = { ...this.properties, ...properties };
    return newContext;
  }

  public getProperty<T>(name: string): T {
    return this.properties[name] as T;
  }

  public cmToMeasure(cm: number): string {
    switch (Configuration.getStringValue(configDimUnit)) {
      case dimInch:
        var realFeet = (cm * 0.3937) / 12;
        var feet = Math.floor(realFeet);
        var inches = Math.round((realFeet - feet) * 12);
        return feet + "'" + inches + '"';
      case dimMilliMeter:
        return '' + Math.round(10 * cm) + ' mm';
      case dimCentiMeter:
        return '' + Math.round(10 * cm) / 10 + ' cm';
      case dimMeter:
      default:
        return '' + Math.round(10 * cm) / 1000 + ' m';
    }
  }
}
