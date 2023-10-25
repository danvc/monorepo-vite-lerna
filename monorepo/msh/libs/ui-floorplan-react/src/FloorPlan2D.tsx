import _ from 'lodash';
import React from 'react';
import { AiFillFolderOpen } from 'react-icons/ai';
import { BiSave } from 'react-icons/bi';
import { RiAddFill, RiCloseFill, RiDragMoveLine } from 'react-icons/ri';
import { useResizeDetector } from 'react-resize-detector';
import styled from 'styled-components';
import { ToolbarBtn, ToolbarGroup, useToolbarContext } from 'ui-neumorphic-react';

import { DesignerMode } from './@core/types/DesignerMode';
import Corner from './components/2d/Corner';
import DraftingDesk from './components/2d/DraftingDesk';
import Drawing2DContext from './components/2d/Drawing2DContext';
import FloorPlan from './components/2d/FloorPlan';
import { IModel2DProps } from './components/2d/IModel2D';
import Wall from './components/2d/Wall';
import { IFloorPlan } from './model';
import { drawCircle, drawLine, htmlOffset } from './utils/CanvasUtils';

/** how much will we move a corner to make a wall axis aligned (cm) */
const DEFAULT_SNAP_TOLERANCE = 25;

interface FloorPlan2DProps {
  floorplan?: IFloorPlan;

  onChange?: (floorplan: IFloorPlan) => void;
}

interface FloorPlan2DState {
  mode: DesignerMode;
  prevMode?: DesignerMode;
  floorplan: FloorPlan;
  prevFloorplan?: IFloorPlan;
}

type Props = typeof FloorPlan2D.defaultProps &
  FloorPlan2DProps & {
    width?: number;
    height?: number;
    updateToolbar: (toolbarName: string, toolbar: React.ReactNode | React.ReactNode[]) => void;
    clearToolbar: (toolbarName: string) => void;
  };

const FloorPlan2DContainer = styled.div`
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
`;

const Canvas = styled.canvas`
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
`;

class FloorPlan2D extends React.Component<Props, FloorPlan2DState> {
  static defaultProps = {
    mode: DesignerMode.DRAW,

    width: 300,
    height: 300,

    // room config
    roomColor: '#f9f9f9',

    // wall config
    wallWidth: 5,
    wallWidthHover: 7,
    wallColor: '#dddddd',
    wallColorHover: '#008cba',
    edgeColor: '#888888',
    edgeColorHover: '#008cba',
    edgeWidth: 1,

    deleteColor: '#ff0000',

    // corner config
    cornerRadius: 0,
    cornerRadiusHover: 7,
    cornerColor: '#cccccc',
    cornerColorHover: '#008cba',

    // grid parameters
    gridSpacing: 20, // pixels
    gridWidth: 1,
    gridColor: '#f1f1f1',
    gridOriginX: 0,
    gridOriginY: 0,
    gridBgColor: '#fafafa',
  } as IModel2DProps;

  canvasRef: React.RefObject<HTMLCanvasElement>;

  /** */
  mouseDown = false;

  /** */
  mouseMoved = false;

  /** in ThreeJS coords */
  mouseX = 0;

  /** in ThreeJS coords */
  mouseY = 0;

  /** in ThreeJS coords */
  rawMouseX = 0;

  /** in ThreeJS coords */
  rawMouseY = 0;

  /** mouse position at last click */
  lastX = 0;

  /** mouse position at last click */
  lastY = 0;

  /** drawing state */
  targetX = 0;

  /** drawing state */
  targetY = 0;

  /** drawing state */
  lastNode: Corner | null = null;

  /** */
  originX = 0;

  /** */
  originY = 0;

  activeCorner: Corner | null = null;

  activeWall: Wall | null = null;

  /** */
  cmPerPixel: number;

  /** */
  pixelsPerCm: number;

  draftingDesk: DraftingDesk = new DraftingDesk();

  static getDerivedStateFromProps(props: Props, state: FloorPlan2DState) {
    if (props.mode !== state.prevMode || (props.floorplan && !_.isEqual(props.floorplan, state.prevFloorplan))) {
      return {
        prevMode: state.mode,
        mode: props.mode,
        prevFloorplan: props.floorplan,
        floorplan: new FloorPlan(props.floorplan),
      };
    }
    return null; // No change to state
  }

  constructor(props: Props) {
    super(props);

    this.canvasRef = React.createRef<HTMLCanvasElement>();

    const cmPerFoot = 30.48;
    const pixelsPerFoot = 15.0;
    this.cmPerPixel = cmPerFoot * (1.0 / pixelsPerFoot);
    this.pixelsPerCm = 1.0 / this.cmPerPixel;

    this.state = {
      mode: props.mode || DesignerMode.DRAW,
      prevMode: props.mode || DesignerMode.DRAW,
      floorplan: new FloorPlan(props.floorplan),
      prevFloorplan: props.floorplan,
    };
  }

  componentDidMount(): void {
    this.props.updateToolbar('rightPanel', this.viewToolbar());
    document.addEventListener('keyup', this._handleKeyDown);
    this.draw(true);
  }

  componentDidUpdate(prevProps: Props, prevState: FloorPlan2DState) {
    this.draw(true);
  }

  componentWillUnmount(): void {
    this.props.clearToolbar('rightPanel');
    document.removeEventListener('keyup', this._handleKeyDown);
  }

  _handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        this.escapeKey();
        break;
      default:
        break;
    }
  };

  setMode(mode: DesignerMode): void {
    console.log(`Update mode: ${mode}`);
    this.setState(
      (state) => {
        return {
          ...state,
          mode: mode,
        };
      },
      () => {
        this.props.updateToolbar('rightPanel', this.viewToolbar());
      },
    );
  }

  /** */
  private escapeKey() {
    this.setMode(DesignerMode.MOVE);
    this.lastNode = null;
  }

  viewToolbar(): React.ReactNode | React.ReactNode[] {
    return [
      <ToolbarGroup key="ToolbarGroup1">
        <ToolbarBtn>
          <AiFillFolderOpen onClick={() => console.log('Load is not implemented!')} />
        </ToolbarBtn>
        <ToolbarBtn>
          <BiSave onClick={() => console.log('Save is not implemented!')} />
        </ToolbarBtn>
      </ToolbarGroup>,

      <ToolbarGroup key="ToolbarGroup2">
        <ToolbarBtn primary={this.state.mode === DesignerMode.DRAW}>
          <RiAddFill onClick={() => this.setMode(DesignerMode.DRAW)} />
        </ToolbarBtn>
        <ToolbarBtn primary={this.state.mode === DesignerMode.MOVE}>
          <RiDragMoveLine onClick={() => this.setMode(DesignerMode.MOVE)} />
        </ToolbarBtn>
        <ToolbarBtn primary={this.state.mode === DesignerMode.DELETE}>
          <RiCloseFill onClick={() => this.setMode(DesignerMode.DELETE)} />
        </ToolbarBtn>
      </ToolbarGroup>,
    ];
  }

  draw(redrawFloor: boolean): void {
    this.state.floorplan.cleanUp();

    const canvas = this.canvasRef.current;
    const context = canvas?.getContext('2d');
    if (canvas && context) {
      this.updateCanvasSize(canvas, context);
      if (redrawFloor) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }

      const props = {
        ...this.props,
        mode: this.state.mode,
        activeCorner: this.activeCorner,
        activeWall: this.activeWall,
      } as IModel2DProps;

      const drawingContext = new Drawing2DContext(
        canvas,
        context,
        this.originX,
        this.originY,
        this.cmPerPixel,
        this.pixelsPerCm,
        { x: this.mouseX, y: this.mouseY },
      );

      if (redrawFloor) {
        this.state.floorplan.render(drawingContext, props);

        if (this.state.mode == DesignerMode.DRAW && this.mouseMoved) {
          this.drawTarget(drawingContext, this.targetX, this.targetY, this.lastNode);
        }
      }

      this.draftingDesk.render(drawingContext, props);
    }
  }

  updateCanvasSize(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
    if (
      this.props.width &&
      this.props.height &&
      (canvas.width !== this.props.width || (this.props.height && canvas.height !== this.props.height))
    ) {
      const { devicePixelRatio: ratio = 1 } = window;
      canvas.width = this.props.width * ratio;
      canvas.height = this.props.height * ratio;
      context.scale(ratio, ratio);
    }
  }

  onMouseDown = (event: React.MouseEvent<HTMLCanvasElement>): void => {
    const canvas = this.canvasRef.current;
    if (canvas) {
      this.pressEventHandler(canvas, event.clientX, event.clientY);
    }
  };
  onTouchStart = (event: React.TouchEvent<HTMLCanvasElement>): void => {
    const canvas = this.canvasRef.current;
    if (canvas) {
      this.pressEventHandler(canvas, event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    }
  };

  onMouseUp = (event: React.MouseEvent<HTMLCanvasElement>): void => {
    const canvas = this.canvasRef.current;
    if (canvas) {
      this.releaseEventHandler(canvas, event.clientX, event.clientY);
    }
  };
  onTouchEnd = (event: React.TouchEvent<HTMLCanvasElement>): void => {
    const canvas = this.canvasRef.current;
    if (canvas) {
      this.releaseEventHandler(canvas, event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    }
  };

  onMouseMove = (event: React.MouseEvent<HTMLCanvasElement>): void => {
    const canvas = this.canvasRef.current;
    if (canvas) {
      if (this.dragEventHandler(canvas, event.clientX, event.clientY)) {
        event.preventDefault();
      }
    }
  };
  onTouchMove = (event: React.TouchEvent<HTMLCanvasElement>): void => {
    const canvas = this.canvasRef.current;
    if (canvas) {
      if (this.dragEventHandler(canvas, event.changedTouches[0].clientX, event.changedTouches[0].clientY)) {
        event.preventDefault();
      }
    }
  };

  onMouseLeave = (event: React.MouseEvent<HTMLCanvasElement>): void => {
    const canvas = this.canvasRef.current;
    if (canvas) {
      this.cancelEventHandler(canvas, event.clientX, event.clientY);
    }
  };
  onTouchCancel = (event: React.TouchEvent<HTMLCanvasElement>): void => {
    const canvas = this.canvasRef.current;
    if (canvas) {
      this.cancelEventHandler(canvas, event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    }
  };

  pressEventHandler = (canvas: HTMLCanvasElement, x: number, y: number): void => {
    this.mouseDown = true;
    this.mouseMoved = false;
    this.lastX = this.rawMouseX;
    this.lastY = this.rawMouseY;

    // delete
    if (this.state.mode == DesignerMode.DELETE) {
      if (this.activeCorner) {
        this.activeCorner.removeAll();
      } else if (this.activeWall) {
        this.activeWall.remove();
      } else {
        this.setMode(DesignerMode.MOVE);
      }
    }
  };

  releaseEventHandler = (canvas: HTMLCanvasElement, x: number, y: number): void => {
    this.mouseDown = false;

    // drawing
    if (this.state.mode == DesignerMode.DRAW && !this.mouseMoved) {
      const corner: Corner = this.state.floorplan.newCorner(this.targetX, this.targetY);
      if (this.lastNode != null) {
        this.state.floorplan.newWall(this.lastNode, corner);
      }
      if (this.state.floorplan.mergeWithIntersected(corner) && this.lastNode != null) {
        this.setMode(DesignerMode.MOVE);
        this.lastNode = null;
      } else {
        this.lastNode = corner;
      }

      this.updateModel();
    }
  };

  /*
  dragEventHandler = (canvas: HTMLCanvasElement, x: number, y: number): boolean => {
    this.mouseMoved = true;

    // update mouse
    this.rawMouseX = x;
    this.rawMouseY = y;
    this.mouseX = (x - htmlOffset(canvas).left) * this.cmPerPixel + this.originX * this.cmPerPixel;
    this.mouseY = (y - htmlOffset(canvas).top) * this.cmPerPixel + this.originY * this.cmPerPixel;

    // update target (snapped position of actual mouse)
    if (this.state.mode == DesignerMode.DRAW || (this.state.mode == DesignerMode.MOVE && this.mouseDown)) {
      this.updateTarget();
    }

    // update object target
    if (this.state.mode != DesignerMode.DRAW && !this.mouseDown) {
      var hoverCorner = this.state.floorplan.overlappedCorner(this.mouseX, this.mouseY);
      var hoverWall = this.state.floorplan.overlappedWall(this.mouseX, this.mouseY);
      var draw = false;
      if (hoverCorner != this.activeCorner) {
        this.activeCorner = hoverCorner;
        draw = true;
      }
      // corner takes precendence
      if (this.activeCorner == null) {
        if (hoverWall != this.activeWall) {
          this.activeWall = hoverWall;
          draw = true;
        }
      } else {
        this.activeWall = null;
      }
      if (draw) {
        this.draw();
      }
    }

    // panning
    if (this.mouseDown && !this.activeCorner && !this.activeWall) {
      this.originX += this.lastX - this.rawMouseX;
      this.originY += this.lastY - this.rawMouseY;
      this.lastX = this.rawMouseX;
      this.lastY = this.rawMouseY;
      this.draw();
    }

    // dragging
    if (this.state.mode == DesignerMode.MOVE && this.mouseDown) {
      if (this.activeCorner) {
        this.activeCorner.move(this.mouseX, this.mouseY);
        this.state.floorplan.mergeWithIntersected(this.activeCorner);
        this.activeCorner.snapToAxis(DEFAULT_SNAP_TOLERANCE);
      } else if (this.activeWall) {
        this.activeWall.relativeMove(
          (this.rawMouseX - this.lastX) * this.cmPerPixel,
          (this.rawMouseY - this.lastY) * this.cmPerPixel,
        );
        this.activeWall.snapToAxis(DEFAULT_SNAP_TOLERANCE);
        this.lastX = this.rawMouseX;
        this.lastY = this.rawMouseY;
      }
      this.draw();
    }

    return false;
  };*/

  dragEventHandler = (canvas: HTMLCanvasElement, x: number, y: number): boolean => {
    this.mouseMoved = true;

    // update mouse
    this.rawMouseX = x;
    this.rawMouseY = y;
    this.mouseX = (x - htmlOffset(canvas).left) * this.cmPerPixel + this.originX * this.cmPerPixel;
    this.mouseY = (y - htmlOffset(canvas).top) * this.cmPerPixel + this.originY * this.cmPerPixel;

    // update target (snapped position of actual mouse)
    if (this.state.mode == DesignerMode.DRAW || (this.state.mode == DesignerMode.MOVE && this.mouseDown)) {
      this.updateTarget();
    }

    let draw = false;

    // update object target
    if (this.state.mode != DesignerMode.DRAW && !this.mouseDown) {
      var hoverCorner = this.state.floorplan.overlappedCorner(this.mouseX, this.mouseY);
      var hoverWall = this.state.floorplan.overlappedWall(this.mouseX, this.mouseY);
      if (hoverCorner != this.activeCorner) {
        this.activeCorner = hoverCorner;
        draw = true;
      }
      // corner takes precendence
      if (this.activeCorner == null) {
        if (hoverWall != this.activeWall) {
          this.activeWall = hoverWall;
          draw = true;
        }
      } else {
        this.activeWall = null;
      }
    }

    // panning
    if (this.mouseDown && !this.activeCorner && !this.activeWall) {
      this.originX += this.lastX - this.rawMouseX;
      this.originY += this.lastY - this.rawMouseY;
      this.lastX = this.rawMouseX;
      this.lastY = this.rawMouseY;
      draw = true;
    }

    // dragging
    if (this.state.mode == DesignerMode.MOVE && this.mouseDown) {
      if (this.activeCorner) {
        this.activeCorner.move(this.mouseX, this.mouseY);
        this.state.floorplan.mergeWithIntersected(this.activeCorner);
        this.activeCorner.snapToAxis(DEFAULT_SNAP_TOLERANCE);
      } else if (this.activeWall) {
        this.activeWall.relativeMove(
          (this.rawMouseX - this.lastX) * this.cmPerPixel,
          (this.rawMouseY - this.lastY) * this.cmPerPixel,
        );
        this.activeWall.snapToAxis(DEFAULT_SNAP_TOLERANCE);
        this.lastX = this.rawMouseX;
        this.lastY = this.rawMouseY;
      }
      draw = true;
    }

    this.draw(draw);

    return false;
  };

  cancelEventHandler = (canvas: HTMLCanvasElement, x: number, y: number): void => {
    this.mouseDown = false;
    this.mouseMoved = false;
    this.draw(true);
  };

  private updateTarget() {
    if (this.state.mode == DesignerMode.DRAW && this.lastNode) {
      if (Math.abs(this.mouseX - this.lastNode.x) < DEFAULT_SNAP_TOLERANCE) {
        this.targetX = this.lastNode.x;
      } else {
        this.targetX = this.mouseX;
      }
      if (Math.abs(this.mouseY - this.lastNode.y) < DEFAULT_SNAP_TOLERANCE) {
        this.targetY = this.lastNode.y;
      } else {
        this.targetY = this.mouseY;
      }
    } else {
      this.targetX = this.mouseX;
      this.targetY = this.mouseY;
    }

    this.draw(true);
  }

  /** */
  private drawTarget(drawingContext: Drawing2DContext, x: number, y: number, lastNode: Corner | null) {
    const canvas = this.canvasRef.current;
    const context = canvas?.getContext('2d') || null;

    if (context) {
      drawCircle(
        context,
        drawingContext.convertX(x),
        drawingContext.convertY(y),
        this.props.cornerRadiusHover,
        this.props.cornerColorHover,
      );
      if (lastNode) {
        drawLine(
          context,
          drawingContext.convertX(lastNode.x),
          drawingContext.convertY(lastNode.y),
          drawingContext.convertX(x),
          drawingContext.convertY(y),
          this.props.wallWidthHover,
          this.props.wallColorHover,
        );
      }
    }
  }

  private updateModel() {
    console.log('!!!! update model !!!');
  }

  render(): JSX.Element {
    return (
      <>
        <Canvas
          ref={this.canvasRef}
          width={this.props.width}
          height={this.props.height}
          onMouseDown={(event) => this.onMouseDown(event)}
          onTouchStart={(event) => this.onTouchStart(event)}
          onMouseUp={(event) => this.onMouseUp(event)}
          onTouchEnd={(event) => this.onTouchEnd(event)}
          onMouseMove={(event) => this.onMouseMove(event)}
          onTouchMove={(event) => this.onTouchMove(event)}
          onMouseLeave={(event) => this.onMouseLeave(event)}
          onTouchCancel={(event) => this.onTouchCancel(event)}
          style={{ backgroundColor: this.props.gridBgColor }}
        />
      </>
    );
  }
}

const FloorPlan2DWrapper = (props: FloorPlan2DProps) => {
  const { width, height, ref } = useResizeDetector<HTMLDivElement>({ refreshMode: 'throttle', refreshRate: 1000 });
  const { showToolbar, clearToolbar } = useToolbarContext();

  return (
    <FloorPlan2DContainer ref={ref} className="floorPlan2D">
      <FloorPlan2D {...props} width={width} height={height} updateToolbar={showToolbar} clearToolbar={clearToolbar} />
    </FloorPlan2DContainer>
  );
};

export default FloorPlan2DWrapper;
