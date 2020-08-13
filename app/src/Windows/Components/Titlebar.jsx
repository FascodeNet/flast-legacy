import styled from 'styled-components';

export const Titlebar = styled.div`
  width: 100%;
  height: 37px;
  box-sizing: border-box;
  display: ${props => props.isShowing ? 'block' : 'none'};
  background: ${props => props.isActive ? props.activeBackgroundColor : props.inActiveBackgroundColor};
  -webkit-app-region: drag;
`;