import styled from 'styled-components';
import { ToolbarButton } from './ToolbarButton';

export const BookmarkBar = styled.div`
  width: 100%;
  height: 32px;
  display: ${props => props.isShowing ? 'flex' : 'none'};
  background-color: ${props => !props.isDarkModeOrPrivateMode ? '#f9f9fa' : '#353535'};
  border-bottom: solid 1px ${props => !props.isDarkModeOrPrivateMode ? '#e1e1e1' : '#8b8b8b'};
  box-sizing: border-box;
`;

const buttonSize = 26;
export const BookmarkBarButton = styled(ToolbarButton)`
  width: ${buttonSize}px;
  height: ${buttonSize}px;
  margin: 3px;
  padding: 0px;
  display: initial;
  float: initial;
`;