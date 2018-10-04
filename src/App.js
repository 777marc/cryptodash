import React, { Component } from 'react';
import './App.css';
import styled from 'styled-components';
import AppBar from './components/AppBar';
import CoinList from './components/CoinList';
const cc = require('cryptocompare');
const _ = require('lodash');

const AppLayout = styled.div`
  padding: 40px;
`

const Content = styled.div`

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
    localStorage.setItem('cryptoDash', 'test');
    this.setState({ firstVisit: false, page: 'dashboard' });
  }

  settingsContent = () => {
    return <div>
      {this.firstVisitMessage()}
      <div onClick={this.confirmFavorites}>
        Confirm Favorites
      </div>
      <div>
        {CoinList.call(this, true)}
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
