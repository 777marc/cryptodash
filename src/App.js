import React, { Component } from 'react';
import './App.css';
import styled from 'styled-components';
import AppBar from './components/AppBar';
import CoinList from './components/CoinList';
import Search from './components/Search';
import { ConfirmButton } from './components/Button';
import _ from 'lodash';
import fuzzy from 'fuzzy';

const cc = require('cryptocompare');



const AppLayout = styled.div`
  padding: 40px;
`
const Content = styled.div`

`
export const CenterDiv = styled.div`
  display: grid;
  justify-content: center;
`

const MAX_FAVORITES = 10;

const checkFirstVisit = () => {
  let cryptoDashData = localStorage.getItem('cryptoDash');
  if(!cryptoDashData) {
    return {
      firstVisit: true,
      page: 'settings'
    }
  }
  return {};
}



class App extends Component {

  state = {
    page: 'settings',
    coinList: '',
    favorites: ['ETH', 'BTC', 'DOGE', 'EOS'],
    ...checkFirstVisit()
  }

  componentDidMount = () => {
    this.fetchCoins();
  }

  fetchCoins = async () => {
    let coinList = await cc.coinList();
    this.setState({ coinList : coinList.Data })
  }

  displayingDashboard = () => this.state.page === 'dashboard';
  
  displayingSettings = () => this.state.page === 'settings';

  firstVisitMessage = () => {
    if(this.state.firstVisit) {
      return <div>Welcome to CryptoDash, please select you favorite coins to being.</div>
    }
  }

  confirmFavorites = () => {
    this.setState({ firstVisit: false, page: 'dashboard' });
    localStorage.setItem('cryptoDash', JSON.stringify(this.state.favorites));
  }

  settingsContent = () => {
    return <div>
      {this.firstVisitMessage()}
      <div>
        {CoinList.call(this, true)}
        <CenterDiv>
          <ConfirmButton onClick={this.confirmFavorites}>
            Confirm Favorites
          </ConfirmButton>
        </CenterDiv>
        {Search.call(this)}
        {CoinList.call(this)}
      </div>    
    </div>
  }

  loadingContent = () => {
    if(!this.state.coinList){
      return <div>Loading Coins</div>          
    }
  }

  addCoinToFavorites(coin) {
    let favorites = [...this.state.favorites];
    if(favorites.length < MAX_FAVORITES){
      favorites.push(coin);
      this.setState({favorites})
    }
  }

  isInFavorites = (coin) => _.includes(this.state.favorites, coin);
  
  removeCoinFromFavorites(coin) {
    let favorites = [...this.state.favorites];
    this.setState({favorites: _.pull(favorites, coin)});
  }

  handleFilter = _.debounce((inputValue) => {
    let coinSymbols = Object.keys(this.state.coinList)
    let coinNames = coinSymbols.map(sym => this.state.coinList[sym].CoinName);
    let allStringsToSearch = coinSymbols.concat(coinNames);
    let fuzzyResult = fuzzy.filter(inputValue, allStringsToSearch, {}).map(result => result.string);
    let filteredCoins = _.pickBy(this.state.coinList, (result, symKey) => {
      let coinName = result.CoinName;
      return _.includes(fuzzyResult, symKey) || _.includes(fuzzyResult, coinName);
    });
    this.setState({ filteredCoins });
  }, 500)

  filterCoins = (e) => {
    let inputValue = _.get(e, 'target.value');
    if(!inputValue){
      this.setState({filteredCoins: null});
      return;
    }
    this.handleFilter(inputValue);
  }

  render() {
    return (
      <AppLayout>
        {AppBar.call(this)}
        {this.loadingContent() || <Content>
          {this.displayingSettings && this.settingsContent()}
        </Content>}
      </AppLayout>
    );
  }
}

export default App;
