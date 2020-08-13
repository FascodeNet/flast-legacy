import styled from 'styled-components';
import TabButton from '../TabButton';

const { remote, ipcRenderer, shell } = window.require('electron');
const { app, systemPreferences, Menu, MenuItem, dialog, nativeTheme } = remote;

const path = window.require('path');

const Config = window.require('electron-store');
const config = new Config();
const userConfig = new Config({
    cwd: path.join(app.getPath('userData'), 'Users', config.get('currentUser'))
});

const lang = window.require(`${app.getAppPath()}/langs/${userConfig.get('language') != undefined ? userConfig.get('language') : 'ja'}.js`);

const platform = require('electron-platform');

const buttonHeight = 27;

export const Window = styled.div`
  width: 100%;
  height: ${platform.isWin32 || platform.isDarwin ? 'auto' : '100%'};
  margin: ${platform.isWin32 || platform.isDarwin ? '0px 4px 2px' : '0px'};
  padding: 5px 0px;
  position: absolute;
  display: flex;
  flex-direction: column;
  border-radius: ${platform.isWin32 || platform.isDarwin ? 2 : 0}px;
  border: ${platform.isWin32 || platform.isDarwin ? 'none' : (props => !props.isDarkModeOrPrivateMode ? 'solid 1px #e1e1e1' : 'solid 1px #8b8b8b')};
  background-color: ${props => !props.isDarkModeOrPrivateMode ? '#f9f9fa' : '#353535'};
  color: ${props => !props.isDarkModeOrPrivateMode ? '#353535' : '#f9f9fa'};
  box-shadow: ${platform.isWin32 || platform.isDarwin ? '0px 2px 4px rgba(0, 0, 0, 0.16), 0px 2px 4px rgba(0, 0, 0, 0.23)' : 'none'};
  box-sizing: border-box;
`;

export const Button = styled.div`
  width: 100%;
  height: ${buttonHeight}px;
  margin: 0px;
  padding: 0px 7px;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  background: none;
  transition: 0.2s background-color;
  box-sizing: border-box;
  &:hover {
    background-color: rgba(196, 196, 196, 0.4);
  }
`;

export const ButtonTitle = styled.span`
  width: auto;
  margin-left: ${props => props.hasIcon !== null && props.hasIcon ? 7 : 25}px;
`;

export const ButtonAccelerator = styled.span`
  width: auto;
  margin-left: auto;
  margin-right: 20px;
`;

export const Divider = styled.div`
  background-color: initial;
  width: ${props => props.isVertical ? '1px' : '100%'};
  height: ${props => props.isVertical ? `${buttonHeight}px` : '1px'};
  margin-top: ${props => props.isVertical ? 0 : 5}px;
  margin-bottom: ${props => props.isVertical ? 0 : 5}px;
  margin-left: ${props => props.isVertical ? 5 : 0}px;
  margin-right: ${props => props.isVertical ? 5 : 0}px;
  ${props => props.isVertical ? 'border-left' : 'border-top'}: solid 1px ${props => !props.isDarkModeOrPrivateMode ? '#e1e1e1' : '#8b8b8b'};
`;

export const Dialog = styled.div`
  width: 100%;
  height: ${platform.isWin32 || platform.isDarwin ? '505px' : '100%'};
  margin: ${platform.isWin32 || platform.isDarwin ? '0px 4px 2px' : '0px'};
  padding: 0px;
  position: absolute;
  top: 0px;
  transform: translateX(${props => props.isOpen ? '0%' : '105%'});
  display: flex;
  flex-flow: column nowrap;
  border-radius: ${platform.isWin32 || platform.isDarwin ? 2 : 0}px;
  border: ${platform.isWin32 || platform.isDarwin ? 'none' : (props => !props.isDarkModeOrPrivateMode ? 'solid 1px #e1e1e1' : 'solid 1px #8b8b8b')};
  background-color: ${props => !props.isDarkModeOrPrivateMode ? '#f9f9fa' : '#353535'};
  color: ${props => !props.isDarkModeOrPrivateMode ? '#353535' : '#f9f9fa'};
  transition: 0.2s transform;
  box-sizing: border-box;
`;

export const DialogHeader = styled.div`
  width: 100%;
  height: 35px;
  margin: 0px;
  padding: 0px;
  display: flex;
  background-color: gray;
  border-top-left-radius: ${platform.isWin32 || platform.isDarwin ? 2 : 0}px;
  border-top-right-radius: ${platform.isWin32 || platform.isDarwin ? 2 : 0}px;
  box-sizing: border-box;
`;

export const DialogHeaderButton = styled.div`
  width: 25px;
  height: 25px;
  margin: 5px;
  padding: 3px;
  position: relative;
  flex-grow: 0;
  background-image: url(${props => props.src});
  background-size: ${props => props.size}px;
  background-position: center;
  background-repeat: no-repeat;
  background-color: initial;
  border: none;
  border-radius: 2px;
  transition: 0.2s background-color;
  outline: none;
  &:hover {
    background-color: ${props => !props.isDarkModeOrPrivateMode ? 'rgba(0, 0, 0, 0.06)' : 'rgba(130, 130, 130, 0.3)'};
  }
`;

export const DialogHeaderTitle = styled.span`
  display: flex;
  align-items: center;
  margin: 0 auto;
`;

export const DialogContainer = styled.div`
  width: 100%;
  height: 100%;
  margin: 0px;
  padding: 5px 0px;
  display: flex;
  flex-direction: column;
  border-bottom-left-radius: ${platform.isWin32 || platform.isDarwin ? 2 : 0}px;
  border-bottom-right-radius: ${platform.isWin32 || platform.isDarwin ? 2 : 0}px;
  border: ${platform.isWin32 || platform.isDarwin ? 'none' : (props => !props.isDarkModeOrPrivateMode ? 'solid 1px #e1e1e1' : 'solid 1px #8b8b8b')};
  background-color: ${props => !props.isDarkModeOrPrivateMode ? '#f9f9fa' : '#353535'};
  color: ${props => !props.isDarkModeOrPrivateMode ? '#353535' : '#f9f9fa'};
  box-sizing: border-box;
`;