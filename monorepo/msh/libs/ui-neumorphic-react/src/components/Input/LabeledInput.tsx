import React from 'react';
import styled from 'styled-components';

interface LabeledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

const InputGroup = styled.div`
  position: relative;
`;

const InputLabel = styled.label`
  color: #8d8d8d;
  position: absolute;
  top: 27px;
  left: 55px;
  transition: 300ms;
  transform: translate(-50%, -50%);
`;

const InputField = styled.input`
  outline: none;
  padding: 16px 22px;
  border: 1px solid #dadce0;
  font-size: 18px;
  border-radius: 5px;

  &:focus {
    border: 2px solid royalblue;
  }

  &:valid + ${InputLabel} {
    top: -1px;
    padding: 0 3px;
    font-size: 14px;
    color: #8d8d8d;
  }

  &:focus + ${InputLabel} {
    top: -1px;
    padding: 0 3px;
    font-size: 14px;
    color: royalblue;
    transition: 300ms;
  }
`;

const LabeledInput: React.FC<LabeledInputProps> = ({ id, label, ...rest }) => {
  return (
    <InputGroup>
      <InputField id={id} {...rest} />
      <InputLabel htmlFor={id}>{label}</InputLabel>
    </InputGroup>
  );
};

export default LabeledInput;
