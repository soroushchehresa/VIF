import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes';
import HomePage from './containers/Home';

export default () => (
  <Switch>
    <Route path={routes.HOME} component={HomePage} />
  </Switch>
);
