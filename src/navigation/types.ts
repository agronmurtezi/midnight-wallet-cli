import type { Environment, SeedType } from '../types.js';

/**
 * Route definitions with their required parameters
 */
export type Routes = {
  environment: undefined;
  seedType: { environment: Environment };
  seed: { environment: Environment; seedType: SeedType };
  initializing: { environment: Environment; seedType: SeedType; seed: Uint8Array };
  dashboard: { environment: Environment };
};

export type RouteName = keyof Routes;

export type RouteParams<T extends RouteName> = Routes[T];

/**
 * A route with typed parameters
 */
export type Route<T extends RouteName = RouteName> = Routes[T] extends undefined
  ? { name: T; params?: undefined }
  : { name: T; params: Routes[T] };

/**
 * Type-safe stack navigator
 */
export interface Navigator {
  /** Current (top) route */
  route: Route;

  /** Full navigation stack */
  stack: readonly Route[];

  /** Push a new route onto the stack */
  push<T extends RouteName>(name: T, params: Routes[T]): void;

  /** Replace the current route */
  replace<T extends RouteName>(name: T, params: Routes[T]): void;

  /** Pop the current route from the stack */
  pop(): void;

  /** Reset the stack with a single route */
  reset<T extends RouteName>(name: T, params: Routes[T]): void;

  /** Check if back navigation is possible */
  canGoBack(): boolean;
}
