import React, { FC } from 'react';
import styled from 'styled-components';

export interface ButtonProps {
  children: React.ReactNode | React.ReactNode[];
  primary?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  edge?: 'start' | 'center' | 'end';
}

export const StyledIconButton = styled.div<ButtonProps>`
  width: ${(props) => (props.size === 'small' ? '2rem;' : props.size === 'medium' ? '4rem;' : '6rem;')};
  height: ${(props) => (props.size === 'small' ? '2rem;' : props.size === 'medium' ? '4rem;' : '6rem;')};
  border-radius: 50%;
  box-shadow: 0.3rem 0.3rem 0.6rem ${(props) => props.theme.greyLight2},
    -0.2rem -0.2rem 0.5rem ${(props) => props.theme.white};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: ${(props) => (props.size === 'small' ? '1rem;' : props.size === 'medium' ? '2rem;' : '3rem;')};
  cursor: pointer;
  color: ${(props) => (props.primary ? props.theme.primary : props.theme.greyDark)};
  transition: all 0.5s ease;

  &:hover {
    color: ${(props) => props.theme.primary};
  }
  &:active {
    box-shadow: inset 0.2rem 0.2rem 0.5rem ${(props) => props.theme.greyLight2},
      inset -0.2rem -0.2rem 0.5rem ${(props) => props.theme.white};
    color: ${(props) => props.theme.primary};
  }
`;

const IconButton: FC<ButtonProps> = ({ size, primary, disabled, children, ...props }) => {
  return (
    <StyledIconButton primary={primary} disabled={disabled} size={size} {...props}>
      {children}
    </StyledIconButton>
  );
};

export default IconButton;
