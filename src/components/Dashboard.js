import React from 'react'
import {CoinGrid, CoinTile, CoinHeaderGrid, CoinSymbol} from './CoinList';
import styled, {css} from 'styled-components';
import {fontSizeBig, fontSize2, subtleBoxShadow, lightBlueBackground, backgroundColor2} from '../styles/Styles';
import highchartsConfig from './HighChartsConfig';
import theme from './HighChartsTheme';

const ReactHighcharts = require('react-highcharts');
ReactHighcharts.Highcharts.setOptions(theme);
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
const CoinTileCompact = CoinTile.extend`
  ${fontSize2}
  display: grid;
  grid-gap: 5px;
  grid-template-columns: repeat(3, 1fr);
  justify-items: right;
`
const PaddingBlue = styled.div`
  ${subtleBoxShadow}
  ${lightBlueBackground}
  padding: 5px;
`
const ChartGrid = styled.div`
  display: grid;
  margin-top: 15px;
  grid-gap: 20px;
  grid-template-columns: 1fr 3fr;
`
const ChartSelect = styled.select`
  ${backgroundColor2} 
  color: #1163c9;
  border: 1px solid;
  ${fontSize2} 
  margin: 5px;
  height: 25px;
  float: right;
`;

export default function(){
  console.log('dash:', this.state.historical);
  return [
    <CoinGrid key={'coingrid'}>
    {this.state.prices.map((price, index) => {
      let sym = Object.keys(price)[0];
      let data = price[sym]['USD'];
      let tileProps = {
        dashBoardFavorite: sym === this.state.currentFavorite,
        onClick: () => {
          this.setState({ currentFavorite: sym });
          localStorage.setItem('cryptoDash', JSON.stringify({favorites:this.state.favorites,currentFavorite:sym}));
          this.fetchHistorical();
        }
      }
      return index < 5 ? 
        <CoinTile {...tileProps}>
          <CoinHeaderGrid>
            <div>{ sym }</div>
            <CoinSymbol>
              <ChangePct red={data.CHANGEPCT24HOUR < 0}>
                { numberFormat(data.CHANGEPCT24HOUR) } %
              </ChangePct>
            </CoinSymbol>
          </CoinHeaderGrid>
          <TickerPrice>${numberFormat(data.PRICE)}</TickerPrice>
        </CoinTile>  :
        <CoinTileCompact {...tileProps}>
          <div style={{justifySelf:'left'}}>{sym}</div>
          <CoinSymbol>
            <ChangePct red={data.CHANGEPCT24HOUR < 0}>
              { numberFormat(data.CHANGEPCT24HOUR) } %
            </ChangePct>
          </CoinSymbol>
          <div>${numberFormat(data.PRICE)}</div>
        </CoinTileCompact>
    })}
    </CoinGrid>,
    <ChartGrid>
      <PaddingBlue>
        <h2 style={{textAlign: 'center'}}>{this.state.coinList[this.state.currentFavorite].CoinName}</h2>
        <img 
          style={{height: '200px', display: 'block', margin: 'auto'}} 
          src={`http://cryptocompare.com/${this.state.coinList[this.state.currentFavorite].ImageUrl}`} 
          alt='coin'
        />
      </PaddingBlue>
      <PaddingBlue>
        <ChartSelect
          defaultValue={'months'}
          onChange={e => {
            this.setState({ timeInterval: e.target.value, historical: null }, this.fetchHistorical);
          }}
        >
          <option value="days">Days</option>
          <option value="weeks">Weeks</option>
          <option value="months">Months</option>
        </ChartSelect>
        {this.state.historical ? (
          <ReactHighcharts config={highchartsConfig.call(this)} />
        ) : (
          <div> Loading historical data </div>
        )}
      </PaddingBlue>
    </ChartGrid>
  ]  

}