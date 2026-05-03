import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client, ASStatus } from '../types';
import { generateId } from '../lib/utils';

interface AppContextType {
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  updateClientStatus: (id: string, status: ASStatus) => void;
  exportData: () => void;
  importData: (file: File) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialClients: Client[] = [];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('as-clients');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialClients;
      }
    }
    return initialClients;
  });

  useEffect(() => {
    localStorage.setItem('as-clients', JSON.stringify(clients));
  }, [clients]);

  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setClients((prev) => [newClient, ...prev]);
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((client) =>
        client.id === id
          ? { ...client, ...updates, updatedAt: new Date().toISOString() }
          : client
      )
    );
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((client) => client.id !== id));
  };

  const updateClientStatus = (id: string, status: ASStatus) => {
    updateClient(id, { status });
  };

  return (
    <AppContext.Provider
      value={{ 
        clients, 
        addClient, 
        updateClient, 
        deleteClient, 
        updateClientStatus,
        exportData: () => {
          const data = JSON.stringify(clients, null, 2);
          const blob = new Blob([data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `as-backup-${new Date().toISOString().split('T')[0]}.json`;
          link.click();
          URL.revokeObjectURL(url);
        },
        importData: async (file: File) => {
          try {
            const text = await file.text();
            const data = JSON.parse(text);
            if (Array.isArray(data)) {
              setClients(data);
              return true;
            }
            return false;
          } catch (e) {
            console.error('Import failed:', e);
            return false;
          }
        }
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
