import React, { cloneElement, FC, ReactPortal } from 'react';
import styled from 'styled-components';

import { ButtonProps, StyledIconButton } from '../../Button/IconButton';
import { ViewStyle } from '../ViewStyle';
import { useToolbar } from './ToolbarContext';

export const DEFAULT_TOOLBAR_HEIGHT = 48;

interface ToolbarGroupProps {
  children: React.ReactNode | React.ReactNode[];
}

export const ToolbarGroup: FC<ToolbarGroupProps> = (props: ToolbarGroupProps) => {
  throw new Error(`<ToolbarGroup> component is required to be used inside of <Toolbar> component only!`);
};

export const ToolbarBtn: FC<ButtonProps> = (props: ButtonProps): JSX.Element => {
  throw new Error(`<ToolbarBtn> component is required to be used inside of <Toolbar> component only!`);
};

const ToolbarButton = styled(StyledIconButton)`
  margin-top: 4px;
  margin-left: 4px;
  margin-bottom: 4px;
  margin-right: 4px;
  background-color: ${(props) => props.theme.greyLight1};
`;

const VerticalToolbarGroupContainer = styled.div`
  position: relative;
  display: 'flex';
  width: '100%';
  flex: '1 0 100%';
  overflow: hidden;
  align-items: stretch;
  box-shadow: inset -10px -10px 15px rgba(255, 255, 255, 0.5), inset 10px 10px 15px rgba(70, 70, 70, 0.12);
  border: 1px solid ${(props) => props.theme.greyLight2};
  z-index: 1;
  margin-left: 3px;
  margin-right: 3px;
  margin-top: 3px;
  padding-top: 10px;
  padding-bottom: 4px;
`;
const VerticalToolbarHamburgetIcon = styled.div`
  position: absolute;
  top: 3px;
  left: 4px;
  height: 1px;
  right: 4px;
  display: block;
  background-color: ${(props) => props.theme.greyLight2};

  &:before {
    content: '';
    top: 12px;
    left: 0px;
    height: 1px;
    right: 0px;
    margin-top: -8px;
    display: block;
    background-color: ${(props) => props.theme.greyLight2};
    position: absolute;
  }
`;

const VerticalToolbarGroup: FC<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>> = (
  props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
): JSX.Element => {
  return (
    <VerticalToolbarGroupContainer>
      <VerticalToolbarHamburgetIcon />
      {props.children}
    </VerticalToolbarGroupContainer>
  );
};

const HorizontalToolbarGroup = styled.div`
  display: 'flex';
  flexdirection: 'column';
  width: '100%';
  flex: '1 0 100%';
`;

interface TabPanelAlignProps {
  align?: ViewStyle;
}
export interface ToolbarProps extends TabPanelAlignProps {
  children?: React.ReactNode | React.ReactNode[];
  name: string;
}

function filterGroups(children: React.ReactNode | React.ReactNode[]): React.ReactNode[] {
  return React.Children.toArray(children).filter((c) => c && (c as ReactPortal).type === ToolbarGroup);
}

function filterButtons(children: React.ReactNode | React.ReactNode[]): React.ReactNode[] {
  return React.Children.toArray(children).filter((c) => c && (c as ReactPortal).type === ToolbarBtn);
}

export const Toolbar: FC<ToolbarProps> = (props: ToolbarProps) => {
  const viewStyle = props.align || ViewStyle.horisontal;
  const toolbar = useToolbar(props.name);
  const children = toolbar || props.children;
  const groups = filterGroups(children);

  const groupElements = groups.reduce((acc: React.ReactNode[], child: React.ReactNode, idx: number) => {
    let pane;
    const element = child as ReactPortal;
    if (element) {
      const isPane = element.type === VerticalToolbarGroup || element.type === HorizontalToolbarGroup;

      const paneProps = {
        'data-type': 'ToolbarGroup',
        key: `ToolbarGroup-${idx}`,
        disabled: element.props.disabled,
        className: 'toolbarGroup',
      };

      const buttons = filterButtons(element.props.children);
      const buttonElements = buttons.reduce((acc: React.ReactNode[], childBtn: React.ReactNode, idx: number) => {
        const btnElement = childBtn as ReactPortal;
        const isButton = btnElement.type === ToolbarButton;

        const btnProps = {
          'data-type': 'ToolbarButton',
          key: `ToolbarButton-${idx}`,
          disabled: btnElement.props.disabled,
          className: 'toolbarButton',
          primary: btnElement.props.primary,
        };

        let btn;
        if (isButton) {
          btn = cloneElement(btnElement, btnProps);
        } else {
          btn = (
            <ToolbarButton size="small" {...btnProps}>
              {btnElement.props.children}
            </ToolbarButton>
          );
        }

        return [...acc, btn];
      }, []);

      if (isPane) {
        pane = cloneElement(element, paneProps);
      } else {
        pane =
          viewStyle === ViewStyle.vertical ? (
            <VerticalToolbarGroup {...paneProps}>{buttonElements}</VerticalToolbarGroup>
          ) : (
            <HorizontalToolbarGroup {...paneProps}>{buttonElements}</HorizontalToolbarGroup>
          );
      }

      return [...acc, pane];
    }

    return acc;
  }, []);

  return viewStyle === ViewStyle.horisontal ? (
    <div
      style={{
        display: 'flex',
        width: '100%',
        flex: '1 0 100%',
      }}
    >
      {groupElements}
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
      <div style={{ width: '100%', display: 'block' }}>{groupElements}</div>
    </div>
  );
};
