import styled from 'styled-components';

const TabContent = styled.div`
  width: 100%;
  height: 100%;
  display: ${props => props.isActive ? 'block' : 'none'};
  background: white;
  box-sizing: border-box;
`;

export default TabContent;