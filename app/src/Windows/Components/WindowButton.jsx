import styled from 'styled-components';

const WindowButton = styled.div`
  ${props => props.isWindowsOrLinux ? `
    width: 45px;
    height: 100%;
    min-width: 45px;
    position: relative;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    margin-right: 1px;
    transition: 0.2s background-color;
    box-sizing: border-box;
    -webkit-app-region: no-drag;
    &:first-child {
      margin-right: 0;
    }
    &:hover {
      background-color: ${props.isClose ? '#e81123' : 'rgba(196, 196, 196, 0.4)'};
    }
  ` : `
    width: 12px;
    height: 12px;
    position: relative;
    border-radius: 50%;
    cursor: pointer;
    box-sizing: border-box;
    -webkit-app-region: no-drag;
    background-color: ${props.isClose ? '#ff6058' : `${props.isMinimize ? '#ffbd2e' : '#27ca41'}`};
  `}
`;

export default WindowButton;