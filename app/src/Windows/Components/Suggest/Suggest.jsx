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

export const Suggest = styled.div`
  width: ${props => props.width}px;
  top: ${props => props.top + 31}px;
  left: ${props => props.left + 1}px;
  position: absolute;
  padding: 0;
  display: ${props => props.isShowing ? 'flex' : 'none'};
  flex-direction: column;
  justify-content: space-around;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.16), 0px 2px 4px rgba(0, 0, 0, 0.23);
  background-color: ${props => props.isDarkModeOrPrivateMode ? '#353535' : '#f9f9fa'};
  color: ${props => props.isDarkModeOrPrivateMode ? '#f9f9fa' : '#353535'};
  box-sizing: border-box;
`;

export const SuggestListContainer = styled.ul`
  margin: 5px;
  padding: 0px;
  box-sizing: border-box;
`;

export const SuggestListItem = styled.li`
  padding: 4px 6px;
  list-style: none;
  transition: 0.2s background-color;
  border-radius: 2px;
  box-sizing: border-box;
  &:hover {
    background-color: rgba(196, 196, 196, 0.4);
  }
`;

export const SuggestListItemPrimaryText = styled.span`
  font-size: 14px;
`;

export const SuggestListItemSecondaryText = styled.span`
  margin-left: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0;
  box-sizing: border-box;
  
  ${SuggestListItem}:hover & {
	opacity: 1;
  }
`;

export const SuggestListItemIcon = styled.div`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  margin-right: 5px;
  display: inline-block;
  vertical-align: sub;
  background-image: url(${props => props.src});
  background-size: ${props => props.size}px;
  background-position: center;
  background-repeat: no-repeat;
  box-sizing: border-box;
`;

export const SuggestButton = styled.li`
  background: transparent;
  transition: 0.2s background-color;
  box-sizing: border-box;
  &:hover {
    background-color: rgba(196, 196, 196, 0.4);
  }
`;