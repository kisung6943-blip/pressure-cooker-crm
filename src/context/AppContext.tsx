import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client, ASStatus } from '../types';
import { generateId } from '../lib/utils';
import { fetchClientsFromCloud, saveClientsToCloud } from '../lib/supabase';

interface AppContextType {
  clients: Client[];
  isSyncing: boolean;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  updateClientStatus: (id: string, status: ASStatus) => void;
  exportData: () => void;
  importData: (file: File) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialClients: Client[] = [
  {
    id: 'client-1',
    name: '김철수',
    contact: '010-1234-5678',
    address: '서울특별시 강남구 테헤란로 123',
    model: '휘슬러 비타퀵 4.5L',
    asDetails: '고무 패킹 교체 및 메인 안전 밸브 점검',
    status: '완료',
    price: 45000,
    trackingNumber: '123456789012',
    createdAt: '2026-08-30T10:00:00.000Z',
    updatedAt: '2026-08-31T14:20:00.000Z',
  },
  {
    id: 'client-2',
    name: '이영희',
    contact: '010-9876-5432',
    address: '경기도 성남시 분당구 판교역로 45',
    model: 'PN풍년 하이클래스 IH 6인용',
    asDetails: '신호추 압력 누설 점검 및 노즐 청소',
    status: '수리',
    price: 25000,
    createdAt: '2026-08-31T11:30:00.000Z',
    updatedAt: '2026-09-01T09:10:00.000Z',
  },
  {
    id: 'client-3',
    name: '박지성',
    contact: '010-5555-4321',
    address: '인천광역시 연수구 송도국제대로 88',
    model: '휘슬러 프리미엄 이디션 2.5L',
    asDetails: '핸들 파손 교체 및 시큐리티 밸브 교체',
    status: '수거접수',
    price: 35000,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
  },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isSyncing, setIsSyncing] = useState<boolean>(true);
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('as-clients');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse local clients:', e);
      }
    }
    return initialClients;
  });

  // Initial cloud sync & merger
  useEffect(() => {
    let isMounted = true;

    async function syncCloud() {
      try {
        setIsSyncing(true);
        const cloudClients = await fetchClientsFromCloud();

        if (!isMounted) return;

        if (cloudClients && cloudClients.length > 0) {
          setClients(cloudClients);
          localStorage.setItem('as-clients', JSON.stringify(cloudClients));
        } else {
          // If cloud has no data, upload local data or initial sample data to cloud
          const dataToUpload = clients.length > 0 ? clients : initialClients;
          setClients(dataToUpload);
          localStorage.setItem('as-clients', JSON.stringify(dataToUpload));
          await saveClientsToCloud(dataToUpload);
        }
      } catch (err) {
        console.error('Cloud sync error:', err);
      } finally {
        if (isMounted) {
          setIsSyncing(false);
        }
      }
    }

    syncCloud();

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to persist both locally and to Supabase cloud
  const syncAndSetClients = (newClients: Client[]) => {
    setClients(newClients);
    localStorage.setItem('as-clients', JSON.stringify(newClients));
    saveClientsToCloud(newClients);
  };

  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newClient, ...clients];
    syncAndSetClients(updated);
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    const updated = clients.map((client) =>
      client.id === id
        ? { ...client, ...updates, updatedAt: new Date().toISOString() }
        : client
    );
    syncAndSetClients(updated);
  };

  const deleteClient = (id: string) => {
    const updated = clients.filter((client) => client.id !== id);
    syncAndSetClients(updated);
  };

  const updateClientStatus = (id: string, status: ASStatus) => {
    updateClient(id, { status });
  };

  return (
    <AppContext.Provider
      value={{
        clients,
        isSyncing,
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
              syncAndSetClients(data);
              return true;
            }
            return false;
          } catch (e) {
            console.error('Import failed:', e);
            return false;
          }
        },
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
