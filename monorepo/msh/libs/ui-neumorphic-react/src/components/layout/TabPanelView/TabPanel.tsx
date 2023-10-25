import React, { FC, useState } from 'react';
import styled from 'styled-components';

import { ViewStyle } from '../ViewStyle';

export const DEFAULT_TAB_WIDTH = 6.8;

interface TabLabelProps {
  id: string;
  label: string;
}
interface TabInputProps {
  id: string;
  selected?: boolean;
  value: string;
  width?: number;
}

export type TabInfo = TabLabelProps & TabInputProps;

export interface TabPanelProps {
  name: string;
  tabs: TabInfo[];
  orientation?: ViewStyle;
  align?: 'left' | 'right';
  disabled?: boolean;

  onChange?: (value: string) => void;
}

interface DivProps extends React.InputHTMLAttributes<HTMLDivElement> {
  width: number;
}

const TabPanelSelector = styled.div<DivProps>`
  position: absolute;
  height: 2.4rem;
  width: 6.2rem;
  margin-left: 0.3rem;
  border-radius: 0.8rem;
  box-shadow: inset 0.2rem 0.2rem 0.5rem ${(props) => props.theme.greyLight2},
    inset -0.2rem -0.2rem 0.5rem ${(props) => props.theme.white};
  pointer-events: none;
`;

interface StyledTabLabelProps extends React.InputHTMLAttributes<HTMLLabelElement> {
  width: number;
}
const TabLabelHorizontal = styled.label<StyledTabLabelProps>`
  width: ${(props) => props.width}rem;
  height: 3.6rem;
  font-size: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: ${(props) => props.theme.greyDark};
  transition: all 0.5s ease;

  &:hover {
    color: ${(props) => props.theme.primary};
  }
`;

const TabLabelVertical = styled.label<StyledTabLabelProps>`
  width: 3.6rem;
  height: ${(props) => props.width}rem;
  font-size: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: ${(props) => props.theme.greyDark};
  // transition: all 0.5s ease;
  transform: rotate(90deg) translate(0px, 0px);
  transformorigin: 'left center 0';

  &:hover {
    color: ${(props) => props.theme.primary};
  }
`;

interface StyledTabInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  index: number;
  width: number;
  offset: number;
}
const TabInputHorizontal = styled.input<StyledTabInputProps>`
  display: none;

  &:checked + ${TabLabelHorizontal} {
    transition: all 0.5s ease;
    color: ${(props) => props.theme.primary};
  }

  &:checked ~ ${TabPanelSelector} {
    transform: translateX(${(props) => props.offset + 'rem'});
    transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    width: ${(props) => props.width - 0.6 + 'rem'};
  }
`;

const TabInputVertical = styled.input<StyledTabInputProps>`
  display: none;

  &:checked + ${TabLabelVertical} {
    transition: all 0.5s ease;
    color: ${(props) => props.theme.primary};
  }

  & ~ ${TabPanelSelector} {
    width: 2.4rem;
    height: 6.2rem;
    margin-left: 0rem;
  }

  &:checked ~ ${TabPanelSelector} {
    transform: translateY(${(props) => props.offset + 'rem'});
    transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    height: ${(props) => props.width - 0.6 + 'rem'};
  }
`;

interface TabPanelImplProps extends DivProps {
  align?: 'left' | 'right';
}

const HorizontalTabPanel = styled.div<TabPanelImplProps>`
  grid-column: 3/4;
  grid-row: 1/2;
  width: ${(props) => props.width}rem;
  height: 3rem;
  box-shadow: 0.3rem 0.3rem 0.6rem ${(props) => props.theme.greyLight2},
    -0.2rem -0.2rem 0.5rem ${(props) => props.theme.white};
  border-radius: 1rem;
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
  margin-top: 2px;
  margin-left: 10px;
  display: flex;
  align-items: center;
  position: relative;
`;

const VerticalTabPanel = styled.div<TabPanelImplProps>`
  flex-direction: column;
  padding-top: 10px;
  width: ${(props) => (props.align === 'left' ? '2.7' : '3')}rem;
  height: ${(props) => props.width}rem;
  box-shadow: 0.3rem 0.3rem 0.6rem ${(props) => props.theme.greyLight2},
    -0.2rem -0.2rem 0.5rem ${(props) => props.theme.white};
  border-radius: 1rem;
  border-top-left-radius: ${(props) => (props.align === 'left' ? '0' : '1')}rem;
  border-bottom-left-radius: ${(props) => (props.align === 'left' ? '0' : '1')}rem;
  border-top-right-radius: ${(props) => (props.align === 'left' ? '1' : '0')}rem;
  border-bottom-right-radius: ${(props) => (props.align === 'left' ? '1' : '0')}rem;
  margin-top: 50px;
  margin-left: ${(props) => (props.align === 'left' ? '0' : '2')}px;
  margin-right: ${(props) => (props.align === 'left' ? '2' : '0')}px;
  display: flex;
  align-items: center;
  position: relative;
`;

const TabPanel: FC<TabPanelProps> = ({ tabs, name, orientation, align, onChange }) => {
  const viewStyle = orientation || ViewStyle.horisontal;
  const horizontalAlign = align || 'left';
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    tabs.find((t) => t.selected)?.value || tabs[0]?.value,
  );
  const handleChange = (newValue: string): void => {
    setSelectedValue(newValue);
    onChange?.(newValue);
  };

  let panelSize = 0;
  const tabComponents = tabs.map((tab, idx) => {
    const { id, label, selected, value, ...rest } = tab;
    const isSelected = selectedValue === value;
    const width = tab.width || DEFAULT_TAB_WIDTH + (viewStyle == ViewStyle.horisontal ? 0 : 10);
    const offset = panelSize;
    panelSize += width;

    return viewStyle == ViewStyle.horisontal ? (
      <React.Fragment key={idx}>
        {isSelected && (
          <TabInputHorizontal
            onChange={() => handleChange(value)}
            index={idx}
            type="radio"
            id={id}
            name={name}
            value={value}
            checked
            width={width}
            offset={offset}
            {...rest}
          />
        )}
        {!isSelected && (
          <TabInputHorizontal
            onChange={() => handleChange(value)}
            index={idx}
            type="radio"
            id={id}
            name={name}
            value={value}
            width={width}
            offset={offset}
            {...rest}
          />
        )}
        <TabLabelHorizontal width={width} htmlFor={id}>
          <p>{label}</p>
        </TabLabelHorizontal>
      </React.Fragment>
    ) : (
      <React.Fragment key={idx}>
        {isSelected && (
          <TabInputVertical
            onChange={() => handleChange(value)}
            index={idx}
            type="radio"
            id={id}
            name={name}
            value={value}
            checked
            width={width}
            offset={offset}
            {...rest}
          />
        )}
        {!isSelected && (
          <TabInputVertical
            onChange={() => handleChange(value)}
            index={idx}
            type="radio"
            id={id}
            name={name}
            value={value}
            width={width}
            offset={offset}
            {...rest}
          />
        )}
        <TabLabelVertical width={width} htmlFor={id}>
          <p>{label}</p>
        </TabLabelVertical>
      </React.Fragment>
    );
  });

  panelSize += 2;
  return viewStyle == ViewStyle.horisontal ? (
    <HorizontalTabPanel width={panelSize} className="tabPanelHorizontal">
      {tabComponents}
      <TabPanelSelector width={0} />
    </HorizontalTabPanel>
  ) : (
    <VerticalTabPanel width={panelSize} align={horizontalAlign} className="tabPanelVertical">
      {tabComponents}
      <TabPanelSelector width={0} />
    </VerticalTabPanel>
  );
};

export default TabPanel;
