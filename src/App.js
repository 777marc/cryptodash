import React, { Component } from 'react';
import './App.css';
import styled from 'styled-components';
import AppBar from './components/AppBar';
import CoinList from './components/CoinList';
import Search from './components/Search';
import Dashboard from './components/Dashboard';
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
  let cryptoDashData = JSON.parse(localStorage.getItem('cryptoDash'));
  if(!cryptoDashData) {
    return {
      firstVisit: true,
      page: 'settings'
    }
  }
  let { favorites, currentFavorite } = cryptoDashData;
  return {
    favorites,
    currentFavorite
  };
}

class App extends Component {

  state = {
    page: 'dashboard',
    favorites: ['ETH', 'BTC', 'DOGE', 'EOS'],
    currentFavorite: 'ETH',
    ...checkFirstVisit()
  }

  componentDidMount = () => {
    this.fetchCoins();
    this.fetchPrices();
  }

  fetchCoins = async () => {
    let coinList = await cc.coinList();
    this.setState({ coinList : coinList.Data })
  }

  fetchPrices = async () => {
    let prices = [];
    try {
      prices = await this.prices();
    } catch (error) {
      this.setState({error: true});
    }
    this.setState({prices});
  }

  prices = () => {
    let promises = [];
    this.state.favorites.forEach(sym => {
      promises.push(cc.priceFull(sym,'USD'));
    });
    return Promise.all(promises);
  }

  displayingDashboard = () => this.state.page === 'dashboard';
  
  displayingSettings = () => this.state.page === 'settings';

  firstVisitMessage = () => {
    if(this.state.firstVisit) {
      return <div>Welcome to CryptoDash, please select you favorite coins to being.</div>
    }
  }

  confirmFavorites = () => {
    this.setState({ firstVisit: false, page: 'dashboard', prices: null, currentFavorite: this.state.favorites[0]});
    this.fetchPrices();
    localStorage.setItem('cryptoDash', JSON.stringify({favorites: this.state.favorites, currentFavorite: this.state.favorites[0]}));
  }

  settingsContent = () => {
    return (
      <div>
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
    );
  }

  loadingContent = () => {
    if(!this.state.coinList){
      return <div>Loading Coins</div>          
    }
    if(!this.state.prices){
      return <div>Loading Pricing</div>          
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
        {this.loadingContent() || (
          <Content>
            {this.displayingSettings() && this.settingsContent()}
            {this.displayingDashboard() && Dashboard.call(this)}
          </Content>
        )}
      </AppLayout>
    );
  }
}

export default App;
