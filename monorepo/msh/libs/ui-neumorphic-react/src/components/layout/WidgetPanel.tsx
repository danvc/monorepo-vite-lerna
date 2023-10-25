import React, { FC } from 'react';
import styled, { CSSProperties } from 'styled-components';

export interface WidgetPanelProps {
  children: React.ReactNode | React.ReactNode[];
  width?: string;
  height?: string;
  style?: CSSProperties;
}

/*
  display: grid;
  grid-template-columns: 17.6rem 19rem 20.4rem;
  grid-template-rows: repeat(autofit, -webkit-min-content);
  grid-template-rows: repeat(autofit, min-content);
  grid-column-gap: 1rem;
  grid-row-gap: 1.5rem;
*/

const StyledWidgetPanel = styled.div<WidgetPanelProps>`
  width: ${(props) => (props.width ? props.width : 'auto')};
  height: ${(props) => (props.height ? props.height : 'auto')};
  border-radius: 3rem;
  box-shadow: 0.8rem 0.8rem 1.4rem ${(props) => props.theme.greyLight2},
    -0.2rem -0.2rem 1.8rem ${(props) => props.theme.white};
  padding: 4rem;
  align-items: center;
  display: grid;
  grid-template-rows: repeat(autofit, -webkit-min-content);
  grid-template-rows: repeat(autofit, min-content);
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;
`;

const WidgetPanel: FC<WidgetPanelProps> = ({ width, height, style, children }) => {
  return (
    <StyledWidgetPanel style={style} width={width} height={height}>
      {children}
    </StyledWidgetPanel>
  );
};

export default WidgetPanel;
