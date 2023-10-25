import React, { cloneElement, ReactElement, ReactPortal } from 'react';
import styled from 'styled-components';

import { ViewStyle } from '../ViewStyle';
import Resizer from './Resizer';
import SplitPanel, { SplitPanelImpl } from './SplitPanel';
interface SplitViewProps {
  id?: string;
  children: React.ReactNode | React.ReactNode[];
  className?: string;
  resizerStyle?: string;
  split: ViewStyle;

  onResizeEnd?: (sizes: number[]) => void;
  onResizeStart?: () => void;
  onChange?: (sizes: number[]) => void;

  resizerSize?: number;
  allowResize?: boolean;
}

interface SplitViewState {
  sizes: string[];
}

export const DEFAULT_PANE_SIZE = '1';
export const DEFAULT_PANE_MIN_SIZE = '0';
export const DEFAULT_PANE_MAX_SIZE = '100%';

function removeNullChildren(children: React.ReactNode | React.ReactNode[]): React.ReactNode[] {
  return React.Children.toArray(children).filter((c) => c && (c as ReactPortal).type === SplitPanel);
}

function createArray(panelsCount: number, defaultValue: unknown): unknown[] {
  const sizes: unknown[] = [];
  for (let i = 0; i < panelsCount; i += 1) {
    sizes[i] = defaultValue;
  }
  return sizes;
}

function getPanePropMinMaxSize(props: SplitViewProps, key: string): unknown {
  return removeNullChildren(props.children).map((child) => {
    const value = (child as ReactElement)?.props[key];
    if (value === undefined) {
      return key === 'maxSize' ? DEFAULT_PANE_MAX_SIZE : DEFAULT_PANE_MIN_SIZE;
    }

    return value;
  });
}

function arrayEquals(a: string[], b: string[]) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);
}

export function getUnit(size: string): string {
  if (size.endsWith('px')) {
    return 'px';
  }

  if (size.endsWith('%')) {
    return '%';
  }

  return 'ratio';
}

export function convertSizeToCssValue(value: string, resizersSize: number): string {
  if (getUnit(value) !== '%') {
    return value;
  }

  if (!resizersSize) {
    return value;
  }

  const idx = value.search('%');
  const percent = parseInt(value.slice(0, idx), 10) / 100;
  if (percent === 0) {
    return value;
  }

  return `calc(${value} - ${resizersSize}px*${percent})`;
}

function toPx(value: number, unit = 'px', size: number): number {
  switch (unit) {
    case '%': {
      return +((size * value) / 100).toFixed(2);
    }
    default: {
      return +value;
    }
  }
}

export function convert(str: string, size: number): number {
  const tokens = str.match(/([0-9]+)([px|%]*)/);
  if (tokens?.length && tokens.length > 2) {
    const value = parseInt(tokens[1], 10);
    const unit = tokens[2];
    return toPx(value, unit, size);
  }

  return 0;
}

function convertToUnit(size: number, unit: string, containerSize = 1): string {
  switch (unit) {
    case '%':
      return `${((size / containerSize) * 100).toFixed(2)}%`;
    case 'px':
      return `${size.toFixed(2)}px`;
    case 'ratio':
      return (size * 100).toFixed(0);
    default:
      return `${size.toFixed(2)}px`;
  }
}

interface DimentionSnapshot {
  resizersSize: number;
  paneDimensions: DOMRect[];
  splitPaneSizePx: number;
  minSizesPx: number[];
  maxSizesPx: number[];
  sizesPx: number[];
}

function getPanePropSize(children: React.ReactNode[]): string[] {
  return children.map((child) => {
    const element = child as ReactElement;
    const value = element.props.size || element.props.initialSize;
    if (value === undefined) {
      return DEFAULT_PANE_SIZE;
    }

    return `${value}`;
  });
}

const StyledRow = styled.div`
  display: flex;
  flex: 1 0 100%;
  width: 100%;

  height: 100%;
  flex-direction: row;
  flex: 1;
  outline: none;
  overflow: hidden;
  user-select: text;
  // box-shadow: 0.8rem 0.8rem 1.4rem #c8d0e7, -0.2rem -0.2rem 1.8rem #ffffff;
`;

const StyledColumn = styled.div`
  display: flex;
  flex: 1 0 100%;
  width: 100%;

  height: 100%;
  flex-direction: column;
  flex: 1;
  outline: none;
  overflow: hidden;
  user-select: text;
  box-shadow: 0.8rem 0.8rem 1.4rem #ffffff, -0.2rem -0.2rem 1.8rem #c8d0e7;
`;

/*
    Example:

    handleResizeEnd = (name: string, sizes: number[]): void => {
        console.log('Size changed', name, sizes);
    };

    <FullSizeLayout>
        <SplitView
            split={ViewStyle.vertical}
            onResizeEnd={(sizes: number[]) => this.handleResizeEnd('left', sizes)}
        >
            <SplitPanel minSize={`${DEFAULT_TAB_HEIGHT}px`} initialSize="200px">
                <TabPanelView align={ViewStyle.vertical}>
                    <TabPanel name="Devices">
                        This is left panel
                    </TabPanel>
                </TabPanelView>
            </SplitPanel>
            <SplitPanel>
                <SplitView
                    split={ViewStyle.horisontal}
                    onResizeEnd={(sizes: number[]) => this.handleResizeEnd('bottom', sizes)}
                >
                    <SplitPanel className={classes.panel2}>Panel #2</SplitPanel>
                    <SplitPanel
                        minSize={`${DEFAULT_TAB_HEIGHT}px`}
                        initialSize="200px"
                        className={classes.panel1}
                    >
                        <TabPanelView align={ViewStyle.horisontal}>
                            <TabPanel name="Events">This is panel #1 content</TabPanel>
                            <TabPanel name="Devices">This is panel #2 content</TabPanel>
                        </TabPanelView>
                    </SplitPanel>
                </SplitView>
            </SplitPanel>
        </SplitView>
    </FullSizeLayout>
*/
class SplitViewImpl extends React.Component<SplitViewProps, SplitViewState> {
  splitPanel?: HTMLDivElement | null;

  resizeInfo: {
    resizerIndex: number;
    dimensionsSnapshot?: DimentionSnapshot;
    startClientX: number;
    startClientY: number;
    inResize: boolean;
    paneElements: (Element | null)[];
  };

  onMouseUpHandler: (event: MouseEvent | TouchEvent) => void;

  onMouseMoveHandler: (event: MouseEvent) => void;

  onTouchMoveHandler: (event: TouchEvent) => void;

  constructor(props: SplitViewProps) {
    super(props);

    const children = removeNullChildren(props.children);
    this.resizeInfo = {
      resizerIndex: -1,
      dimensionsSnapshot: undefined,
      startClientX: -1,
      startClientY: -1,
      inResize: false,
      paneElements: createArray(children.length, undefined) as Element[],
    };

    this.state = {
      sizes: [],
    };

    this.onMouseUpHandler = this.onMouseUp.bind(this);
    this.onMouseMoveHandler = this.onMouseMove.bind(this);
    this.onTouchMoveHandler = this.onTouchMove.bind(this);
  }

  componentDidMount(): void {
    const children = removeNullChildren(this.props.children);
    this.setState((state) => {
      return { ...state, sizes: getPanePropSize(children) };
    });
  }

  onMove(clientX: number, clientY: number): void {
    const split = this.props.split || ViewStyle.vertical;
    const { onChange } = this.props;
    if (this.resizeInfo.inResize && this.resizeInfo.dimensionsSnapshot) {
      const { sizesPx, minSizesPx, maxSizesPx, splitPaneSizePx, paneDimensions } = this.resizeInfo.dimensionsSnapshot;

      const sizeDim = split === ViewStyle.vertical ? 'width' : 'height';
      const primary = paneDimensions[this.resizeInfo.resizerIndex];
      if (!primary) {
        console.log('No dimentions for the index', this.resizeInfo.resizerIndex);
      }
      const secondary = paneDimensions[this.resizeInfo.resizerIndex + 1];
      const maxSize = primary[sizeDim] + secondary[sizeDim];

      const primaryMinSizePx = minSizesPx[this.resizeInfo.resizerIndex];
      const secondaryMinSizePx = minSizesPx[this.resizeInfo.resizerIndex + 1];
      const primaryMaxSizePx = Math.min(maxSizesPx[this.resizeInfo.resizerIndex], maxSize);
      const secondaryMaxSizePx = Math.min(maxSizesPx[this.resizeInfo.resizerIndex + 1], maxSize);

      const moveOffset =
        split === ViewStyle.vertical ? this.resizeInfo.startClientX - clientX : this.resizeInfo.startClientY - clientY;

      let primarySizePx = primary[sizeDim] - moveOffset;
      let secondarySizePx = secondary[sizeDim] + moveOffset;

      let primaryHasReachedLimit = false;
      let secondaryHasReachedLimit = false;

      if (primarySizePx < primaryMinSizePx) {
        primarySizePx = primaryMinSizePx;
        primaryHasReachedLimit = true;
      } else if (primarySizePx > primaryMaxSizePx) {
        primarySizePx = primaryMaxSizePx;
        primaryHasReachedLimit = true;
      }

      if (secondarySizePx < secondaryMinSizePx) {
        secondarySizePx = secondaryMinSizePx;
        secondaryHasReachedLimit = true;
      } else if (secondarySizePx > secondaryMaxSizePx) {
        secondarySizePx = secondaryMaxSizePx;
        secondaryHasReachedLimit = true;
      }

      if (primaryHasReachedLimit) {
        secondarySizePx = primary[sizeDim] + secondary[sizeDim] - primarySizePx;
      } else if (secondaryHasReachedLimit) {
        primarySizePx = primary[sizeDim] + secondary[sizeDim] - secondarySizePx;
      }

      sizesPx[this.resizeInfo.resizerIndex] = primarySizePx;
      sizesPx[this.resizeInfo.resizerIndex + 1] = secondarySizePx;

      let sizes = this.state.sizes.concat();
      let updateRatio;

      [primarySizePx, secondarySizePx].forEach((paneSize, idx) => {
        const unit = getUnit(sizes[this.resizeInfo.resizerIndex + idx]);
        if (unit !== 'ratio') {
          sizes[this.resizeInfo.resizerIndex + idx] = convertToUnit(paneSize, unit, splitPaneSizePx);
        } else {
          updateRatio = true;
        }
      });

      if (updateRatio) {
        let ratioCount = 0;
        let lastRatioIdx = 0;
        sizes = sizes.map((size, idx) => {
          if (getUnit(size) === 'ratio') {
            ratioCount += 1;
            lastRatioIdx = idx;

            return convertToUnit(sizesPx[idx], 'ratio');
          }

          return size;
        });

        if (ratioCount === 1) {
          sizes[lastRatioIdx] = '1';
        }
      }

      if (onChange) {
        const sizesInPx = [sizesPx[0], sizesPx[1]];
        onChange(sizesInPx);
      }

      const currentSizes = this.state.sizes;
      if (!arrayEquals(currentSizes, sizes)) {
        this.setState((state) => {
          return { ...state, sizes };
        });
      }
    } else {
      console.log('onMove outside of resize!!!');
    }
  }

  onMouseMove(event: MouseEvent): void {
    event.preventDefault();

    this.onMove(event.clientX, event.clientY);
  }

  onTouchMove(event: TouchEvent): void {
    event.preventDefault();

    const { clientX, clientY } = event.touches[0];
    this.onMove(clientX, clientY);
  }

  onMouseUp(event: MouseEvent | TouchEvent): void {
    event.preventDefault();

    document.removeEventListener('mouseup', this.onMouseUpHandler);
    document.removeEventListener('mousemove', this.onMouseMoveHandler);

    document.removeEventListener('touchmove', this.onTouchMoveHandler);
    document.removeEventListener('touchend', this.onMouseUpHandler);
    document.removeEventListener('touchcancel', this.onMouseUpHandler);

    this.resizeInfo.inResize = false;
    if (this.props.onResizeEnd) {
      const dimentions = this.getDimensionsSnapshot();
      if (dimentions) {
        const sizes = [dimentions.sizesPx[0], dimentions.sizesPx[1]];
        this.props.onResizeEnd(sizes);
      }
    }
  }

  onDown(resizerIndex: number, clientX: number, clientY: number): void {
    const { onResizeStart } = this.props;

    const allowResize = this.props.allowResize !== false;
    if (!allowResize) {
      return;
    }

    this.resizeInfo.resizerIndex = resizerIndex;
    this.resizeInfo.dimensionsSnapshot = this.getDimensionsSnapshot();
    this.resizeInfo.startClientX = clientX;
    this.resizeInfo.startClientY = clientY;

    document.addEventListener('mousemove', this.onMouseMoveHandler);
    document.addEventListener('mouseup', this.onMouseUpHandler);

    document.addEventListener('touchmove', this.onTouchMoveHandler);
    document.addEventListener('touchend', this.onMouseUpHandler);
    document.addEventListener('touchcancel', this.onMouseUpHandler);

    this.resizeInfo.inResize = true;
    if (onResizeStart) {
      onResizeStart();
    }
  }

  onMouseDown(event: React.MouseEvent, resizerIndex: number): void {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();

    const { clientX, clientY } = event;
    this.onDown(resizerIndex, clientX, clientY);
  }

  onTouchStart(event: React.TouchEvent, resizerIndex: number): void {
    event.preventDefault();

    const { clientX, clientY } = event.touches[0];
    this.onDown(resizerIndex, clientX, clientY);
  }

  getResizersSize(): number {
    const children = removeNullChildren(this.props.children);
    const resizerSize = this.props.resizerSize || 1;
    return (children.length - 1) * resizerSize;
  }

  setPaneRef(idx: number, el: Element | null): void {
    this.resizeInfo.paneElements[idx] = el;
  }

  getPaneDimensions(): DOMRect[] {
    return this.resizeInfo.paneElements
      .filter((el) => el)
      .map((el) => (el as unknown as Element).getBoundingClientRect());
  }

  getDimensionsSnapshot(): DimentionSnapshot | undefined {
    if (this.splitPanel) {
      const paneDimensions = this.getPaneDimensions();
      const splitPaneDimensions = this.splitPanel.getBoundingClientRect();
      const minSizes = getPanePropMinMaxSize(this.props, 'minSize') as string[];
      const maxSizes = getPanePropMinMaxSize(this.props, 'maxSize') as string[];

      const split = this.props.split || ViewStyle.vertical;
      const resizersSize = this.getResizersSize();
      const splitPaneSizePx =
        split === ViewStyle.vertical
          ? splitPaneDimensions.width - resizersSize
          : splitPaneDimensions.height - resizersSize;

      const minSizesPx = minSizes.map((s) => convert(s, splitPaneSizePx));
      const maxSizesPx = maxSizes.map((s) => convert(s, splitPaneSizePx));
      const sizesPx = paneDimensions.map((d) => (split === ViewStyle.vertical ? d.width : d.height));

      return {
        resizersSize,
        paneDimensions,
        splitPaneSizePx,
        minSizesPx,
        maxSizesPx,
        sizesPx,
      };
    }

    return undefined;
  }

  render(): React.ReactNode {
    if (this.props.id) console.log(`RENDER '${this.props.id}' SPLIT VIEW`);
    const { sizes } = this.state;
    const split = this.props.split || ViewStyle.vertical;
    const resizersSize = this.getResizersSize();

    const children = removeNullChildren(this.props.children);
    const elements = children.reduce((acc: React.ReactNode[], child: React.ReactNode, idx: number) => {
      let pane;
      const resizerIndex = idx - 1;
      const element = child as ReactPortal;
      if (element) {
        const isPane = element.type === SplitPanelImpl;

        const paneProps = {
          key: `Pane-${idx}`,
          index: idx,
          split,
          innerRef: (index: number, el: Element | null) => this.setPaneRef(index, el),
          resizersSize,
          size: sizes[idx],
          minSize: element.props.minSize || DEFAULT_PANE_MIN_SIZE,
          maxSize: element.props.maxSize || DEFAULT_PANE_MAX_SIZE,
          className: element.props.className,
          minimized: element.props.minimized,
          id: element.props.id,
        };

        if (isPane) {
          pane = cloneElement(element, paneProps);
        } else {
          pane = <SplitPanelImpl {...paneProps}>{element.props.children}</SplitPanelImpl>;
        }

        if (acc.length === 0) {
          return [...acc, pane];
        }

        const resizer = (
          <Resizer
            className={this.props.resizerStyle}
            index={resizerIndex}
            key={`Resizer-${resizerIndex}`}
            split={split}
            onMouseDown={(event: React.MouseEvent, index: number) => this.onMouseDown(event, index)}
            onTouchStart={(event: React.TouchEvent, index: number) => this.onTouchStart(event, index)}
          />
        );
        return [...acc, resizer, pane];
      }

      return acc;
    }, []);

    return split === ViewStyle.vertical ? (
      <StyledRow
        ref={(el) => {
          this.splitPanel = el;
        }}
        className={this.props.className}
      >
        {elements}
      </StyledRow>
    ) : (
      <StyledColumn
        ref={(el) => {
          this.splitPanel = el;
        }}
        className={this.props.className}
      >
        {elements}
      </StyledColumn>
    );
  }
}

export default SplitViewImpl;
