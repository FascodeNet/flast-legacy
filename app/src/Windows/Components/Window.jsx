import styled from 'styled-components';

const Window = styled.div`
  width: 100vw;
  height: 100vh;
  border: ${props => props.isMac || props.isMaximized ? 'none' : (props.isCustomTitlebar ? `solid 1px ${props.isActive ? props.activeBackgroundColor : props.inActiveBackgroundColor}` : 'none')};
`;

export default Window;