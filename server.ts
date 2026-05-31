/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter, initializeDB } from './api-router';

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize DB
  initializeDB();

  // Mount API Router
  app.use(apiRouter);

  // Vite preview & static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kalimaya Alunna Server is running on port ${PORT}`);
  });
}

startServer();
