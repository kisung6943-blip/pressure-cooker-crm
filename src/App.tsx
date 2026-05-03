/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { ClientManagement } from './pages/ClientManagement';
import { ASBoard } from './pages/ASBoard';

export default function App() {
  return (
    <AppProvider>
      <Layout>
        {(currentView) => {
          switch (currentView) {
            case 'dashboard':
              return <Dashboard />;
            case 'clients':
              return <ClientManagement />;
            case 'board':
              return <ASBoard />;
            default:
              return <Dashboard />;
          }
        }}
      </Layout>
    </AppProvider>
  );
}

