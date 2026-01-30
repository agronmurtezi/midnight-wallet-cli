import React from 'react';
import { Loader } from '../../components/Loader.js';
import type { Route, Navigator } from '../../navigation/index.js';

interface Props {
  route: Route<'initializing'>;
  nav: Navigator;
}

export const InitializingScreen: React.FC<Props> = () => {
  return <Loader text="Initializing wallets..." />;
};
