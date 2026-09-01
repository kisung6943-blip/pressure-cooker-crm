import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ClientFormModal } from '../components/ClientFormModal';
import { Client } from '../types';
import { Plus, Edit2, Trash2, Search, Camera, FileText, X, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export function ClientManagement() {
  const { clients, addClient, updateClient, deleteClient } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Gallery Lightbox State
  const [gallery, setGallery] = useState<{ images: string[]; title: string; index: number } | null>(null);

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

  const openGallery = (images: string[], title: string, initialIdx = 0) => {
    if (images.length === 0) return;
    setGallery({ images, title, index: initialIdx });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">고객 관리</h2>
          <p className="text-[15px] text-[#86868b] mt-2">고객 정보, 압력솥 사진(다중) 및 송장 내역을 관리합니다.</p>
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
                <th scope="col" className="px-8 py-4 text-left text-[13px] font-medium text-[#86868b] uppercase tracking-wider">비용/송장 이미지</th>
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
                filteredClients.map((client) => {
                  const productImages = client.productImageUrls && client.productImageUrls.length > 0 
                    ? client.productImageUrls 
                    : (client.productImageUrl ? [client.productImageUrl] : []);

                  return (
                    <tr key={client.id} className="hover:bg-[#f5f5f7]/50 transition-colors">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-[15px] font-semibold text-[#1d1d1f]">{client.name}</div>
                        <div className="text-[13px] text-[#86868b] mt-0.5">{client.contact}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-start space-x-3.5">
                          {productImages.length > 0 ? (
                            <div 
                              className="relative group cursor-pointer shrink-0"
                              onClick={() => openGallery(productImages, `${client.name} 님의 압력솥 사진`)}
                            >
                              <img
                                src={productImages[0]}
                                alt="압력솥 대표 사진"
                                className="w-20 h-20 object-cover rounded-xl border border-gray-200 group-hover:scale-105 transition-all shadow-xs"
                              />
                              {productImages.length > 1 && (
                                <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                                  +{productImages.length}장
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-xl border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400 shrink-0">
                              <Camera className="w-6 h-6 mb-1" />
                              <span className="text-[10px]">사진없음</span>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="text-[15px] text-[#1d1d1f] font-semibold flex items-center flex-wrap gap-1.5">
                              <span>{client.model}</span>
                              {productImages.length > 0 && (
                                <button
                                  onClick={() => openGallery(productImages, `${client.name} 님의 압력솥 사진`)}
                                  className="text-[#0071e3] hover:text-[#0077ED] inline-flex items-center text-xs font-medium bg-blue-50 px-2 py-0.5 rounded-md transition-colors"
                                >
                                  <Camera className="w-3.5 h-3.5 mr-1" />
                                  사진보기 ({productImages.length}장)
                                </button>
                              )}
                            </div>
                            <div className="text-[13px] text-[#86868b] mt-1 line-clamp-2 max-w-sm">{client.asDetails}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-[#f5f5f7] text-[#1d1d1f]">
                          {client.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-[15px] text-[#86868b]">
                        <div className="flex flex-col space-y-1">
                          <span className="font-semibold text-gray-900">{formatCurrency(client.price)}</span>
                          {client.trackingNumber && (
                            <span className="text-[12px] text-gray-500 font-mono">송장: {client.trackingNumber}</span>
                          )}
                          <div className="flex flex-wrap gap-2 mt-1">
                            {client.trackingImageUrl && (
                              <button
                                onClick={() => openGallery([client.trackingImageUrl!], `${client.name} 님의 택배 송장 사진 (전체 내용)`)}
                                className="text-[12px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md hover:bg-blue-100 transition-colors inline-flex items-center"
                              >
                                <ImageIcon className="w-3.5 h-3.5 mr-1 text-blue-600" />
                                송장 전체보기
                              </button>
                            )}
                            {client.quotationUrl && (
                              <a 
                                href={client.quotationUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[12px] text-[#0071e3] bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md hover:bg-gray-100 transition-colors inline-flex items-center"
                              >
                                <FileText className="w-3.5 h-3.5 mr-1" />
                                견적서
                              </a>
                            )}
                          </div>
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
                  );
                })
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

      {/* Gallery Lightbox with Navigation for Multiple Photos */}
      {gallery && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4"
          onClick={() => setGallery(null)}
        >
          <div 
            className="relative max-w-5xl max-h-[92vh] w-full overflow-hidden rounded-2xl shadow-2xl bg-white p-4 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between px-2 py-2 border-b border-gray-100 mb-3">
              <span className="text-base font-bold text-gray-900 flex items-center">
                {gallery.title}
                {gallery.images.length > 1 && (
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    ({gallery.index + 1} / {gallery.images.length})
                  </span>
                )}
              </span>
              <button
                onClick={() => setGallery(null)}
                className="p-1 text-gray-500 hover:text-gray-900 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative w-full flex-1 flex items-center justify-center min-h-[350px] max-h-[78vh] bg-black/5 rounded-xl overflow-hidden p-2">
              <img
                src={gallery.images[gallery.index]}
                alt="확대보기 사진"
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-sm"
              />

              {gallery.images.length > 1 && (
                <>
                  <button
                    onClick={() => setGallery({ ...gallery, index: (gallery.index - 1 + gallery.images.length) % gallery.images.length })}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all shadow-md"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setGallery({ ...gallery, index: (gallery.index + 1) % gallery.images.length })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all shadow-md"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {gallery.images.length > 1 && (
              <div className="flex space-x-2 mt-3 overflow-x-auto max-w-full py-1">
                {gallery.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`썸네일 ${idx + 1}`}
                    onClick={() => setGallery({ ...gallery, index: idx })}
                    className={`w-14 h-14 object-cover rounded-lg border-2 cursor-pointer transition-all ${
                      idx === gallery.index ? 'border-[#0071e3] scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
