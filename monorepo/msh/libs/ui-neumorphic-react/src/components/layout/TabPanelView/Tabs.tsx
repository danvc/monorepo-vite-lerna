import React, { cloneElement, FC, ReactPortal, useContext, useState } from 'react';
import { FaCaretSquareDown, FaCaretSquareLeft, FaCaretSquareRight, FaCaretSquareUp } from 'react-icons/fa';
import styled from 'styled-components';

import { StyledIconButton } from '../../Button';
import { SplitViewContext } from '../SplitView';
import { ViewStyle } from '../ViewStyle';
import TabPanel, { DEFAULT_TAB_WIDTH, TabInfo } from './TabPanel';

interface TabLabelProps {
  id: string;
  label: string;
}
interface TabInputProps {
  id: string;
  selected?: boolean;
  value: string;
}

interface TabPanelAlignProps {
  align?: ViewStyle;
  horizontalAlign?: 'left' | 'right';
}
export interface TabPanelProps extends TabPanelAlignProps {
  children?: React.ReactNode | React.ReactNode[];
  name: string;
  disabled?: boolean;
  selectedIndex?: number;

  onChange?: (value: string | number) => void;
  onToggle?: (value: boolean) => void;
}

interface TabProps {
  children?: React.ReactNode | React.ReactNode[];
  name: string;
  width?: string;
  disabled?: boolean;
}

export function Tab(props: TabProps): JSX.Element | null {
  const propsTrace = JSON.stringify(props);
  throw new Error(`<Tab> component is required to be used inside of <Tabs> component only! Params: ${propsTrace}`);
}

const TabContainer = styled.div<TabPanelAlignProps>`
  position: relative;
  padding: 0;
  flex: auto;
  overflow: hidden;
  display: flex;
  align-items: stretch;
  // box-shadow: inset -10px -10px 15px rgba(255, 255, 255, 0.5), inset 10px 10px 15px rgba(70, 70, 70, 0.12);
  border: 1px solid ${(props) => props.theme.greyLight2};
  z-index: 1;
`;
const TabContent = styled.div`
  position: absolute;
  top: 0px;
  left: 0px;
  bottom: 0px;
  right: 0px;
  background-color: ${(props) => props.theme.greyLight1};
`;

const MenuButton = styled(StyledIconButton)`
  margin-left: 0px;
  margin-right: 0px;
  margin-top: 8px;
  margin-bottom: 0px;
`;

const HorizontalMinIcon = styled.div`
  position: absolute;
  right: 10px;
  z-index: 100;
`;

const VerticalRightMinIcon = styled.div`
  position: absolute;
  left: 10px;
  z-index: 100;
`;

const VerticalLeftMinIcon = styled.div`
  position: absolute;
  right: 6px;
  z-index: 100;
`;

function removeNullChildren(children: React.ReactNode | React.ReactNode[]): React.ReactNode[] {
  return React.Children.toArray(children).filter((c) => c && (c as ReactPortal).type === Tab);
}

const Tabs: FC<TabPanelProps> = (props: TabPanelProps) => {
  const viewStyle = props.align || ViewStyle.horisontal;
  const horizontalAlign = props.horizontalAlign
    ? props.horizontalAlign
    : viewStyle === ViewStyle.vertical
    ? 'left'
    : 'right';

  const notNullChildren = removeNullChildren(props.children);
  const { minimized, updateMinimized } = useContext(SplitViewContext);
  const [state, setState] = useState<{ activeIndex: number | boolean; oldIndex: number }>({
    activeIndex: props.selectedIndex || 0,
    oldIndex: props.selectedIndex || 0,
  });
  const [indexProp, setIndexProp] = useState<number | false>(props.selectedIndex || 0);
  const [minimizedProp, setMinimizedProp] = useState<boolean>(minimized || false);

  const handleChange = (value: string): void => {
    const activeIndex = parseInt(value, 10);

    if (minimized) {
      updateMinimized(false);
    }

    if (state.activeIndex !== activeIndex) {
      props.onChange?.(activeIndex);
    }

    setState({ ...state, activeIndex, oldIndex: activeIndex });
    if (minimized) {
      setTimeout(() => props.onToggle && props.onToggle(false), 10);
    }
  };

  const tabs: TabInfo[] = [];
  let activeTabContainer = (
    <TabContainer>
      <TabContent>&nbsp;</TabContent>
    </TabContainer>
  );

  const elements = notNullChildren.reduce((acc: React.ReactNode[], child: React.ReactNode, idx: number) => {
    let pane;
    const element = child as ReactPortal;
    if (element) {
      tabs.push({
        id: `${props.name}_${idx}`,
        label: element.props.name,
        selected: state.activeIndex === idx,
        value: `${idx}`,
        width: parseInt(element.props.width, 10) || DEFAULT_TAB_WIDTH,
      });
      const isPane = element.type === TabPanel;

      const paneProps = {
        index: idx,
        orientation: viewStyle,
        label: element.props.name,
        'data-type': 'TabPanel',
        key: `TabPanel-${idx}`,
        disabled: element.props.disabled,
      };

      if (isPane) {
        pane = cloneElement(element, paneProps);
      } else {
        pane = <TabContent {...paneProps} />;
      }

      if (state.activeIndex === idx) {
        activeTabContainer = (
          <TabContainer className="tabContainer">
            <TabContent>{element.props.children}</TabContent>
          </TabContainer>
        );
      }

      return [...acc, pane];
    }

    return acc;
  }, []);

  const MinIconStyle = horizontalAlign === 'left' ? VerticalLeftMinIcon : VerticalRightMinIcon;
  const minifyIcon = horizontalAlign === 'left' ? <FaCaretSquareRight /> : <FaCaretSquareLeft />;
  const maximizeIcon = horizontalAlign === 'left' ? <FaCaretSquareLeft /> : <FaCaretSquareRight />;

  const handleDrawerToggle = (): void => {
    const newState = !minimized;
    updateMinimized(newState);
    setState({
      activeIndex: state.oldIndex,
      oldIndex: state.oldIndex,
    });

    if (props.onToggle) {
      props.onToggle(newState);
    }
  };

  return viewStyle === ViewStyle.vertical ? (
    <div
      style={{
        display: 'flex',
        width: '100%',
        flex: '1 0 100%',
      }}
    >
      {horizontalAlign === 'left' && activeTabContainer}

      <MinIconStyle>
        {minimized && (
          <MenuButton size="small" aria-label="open drawer" onClick={handleDrawerToggle} edge="end">
            {minifyIcon}
          </MenuButton>
        )}
        {!minimized && (
          <MenuButton size="small" aria-label="open drawer" onClick={handleDrawerToggle} edge="end">
            {maximizeIcon}
          </MenuButton>
        )}
      </MinIconStyle>

      <TabPanel
        orientation={viewStyle}
        align={horizontalAlign}
        name={props.name}
        tabs={tabs}
        onChange={(value) => handleChange(value)}
      />

      {horizontalAlign === 'right' && activeTabContainer}
    </div>
  ) : (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        flex: '1 0 100%',
      }}
    >
      <div style={{ width: '100%', display: 'block' }}>
        <HorizontalMinIcon>
          {minimized && (
            <MenuButton size="small" aria-label="open drawer" edge="end">
              <FaCaretSquareUp onClick={() => handleDrawerToggle()} />
            </MenuButton>
          )}
          {!minimized && (
            <MenuButton size="small" aria-label="open drawer" edge="end">
              <FaCaretSquareDown onClick={() => handleDrawerToggle()} />
            </MenuButton>
          )}
        </HorizontalMinIcon>

        <TabPanel orientation={viewStyle} name={props.name} tabs={tabs} onChange={(value) => handleChange(value)} />
      </div>
      {activeTabContainer}
    </div>
  );
};

export default Tabs;
