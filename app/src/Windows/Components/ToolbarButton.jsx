import styled from 'styled-components';

export const ToolbarButton = styled.div.attrs({ tabIndex: 0 })`
  width: 30px;
  height: 30px;
  margin: 5px;
  margin-left: ${props => props.isMarginLeft ? '5px' : '0px'};
  padding: 3px;
  position: relative;
  flex-grow: 0;
  display: ${props => props.isShowing ? 'display' : 'none'};
  float: ${props => props.isRight ? 'right' : 'left'};
  background-color: initial;
  border: none;
  border-radius: 2px;
  background-image: url(${props => props.src});
  background-size: ${props => props.size}px;
  background-position: center;
  background-repeat: no-repeat;
  transition: 0.2s background-color;
  outline: none;

  &:hover {
    ${props => props.isEnabled && `background-color: ${!props.isDarkModeOrPrivateMode ? 'rgba(0, 0, 0, 0.06)' : 'rgba(130, 130, 130, 0.3)'};`}
  }
  &:active {
    ${props => props.isEnabled && `background-color: ${!props.isDarkModeOrPrivateMode ? 'rgba(0, 0, 0, 0.12)' : 'rgba(130, 130, 130, 0.6)'};`}
  }

  &:focus-visible {
    border: solid 1px ${props => !props.isDarkModeOrPrivateMode ? 'black' : 'white'};
  }
`;

export const ToolbarButtonBadge = styled.span`
  width: 18px;
  height: 18px;
  padding: 5px;
  position: absolute;
  bottom: 6px;
  right: 6px;
  border-radius: 50%;
  display: inline-block;
  background-color: #999999;
  font-size: 0.7em;
  line-height: 1;
  box-shadow: 0px 0px 3px #999;
  text-align: center;
  transform: translate(50%, 50%);color: white;
  box-sizing: border-box;
`;