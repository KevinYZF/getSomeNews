import React, { useState } from 'react';
import {
  HashRouter as Router,
  Route,
  Switch
} from "react-router-dom";
import { observer, inject } from "mobx-react";

import './app.css';
import { StoreProps } from './store/store';
import AppHeader from './components/AppHeader';
import SelectSourcePage from './pages/SelectSourcePage';
import FeedPage from './pages/FeedPage';
import DetailPage from './pages/DetailPage';

const useHeaderCtrl = (props: StoreProps) => {
  const [appTitle, setAppTitle] = useState('看新闻');
  const [canGoBack, setGoBackStatus] = useState(false);
  const [hasInit, setInitStatus] = useState(false);
  if (!hasInit) {
    window.addEventListener('hashchange', () => {
      if (window.location.hash === '#/') {
        setAppTitle('看新闻');
        setGoBackStatus(false);
      }
      if (window.location.hash === '#/feed') {
        setAppTitle(props.appStorage!.activeSource);
        setGoBackStatus(true);
      }
      if (window.location.hash === '#/detail') {
        setAppTitle('');
        setGoBackStatus(true);
      }
    });
    setInitStatus(true);
  }
  return {
    appTitle,
    canGoBack
  };
}

const App: React.FC<StoreProps> = (props: StoreProps) => {
  const {appTitle, canGoBack} = useHeaderCtrl(props);
  return (
    <div className="App">
      <Router>
        <AppHeader title={appTitle} back={canGoBack} onBack={() => window.history.back()}/>
        <Switch>
          <Route exact path="/">
            <SelectSourcePage />
          </Route>
          <Route path="/feed">
            <FeedPage />
          </Route>
          <Route path="/detail">
            <DetailPage />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default inject('appStorage')(observer(App));
