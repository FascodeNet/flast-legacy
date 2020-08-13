import styled from 'styled-components';

const WindowContent = styled.div`
  width: 100%;
  height: calc(100% - 37px);
  background: ${props => props.backgroundColor};
`;

export default WindowContent;