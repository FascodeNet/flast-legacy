import styled from 'styled-components';

const Toolbar = styled.div`
  width: 100%;
  height: 40px;
  display: flex;
  align-content: space-around;
  background: ${props => props.backgroundColor};
  border-bottom: ${props => !props.isBookmarkBar ? `solid 1px ${props.borderColor}` : 'none'};
  box-sizing: border-box;
`;

export default Toolbar;