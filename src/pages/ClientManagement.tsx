import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ClientFormModal } from '../components/ClientFormModal';
import { Client } from '../types';
import { Plus, Edit2, Trash2, Search, Camera, X } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export function ClientManagement() {
  const { clients, addClient, updateClient, deleteClient } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingClient(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('정말로 이 고객을 삭제하시겠습니까?')) {
      deleteClient(id);
    }
  };

  const handleSubmit = (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingClient) {
      updateClient(editingClient.id, data);
    } else {
      addClient(data);
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.includes(searchTerm) ||
      c.contact.includes(searchTerm) ||
      c.model.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">고객 관리</h2>
          <p className="text-[15px] text-[#86868b] mt-2">고객 정보 및 AS 내역을 관리합니다.</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center px-5 py-2.5 text-[15px] font-medium text-white bg-[#0071e3] rounded-full shadow-sm hover:bg-[#0077ED] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0071e3] transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />새 고객 등록
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border-0 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#86868b]" />
            </div>
            <input
              type="text"
              placeholder="이름, 연락처, 모델명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-4 py-2.5 bg-[#f5f5f7] border-0 rounded-full leading-5 placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3] sm:text-[15px] transition-shadow"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="px-8 py-4 text-left text-[13px] font-medium text-[#86868b] uppercase tracking-wider">고객명/연락처</th>
                <th scope="col" className="px-8 py-4 text-left text-[13px] font-medium text-[#86868b] uppercase tracking-wider">모델/사진/AS내용</th>
                <th scope="col" className="px-8 py-4 text-left text-[13px] font-medium text-[#86868b] uppercase tracking-wider">상태</th>
                <th scope="col" className="px-8 py-4 text-left text-[13px] font-medium text-[#86868b] uppercase tracking-wider">비용</th>
                <th scope="col" className="relative px-8 py-4"><span className="sr-only">관리</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-[15px] text-[#86868b]">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-[#f5f5f7]/50 transition-colors">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-[15px] font-semibold text-[#1d1d1f]">{client.name}</div>
                      <div className="text-[13px] text-[#86868b] mt-0.5">{client.contact}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-start space-x-3">
                        {client.productImageUrl && (
                          <img
                            src={client.productImageUrl}
                            alt="압력솥 사진"
                            onClick={() => setPreviewImage(client.productImageUrl!)}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity shrink-0 mt-0.5"
                          />
                        )}
                        <div>
                          <div className="text-[15px] text-[#1d1d1f] font-medium flex items-center">
                            {client.model}
                            {client.productImageUrl && (
                              <button
                                onClick={() => setPreviewImage(client.productImageUrl!)}
                                className="ml-2 text-[#0071e3] hover:text-[#0077ED] inline-flex items-center text-xs font-normal"
                              >
                                <Camera className="w-3.5 h-3.5 mr-0.5" />
                                사진보기
                              </button>
                            )}
                          </div>
                          <div className="text-[13px] text-[#86868b] mt-0.5 truncate max-w-xs">{client.asDetails}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium bg-[#f5f5f7] text-[#1d1d1f]">
                        {client.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-[15px] text-[#86868b]">
                      <div className="flex flex-col">
                        <span>{formatCurrency(client.price)}</span>
                        {client.quotationUrl && (
                          <a 
                            href={client.quotationUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#0071e3] hover:underline mt-1"
                          >
                            견적서 보기
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(client)}
                        className="text-[#86868b] hover:text-[#0071e3] mr-4 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="text-[#86868b] hover:text-[#ff3b30] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingClient}
      />

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl bg-white p-2">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white hover:bg-black/70 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage}
              alt="압력솥 사진 확대보기"
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
