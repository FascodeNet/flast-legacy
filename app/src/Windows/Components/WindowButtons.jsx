import styled from 'styled-components';

const WindowButtons = styled.div`
  -webkit-app-region: no-drag;
  ${props => props.isWindowsOrLinux ? `
    width: auto;
    height: 36px;
    display: ${props.isCustomTitlebar ? 'flex' : 'none'};
    position: absolute;
    top: ${props.isMaximized ? 0 : 1}px;
    right: ${props.isMaximized ? 0 : 1}px;
    box-sizing: border-box;
  ` : `
    width: 74px;
    height: 36px;
    visibility: hidden;
    box-sizing: border-box;
  `}
`;

export default WindowButtons;