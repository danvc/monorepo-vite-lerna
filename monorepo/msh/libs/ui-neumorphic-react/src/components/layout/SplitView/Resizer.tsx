import React, { FC } from 'react';
import styled from 'styled-components';

import { ViewStyle } from '../ViewStyle';

interface WrapperProps {
  children?: React.ReactNode;
  className?: string;

  'data-attribute': ViewStyle;
  'data-type': string;

  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  onDoubleClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
  onTouchEnd: (event: React.TouchEvent<HTMLDivElement>) => void;
  onTouchStart: (event: React.TouchEvent<HTMLDivElement>) => void;
}

interface ResizerProps {
  children?: React.ReactNode;
  className?: string;
  index?: number;
  split?: ViewStyle;

  onClick?: (event: React.MouseEvent<HTMLDivElement>, index: number) => void;
  onDoubleClick?: (event: React.MouseEvent<HTMLDivElement>, index: number) => void;
  onMouseDown?: (event: React.MouseEvent<HTMLDivElement>, index: number) => void;
  onTouchEnd?: (event: React.TouchEvent<HTMLDivElement>, index: number) => void;
  onTouchStart?: (event: React.TouchEvent<HTMLDivElement>, index: number) => void;
}

const StyledWrapper = styled.div<WrapperProps>`
  background: #000;
  opacity: 0.2;
  z-index: 1000;
  box-sizing: border-box;
  background-clip: padding-box;

  &:hover {
    transition: all 2s ease;
  }
`;

const StyledHorizontalWrapper = styled(StyledWrapper)`
  height: 11px;
  margin: -5px 0;
  border-top: 5px solid rgba(255, 255, 255, 0);
  border-bottom: 5px solid rgba(255, 255, 255, 0);
  cursor: row-resize;
  width: 100%;

  &:hover {
    border-top: 5px solid rgba(0, 0, 0, 0.5);
    border-bottom: 5px solid rgba(0, 0, 0, 0.5);
  }

  &.disabled {
    cursor: not-allowed;

    &:hover {
      border-color: transparent;
    }
  }
`;
const HorizontalWrapper: FC<WrapperProps> = ({ className = '', children, ...rest }) => {
  return (
    <StyledHorizontalWrapper className={className} {...rest}>
      {children}
    </StyledHorizontalWrapper>
  );
};

const StyledVerticalWrapper = styled(StyledWrapper)`
  width: 11px;
  margin: 0 -5px;
  border-left: 5px solid rgba(255, 255, 255, 0);
  border-right: 5px solid rgba(255, 255, 255, 0);
  cursor: col-resize;

  &:hover {
    border-left: 5px solid rgba(0, 0, 0, 0.5);
    border-right: 5px solid rgba(0, 0, 0, 0.5);
  }

  &.disabled {
    cursor: not-allowed;

    &:hover {
      border-color: transparent;
    }
  }
`;
const VerticalWrapper: FC<WrapperProps> = ({ className = '', children, ...rest }) => {
  return (
    <StyledVerticalWrapper className={className} {...rest}>
      {children}
    </StyledVerticalWrapper>
  );
};

export default function Resizer(props: ResizerProps): JSX.Element {
  const {
    index = 0,
    split = ViewStyle.vertical,
    onClick = () => {},
    onDoubleClick = () => {},
    onMouseDown = () => {},
    onTouchEnd = () => {},
    onTouchStart = () => {},
  } = props;

  const childProps = {
    'data-attribute': split,
    'data-type': 'Resizer',
    onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => onMouseDown(event, index),
    onTouchStart: (event: React.TouchEvent<HTMLDivElement>) => {
      event.preventDefault();
      onTouchStart(event, index);
    },
    onTouchEnd: (event: React.TouchEvent<HTMLDivElement>) => {
      event.preventDefault();
      onTouchEnd(event, index);
    },
    onClick: (event: React.MouseEvent<HTMLDivElement>) => {
      if (onClick) {
        event.preventDefault();
        onClick(event, index);
      }
    },
    onDoubleClick: (event: React.MouseEvent<HTMLDivElement>) => {
      if (onDoubleClick) {
        event.preventDefault();
        onDoubleClick(event, index);
      }
    },
  };

  return split === 'vertical' ? <VerticalWrapper {...childProps} /> : <HorizontalWrapper {...childProps} />;
}
