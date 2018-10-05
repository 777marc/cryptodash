import React from 'react'
import {CoinGrid, CoinTile, CoinHeaderGrid, CoinSymbol} from './CoinList';
import styled, {css} from 'styled-components';
import {fontSizeBig} from '../styles/Styles';

const numberFormat = (number) => {
  return +(number + '').slice(0,7);
}

const ChangePct = styled.div`
  color: green;
  ${props => props.red && css`
    color:red;
  `}
`
const TickerPrice = styled.div`
  ${fontSizeBig}
`

export default function(){

  return <CoinGrid>
    {this.state.prices.map(price => {
      let sym = Object.keys(price)[0];
      let data = price[sym]['USD'];
      return <CoinTile>
        <CoinHeaderGrid>
          <div>{ sym }</div>
          <CoinSymbol>
            <ChangePct red={data.CHANGEPCT24HOUR < 0}>
              { numberFormat(data.CHANGEPCT24HOUR) } %
            </ChangePct>
          </CoinSymbol>
        </CoinHeaderGrid>
        <TickerPrice>${numberFormat(data.PRICE)}</TickerPrice>
      </CoinTile>
    })}
  </CoinGrid>
  

}