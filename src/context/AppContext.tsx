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

// Real user client records restored from backup
const initialClients: Client[] = [
  {
    id: 'oq3u3so',
    name: '김희준',
    contact: '010-3866-0268',
    address: '경기도 평택시 정암로 21(서정라페온빌3차) 1020호',
    model: '실리트',
    asDetails: '실리트 윗손잡이 교체',
    status: '수거접수',
    price: 0,
    trackingNumber: '',
    createdAt: '2026-04-29T02:34:49.538Z',
    updatedAt: '2026-04-29T02:34:49.538Z',
  },
  {
    id: 'tlo51mw',
    name: '양승애',
    contact: '0502-4251-0883',
    address: '서울시 중구 충무로 4가 306 남산 센트럴 자이 B동 1303호',
    model: '실리트',
    asDetails: '김이 샌다고함',
    status: '수거접수',
    price: 0,
    trackingNumber: '',
    createdAt: '2026-04-28T08:19:38.110Z',
    updatedAt: '2026-04-28T08:19:38.110Z',
  },
  {
    id: '9yq6qua',
    name: '하재순',
    contact: '010-6851-2399',
    address: '인천광역시 중구 운서3로 27번길 5 403호',
    model: '휘슬러 프리미엄 압력솥 2.5리터',
    asDetails: '손잡이가 안된다고 함\n아래손잡이만 조임\n고무패킹까지 교체 해줌',
    status: '출고',
    price: 16000,
    trackingNumber: '우체국택 6890132397709',
    createdAt: '2026-04-27T12:29:52.735Z',
    updatedAt: '2026-04-28T07:15:48.256Z',
  },
  {
    id: 'k736wid',
    name: '서태숙',
    contact: '01035869744',
    address: '경남 창녕군 창녕읍 솔재길 21 ',
    model: '실리트 냄비',
    asDetails: '손잡이 교체 요청',
    status: '출고',
    price: 30000,
    trackingNumber: '우체국택배 68901-2982-8294',
    createdAt: '2026-04-16T00:32:31.570Z',
    updatedAt: '2026-04-20T05:24:22.375Z',
  },
  {
    id: 'r10jbrn',
    name: '서진영',
    contact: '01055495907',
    address: '경기도 고양시 일산동구 강송로33  102동 705호',
    model: '실리트압력밥솥',
    asDetails: '손잡이쪽에서 김이 샌다고함',
    status: '출고',
    price: 27000,
    trackingNumber: '우체국6890128707609',
    createdAt: '2026-04-13T11:14:17.517Z',
    updatedAt: '2026-04-16T00:34:15.702Z',
  },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
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
              localStorage.setItem('as-clients', JSON.stringify(data));
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
