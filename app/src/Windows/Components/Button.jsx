import styled from 'styled-components';

const Button = styled.div`
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background: none;
  transition: 0.2s background-color;
  border: solid 1px #d4d4d4;
  border-radius: 2px;

  &:hover {
    background-color: rgba(196, 196, 196, 0.4);
  }
`;

export default Button;