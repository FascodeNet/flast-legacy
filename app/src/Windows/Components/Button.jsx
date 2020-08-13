import styled from 'styled-components';

const Button = styled.div`
  width: 48%;
  height: 30px;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  background: none;
  transition: 0.2s background-color;
  border: solid 1px #d4d4d4;
  border-radius: 2px;
  box-sizing: border-box;
  &:hover {
    background-color: rgba(196, 196, 196, 0.4);
  }
`;

export default Button;