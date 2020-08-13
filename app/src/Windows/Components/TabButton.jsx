import styled from 'styled-components';

const TabButton = styled.div`
  background-color: initial;
  border: none;
  border-radius: 2px;
  width: 26px;
  height: 26px;
  margin: 3px;
  margin-left: 4px;
  padding: 3px;
  color: ${props => props.isActive ? 'black' : 'white'};
  background-image: url(${props => props.src});
  background-size: ${props => props.size}px;
  background-position: center;
  background-repeat: no-repeat;
  transition: 0.2s background-color;
  box-sizing: border-box;
  float: ${props => props.isRight ? 'right' : 'left'};
  
  &:hover {
    background-color: rgba(130, 130, 130, 0.3);
  }
  &:active {
    background-color: rgba(130, 130, 130, 0.6);
  }

  &:focus-visible {
    border: solid 1px ${props => !props.isDarkModeOrPrivateMode ? 'black' : 'white'};
  }
`;

export default TabButton;