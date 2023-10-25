import React, { FC, MouseEventHandler } from 'react';
import styled from 'styled-components';

export interface ButtonProps {
  children: React.ReactNode | React.ReactNode[];
  primary?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const StyledButton = styled.button<ButtonProps>`
  width: ${(props) => (props.size === 'small' ? '7rem;' : '15rem;')};
  height: ${(props) => (props.size === 'small' ? '2rem;' : '4rem;')};
  border-radius: 1rem;
  border: 0px solid transparent;
  justify-self: center;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.3s ease;
  font-size: ${(props) => (props.size === 'small' ? '0.8rem;' : '1.3rem;')};
  grid-column: 1/2;
  grid-row: ${(props) => (props.primary ? '4/5' : '5/6')};
  background: ${(props) => (props.primary ? props.theme.primary : props.theme.greyLight1)};

  box-shadow: ${(props) =>
    props.primary
      ? 'inset 0.2rem 0.2rem 1rem ' +
        props.theme.primaryLight +
        ', inset -0.2rem -0.2rem 1rem ' +
        props.theme.primaryDark +
        ', 0.3rem 0.3rem 0.6rem ' +
        props.theme.greyLight2 +
        ', -0.2rem -0.2rem 0.5rem ' +
        props.theme.white
      : '0.3rem 0.3rem 0.6rem ' + props.theme.greyLight2 + ', -0.2rem -0.2rem 0.5rem ' + props.theme.white};

  color: ${(props) => (props.primary ? props.theme.greyLight1 : props.theme.primaryDark)};

  &:hover {
    color: ${(props) => (props.primary ? props.theme.white : props.theme.primary)};
  }
  &:active {
    box-shadow: ${(props) =>
      props.primary
        ? 'inset 0.2rem 0.2rem 1rem ' +
          props.theme.primaryDark +
          ', inset -0.2rem -0.2rem 1rem ' +
          props.theme.primaryLight +
          ';'
        : 'inset 0.2rem 0.2rem 0.5rem ' +
          props.theme.greyLight2 +
          ', inset -0.2rem -0.2rem 0.5rem ' +
          props.theme.white};
  }
`;

const Button: FC<ButtonProps> = ({ size, primary, disabled, children, onClick, ...props }) => {
  const onClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log('!!!!');
    onClick?.(event);
  };

  return (
    <StyledButton type="button" onClick={onClickHandler} primary={primary} disabled={disabled} size={size} {...props}>
      {children}
    </StyledButton>
  );
};

export default Button;
