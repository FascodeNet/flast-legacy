import styled from 'styled-components';

const ToolbarDivider = styled.div`
  background-color: initial;
  width: 1px;
  height: 30px;
  margin: 5px;
  border-left: solid 1px ${props => !props.isDarkModeOrPrivateMode ? '#e1e1e1' : '#8b8b8b'};
`;

export default ToolbarDivider;