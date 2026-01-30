import React from 'react';
import { EnvironmentScreen } from './EnvironmentScreen.js';
import { SeedTypeScreen } from './SeedTypeScreen.js';
import { SeedScreen } from './SeedScreen.js';
import { InitializingScreen } from './InitializingScreen.js';
import type { Route, Navigator } from '../../navigation/index.js';

interface Props {
  route: Route;
  nav: Navigator;
  onSeedSubmit: (seed: Uint8Array) => Promise<void>;
}

/**
 * SetupScreen - Routes between setup screens
 */
export const SetupScreen: React.FC<Props> = ({ route, nav, onSeedSubmit }) => {
  switch (route.name) {
    case 'environment':
      return <EnvironmentScreen route={route as Route<'environment'>} nav={nav} />;

    case 'seedType':
      return <SeedTypeScreen route={route as Route<'seedType'>} nav={nav} onSeedSubmit={onSeedSubmit} />;

    case 'seed':
      return <SeedScreen route={route as Route<'seed'>} nav={nav} onSeedSubmit={onSeedSubmit} />;

    case 'initializing':
      return <InitializingScreen route={route as Route<'initializing'>} nav={nav} />;

    default:
      return null;
  }
};
