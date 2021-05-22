import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';

import Main from './pages/main';

const DefaultRouter = () => (
  <Router>   {/* basename={'bswap_test'} */}
    <Switch>
      <Route path="/" exact component={Main} />
    </Switch>
  </Router >
)

export default DefaultRouter; 