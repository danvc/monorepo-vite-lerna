import React, { CSSProperties, FC, useContext } from 'react';
import styled from 'styled-components';

import { ViewStyle } from '../ViewStyle';
import {
  convertSizeToCssValue,
  DEFAULT_PANE_MAX_SIZE,
  DEFAULT_PANE_MIN_SIZE,
  DEFAULT_PANE_SIZE,
  getUnit,
} from './SplitView';
import SplitViewContextProvider, { SplitViewContext } from './SplitViewContext';

export interface SplitPanelProps {
  id?: string;
  children: React.ReactNode | React.ReactNode[];
  className?: string;
  initialSize?: string | number;
  size?: string | number;
  minSize?: string;
  maxSize?: string;
  minimized?: boolean;
  align?: 'left' | 'right';
}

interface SplitPanelWrapperProps extends SplitPanelProps {
  innerRef: (idx: number, el: Element | null) => void;
  index: number;
  resizersSize: number;
  split: ViewStyle;
}

function resolveStyle(
  split: ViewStyle,
  resizersSize: number,
  minSize: string,
  maxSize: string,
  initialSize: string | number,
  size?: string | number,
): CSSProperties {
  const value = `${size || initialSize}`;
  const vertical = split === ViewStyle.vertical;
  const styleProp: {
    minSize: 'minWidth' | 'minHeight';
    maxSize: 'maxWidth' | 'maxHeight';
    size: 'width' | 'height';
  } = {
    minSize: vertical ? 'minWidth' : 'minHeight',
    maxSize: vertical ? 'maxWidth' : 'maxHeight',
    size: vertical ? 'width' : 'height',
  };

  const style: CSSProperties = {
    display: 'flex',
    outline: 'none',
    position: 'relative',
  };

  style[styleProp.minSize] = convertSizeToCssValue(minSize, resizersSize);
  style[styleProp.maxSize] = convertSizeToCssValue(maxSize, resizersSize);

  switch (getUnit(value)) {
    case 'ratio':
      style.flex = value;
      break;
    case '%':
    case 'px':
      style.flexGrow = 0;
      style[styleProp.size] = convertSizeToCssValue(value, resizersSize);
      break;
    default:
      style.flexGrow = 0;
      style[styleProp.size] = convertSizeToCssValue(value, resizersSize);
      break;
  }

  return style;
}

export default function SplitPanel(props: SplitPanelProps): JSX.Element | null {
  const propsTrace = JSON.stringify(props);
  throw new Error(
    `<SplitPanel> component is required to be used incide of <SplitView> component only! Params: ${propsTrace}`,
  );
}

const StyledSplitHorizontalPanelImplInternal = styled.div`
  flex-grow: 1;
  flex-direction: column;
  box-shadow: 0.8rem 0.8rem 1.4rem #ffffff, -0.2rem -0.2rem 1.8rem #c8d0e7;
`;
const StyledSplitVerticalPanelImplInternal = styled.div<SplitPanelProps>`
  flex-grow: 1;
  flex-direction: column;
  box-shadow: ${(props) =>
    props.align === 'left'
      ? '0.4rem 0.4rem 0.4rem #ffffff, -0.2rem -0.2rem 0.8rem #c8d0e7'
      : '-0.4rem -0.4rem -0.4rem #ffffff, 0.2rem 0.2rem 0.8rem #c8d0e7'};
`;

const SplitPanelImplInternal: FC<SplitPanelWrapperProps> = (props: SplitPanelWrapperProps) => {
  const { minimized } = useContext(SplitViewContext);

  const { children, className, split, initialSize, size, minSize, maxSize, resizersSize } = props;
  const minimizedSize = props.minimized ? minSize || DEFAULT_PANE_MIN_SIZE : DEFAULT_PANE_MIN_SIZE;
  const viewStyle = split || ViewStyle.vertical;
  const prefixedStyle = resolveStyle(
    viewStyle,
    resizersSize,
    minSize || DEFAULT_PANE_MIN_SIZE,
    maxSize || DEFAULT_PANE_MAX_SIZE,
    initialSize || DEFAULT_PANE_SIZE,
    minimized ? minimizedSize : size,
  );

  const setRef = (element: Element | null): void => {
    if (props.innerRef) props.innerRef(props.index || 0, element);
  };

  return viewStyle === ViewStyle.vertical ? (
    <StyledSplitVerticalPanelImplInternal className={className} style={prefixedStyle} ref={setRef}>
      {children}
    </StyledSplitVerticalPanelImplInternal>
  ) : (
    <StyledSplitHorizontalPanelImplInternal className={className} style={prefixedStyle} ref={setRef}>
      {children}
    </StyledSplitHorizontalPanelImplInternal>
  );
};

export function SplitPanelImpl(props: SplitPanelWrapperProps): JSX.Element {
  return (
    <SplitViewContextProvider minimized={props.minimized}>
      <SplitPanelImplInternal {...props} />
    </SplitViewContextProvider>
  );
}
