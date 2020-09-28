import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';


const CheckboxWrapper = styled.label`
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
`;

const CheckboxContainer = styled.div`
  margin-right: 0.2rem;
  display: flex;
  align-items: center;
  border: solid 1px #0a84ff;
  border-radius: 3px;
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  position: absolute;
  overflow: hidden;
  white-space: nowrap;
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
`;

const StyledCheckbox = styled.div`
  width: 16px;
  height: 16px;
  display: inline-block;
  background: #0a84ff;
  transition: visibility 1s ease-out;
  
  ${HiddenCheckbox}:focus + & {
    box-shadow: 0 0 0 3px pink;
  }

  ${Icon} {
    visibility: ${props => props.checked ? 'visible' : 'hidden'};
	  transition: visibility 1s ease-out;
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
				<CheckboxWrapper>
					<Checkbox checked={this.props.isChecked} onChange={this.props.onChange} />
					<span>{this.props.text}</span>
				</CheckboxWrapper>
			</div>
		);
	}
}

Checkbox.propTypes = {
	isChecked: PropTypes.bool.isRequired,
	text: PropTypes.string.isRequired
};

export default Checkbox;