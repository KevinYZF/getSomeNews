import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from "mobx-react";

import '@fortawesome/fontawesome-free/css/all.css';
import 'bulma/css/bulma.min.css';

import App from './App';
import AppStorage from './store/store';


const Store = new AppStorage();


window.location.hash = "#/";
ReactDOM.render(<Provider appStorage={Store}>
  <App />
</Provider>, document.getElementById('root'));
