import React from 'react';
import styled from 'styled-components';

/*
export const ToolbarButton = styled.div.attrs({ tabIndex: 0 })`
  width: 30px;
  height: 30px;
  margin: 5px;
  margin-left: ${props => props.isMarginLeft ? '5px' : '0px'};
  padding: 3px;
  position: relative;
  flex-grow: 0;
  display: ${props => props.isShowing ? 'flex' : 'none'};
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
*/

const ToolbarButtonContainer = styled.div.attrs({ tabIndex: 0 })`
  min-width: 30px;
  width: ${props => props.text ? 'auto' : '30px'};
  height: 30px;
  margin: 5px 0;
  margin-${props => props.position}: 5px;
  padding: 3px;

  display: ${props => props.visibility ? 'flex' : 'none'};
  float: ${props => props.position};
  align-items: center;
  flex-grow: 0;
  position: relative;
  
  background-color: initial;
  border: none;
  border-radius: 2px;
  transition: 0.2s background-color;
  outline: none;
  
  &:hover {
    ${props => !props.disabled && `background-color: ${!props.dark ? 'rgba(0, 0, 0, 0.06)' : 'rgba(130, 130, 130, 0.3)'};`}
  }
  &:active {
    ${props => !props.disabled && `background-color: ${!props.dark ? 'rgba(0, 0, 0, 0.12)' : 'rgba(130, 130, 130, 0.6)'};`}
  }

  &:focus-visible {
    border: solid 1px ${props => !props.dark ? '#000' : '#fff'};
  }
`;

const ToolbarButtonImage = styled.div.attrs({ tabIndex: 0 })`
  min-width: ${props => props.size}px;
  min-height: ${props => props.size}px;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 3px;
  background-image: url(${props => props.src});
  background-size: ${props => props.size}px;
  background-position: center;
  background-repeat: no-repeat;
  outline: none;
`;

const ToolbarButtonText = styled.div`
  margin: 0px ${props => props.visibility ? 3 : 0}px;
  padding: 0;
  display: ${props => props.visibility ? 'flex' : 'none'};
  font-family: 'Noto Sans', 'Noto Sans JP';
  color: ${props => !props.dark ? '#000' : '#fff'};
  white-space: nowrap;
`;

const ToolbarButtonBadge = styled.span`
  height: 16px;
  padding: 4px;
  position: absolute;
  bottom: 6px;
  right: 6px;
  border-radius: 4px;
  display: inline-block;
  background-color: #999999;
  font-size: .8em;
  line-height: 1;
  text-align: center;
  transform: translate(50%, 50%);
  color: white;
  box-sizing: border-box;
`;

export const ToolbarButton = (props) => {
  const isTextVisibility = props.text !== undefined && props.text !== '';
  return (
    <ToolbarButtonContainer visibility={props.visibility ?? true} disabled={props.disabled ?? false} text={isTextVisibility} style={props.style}
      position={props.position ?? 'left'} dark={props.dark ?? false} title={props.toolTip ?? ''} onClick={props.onClick ?? null}>
      <ToolbarButtonImage src={props.src} size={props.size ?? 24} style={props.imageStyle} />
      <ToolbarButtonText visibility={isTextVisibility} dark={props.dark ?? false} style={props.textStyle}>{props.text}</ToolbarButtonText>
      {props.badge !== undefined && <ToolbarButtonBadge style={props.badgeStyle}>{props.badge}</ToolbarButtonBadge>}
    </ToolbarButtonContainer>
  );
};