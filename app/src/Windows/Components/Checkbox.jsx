import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';


const CheckboxContainer = styled.div`
  display: inline-block;
  vertical-align: middle;
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  // Hide checkbox visually but remain accessible to screen readers.
  // Source: https://polished.js.org/docs/#hidevisually
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

const StyledCheckbox = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  background: ${props => props.checked ? 'salmon' : 'papayawhip'};
  border-radius: 3px;
  transition: all 150ms;
  
  ${HiddenCheckbox}:focus + & {
    box-shadow: 0 0 0 3px pink;
  }

  ${Icon} {
    visibility: ${props => props.checked ? 'visible' : 'hidden'}
  }
`;

const Icon = styled.svg`
  fill: none;
  stroke: white;
  stroke-width: 2px;
`;

class Checkbox extends Component {

    render() {
        const Checkbox = ({ className = '', checked = false, ...props }) => (
            <CheckboxContainer className={className}>
                <HiddenCheckbox checked={checked} {...props} />
                <StyledCheckbox checked={checked}>
                    <Icon viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                    </Icon>
                </StyledCheckbox>
            </CheckboxContainer>
        );

        return (
            <div>
                <label>
                    <Checkbox checked={this.props.isChecked} onChange={this.props.onChange} />
                    <span>{this.props.text}</span>
                </label>
            </div>
        );
    }
}

Checkbox.propTypes = {
    isChecked: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired
};

export default Checkbox;