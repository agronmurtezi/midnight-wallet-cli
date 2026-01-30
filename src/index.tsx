#!/usr/bin/env node

import React from 'react';
import { render } from 'ink';
import { App } from './App.js';

/**
 * Graceful shutdown handler
 */
function shutdown(): Promise<void> {
  process.exit(0);
}

// Setup process signal handlers
process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());

// Render the app
const { waitUntilExit } = render(<App onExit={shutdown} />);

// Wait for the app to exit
waitUntilExit()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Fatal error:', error);
    process.exit(1);
  });
