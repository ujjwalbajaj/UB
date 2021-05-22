import React, { PureComponent } from "react";
import styled from 'styled-components'

const ButtonStyled = styled.a`{
  margin: '10px 10px 10px 0'
}`

export default class Button extends PureComponent {
  render() {
    return (
      <ButtonStyled
        onClick={this.props.handleClick}
        href="#">
            {this.props.label}
        </ButtonStyled>
    );
  }
}