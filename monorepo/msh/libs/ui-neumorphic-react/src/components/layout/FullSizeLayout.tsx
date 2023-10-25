import styled from 'styled-components';

const FullSizeLayout = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  flex: 1 0 auto;
  height: auto;
  width: 100%;
  background-color: ${(props) => props.theme.greyLight1};
`;

export default FullSizeLayout;
