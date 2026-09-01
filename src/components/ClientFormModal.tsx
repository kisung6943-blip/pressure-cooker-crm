import React, { useState, useEffect } from 'react';
import { Client, ASStatus, STATUSES } from '../types';
import { X, Camera, FileText, Upload, Image as ImageIcon, Trash2, Plus, Maximize2 } from 'lucide-react';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Client;
}

export function ClientFormModal({ isOpen, onClose, onSubmit, initialData }: ClientFormModalProps) {
  const [formData, setFormData] = useState<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    contact: '',
    address: '',
    model: '',
    asDetails: '',
    status: '수거접수',
    price: 0,
    trackingNumber: '',
    quotationUrl: '',
    productImageUrl: '',
    productImageUrls: [],
    trackingImageUrl: '',
  });

  const [modalLightbox, setModalLightbox] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    if (initialData) {
      const initialImages: string[] = [];
      if (initialData.productImageUrls && initialData.productImageUrls.length > 0) {
        initialImages.push(...initialData.productImageUrls);
      } else if (initialData.productImageUrl) {
        initialImages.push(initialData.productImageUrl);
      }

      setFormData({
        name: initialData.name,
        contact: initialData.contact,
        address: initialData.address,
        model: initialData.model,
        asDetails: initialData.asDetails,
        status: initialData.status,
        price: initialData.price,
        trackingNumber: initialData.trackingNumber || '',
        quotationUrl: initialData.quotationUrl || '',
        productImageUrl: initialImages[0] || '',
        productImageUrls: initialImages,
        trackingImageUrl: initialData.trackingImageUrl || '',
      });
    } else {
      setFormData({
        name: '',
        contact: '',
        address: '',
        model: '',
        asDetails: '',
        status: '수거접수',
        price: 0,
        trackingNumber: '',
        quotationUrl: '',
        productImageUrl: '',
        productImageUrls: [],
        trackingImageUrl: '',
      });
    }
  }, [initialData, isOpen]);

  const compressImage = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1400;
        const MAX_HEIGHT = 1400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          callback(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleMultipleProductImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    let processedCount = 0;
    const newImages: string[] = [];

    files.forEach((file) => {
      if (file.size > 15 * 1024 * 1024) {
        alert(`${file.name} 용량이 15MB를 초과합니다.`);
        processedCount++;
        return;
      }
      compressImage(file, (base64) => {
        newImages.push(base64);
        processedCount++;
        if (processedCount === files.length) {
          setFormData((prev) => {
            const updated = [...(prev.productImageUrls || []), ...newImages];
            return {
              ...prev,
              productImageUrls: updated,
              productImageUrl: updated[0] || '',
            };
          });
        }
      });
    });
  };

  const removeProductImage = (indexToRemove: number) => {
    setFormData((prev) => {
      const updated = (prev.productImageUrls || []).filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        productImageUrls: updated,
        productImageUrl: updated[0] || '',
      };
    });
  };

  const handleTrackingImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('파일 크기가 너무 큽니다. 15MB 이하의 이미지를 올려주세요.');
        return;
      }
      compressImage(file, (base64) => {
        setFormData((prev) => ({ ...prev, trackingImageUrl: base64 }));
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기가 너무 큽니다. 5MB 이하의 파일을 업로드해주세요.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, quotationUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const currentProductImages = formData.productImageUrls || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">
            {initialData ? '고객 정보 수정' : '새 고객 등록'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
            <input
              required
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder="010-0000-0000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
            <input
              required
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">압력솥 모델</label>
            <input
              required
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
            />
          </div>

          {/* 압력솥 사진 다중 업로드 (여러 장 가능) */}
          <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-800 flex items-center">
                <Camera className="w-4 h-4 mr-1.5 text-blue-600" />
                압력솥 사진 (여러 장 등록 가능)
              </label>
              <span className="text-xs text-gray-500 font-medium">{currentProductImages.length}장 등록됨</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mt-2">
              {currentProductImages.map((url, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-300 bg-white aspect-square flex items-center justify-center shadow-xs">
                  <img
                    src={url}
                    alt={`압력솥 사진 ${idx + 1}`}
                    onClick={() => setModalLightbox({ url, title: `압력솥 사진 ${idx + 1}` })}
                    className="w-full h-full object-cover rounded-md cursor-pointer hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setModalLightbox({ url, title: `압력솥 사진 ${idx + 1}` })}
                      className="p-1 bg-white/90 text-gray-800 rounded-full hover:bg-white transition-colors"
                      title="크게보기"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeProductImage(idx)}
                      className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              <label className="cursor-pointer border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-lg aspect-square flex flex-col items-center justify-center bg-white transition-colors">
                <Plus className="w-6 h-6 text-blue-600 mb-0.5" />
                <span className="text-[11px] font-semibold text-blue-900">사진 추가</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultipleProductImagesChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-[11px] text-gray-500 mt-2">여러 장의 사진을 한 번에 선택하거나 계속 추가할 수 있습니다.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">AS 내용</label>
            <textarea
              required
              rows={3}
              value={formData.asDetails}
              onChange={(e) => setFormData({ ...formData, asDetails: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">견적서 (이미지/PDF)</label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-800"
              />
              {formData.quotationUrl && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, quotationUrl: '' })}
                  className="text-xs text-red-500 hover:text-red-700 underline shrink-0"
                >
                  삭제
                </button>
              )}
            </div>
            {formData.quotationUrl && (
              <div className="mt-2 text-xs text-gray-500 truncate">
                <span className="font-medium text-green-600">✓ 견적서 파일이 첨부되었습니다.</span>
                <a 
                  href={formData.quotationUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-[#0071e3] hover:underline"
                >
                  미리보기
                </a>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ASStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">수리비용 (원)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
              />
            </div>
          </div>

          {/* 송장 이미지 업로드 (모든 글자와 내용이 100% 보이도록 조율) */}
          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-blue-950 flex items-center">
                <ImageIcon className="w-4 h-4 mr-1.5 text-blue-700" />
                송장 이미지 (택배 송장/영수증 전체 사진)
              </label>
              {formData.trackingImageUrl && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, trackingImageUrl: '' })}
                  className="text-xs text-red-600 hover:text-red-800 font-medium underline"
                >
                  사진 삭제
                </button>
              )}
            </div>

            {formData.trackingImageUrl ? (
              <div className="flex flex-col space-y-2">
                <div className="rounded-lg overflow-hidden border border-blue-300 bg-white p-2 flex items-center justify-center">
                  <img
                    src={formData.trackingImageUrl}
                    alt="송장 사진 전체보기"
                    className="w-full max-h-80 object-contain rounded-md cursor-pointer hover:opacity-95"
                    onClick={() => setModalLightbox({ url: formData.trackingImageUrl!, title: '택배 송장 사진 (전체 내용)' })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setModalLightbox({ url: formData.trackingImageUrl!, title: '택배 송장 사진 (전체 내용)' })}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs flex items-center justify-center transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5 mr-1" />
                  송장글씨 선명하게 전면 크게보기 (클릭)
                </button>
              </div>
            ) : (
              <label className="cursor-pointer border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-lg p-4 flex flex-col items-center justify-center bg-white transition-colors">
                <Upload className="w-6 h-6 text-blue-600 mb-1" />
                <span className="text-xs font-semibold text-blue-950">송장 이미지 첨부 (클릭)</span>
                <span className="text-[11px] text-blue-700 mt-0.5">글씨가 짤리지 않고 전체가 선명하게 보입니다</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleTrackingImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {formData.status === '출고' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">송장번호</label>
              <input
                type="text"
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
              />
            </div>
          )}

          <div className="pt-4 flex justify-end space-x-3 shrink-0 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              {initialData ? '수정하기' : '등록하기'}
            </button>
          </div>
        </form>
      </div>

      {/* Internal Modal Lightbox */}
      {modalLightbox && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4"
          onClick={() => setModalLightbox(null)}
        >
          <div className="relative max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl shadow-2xl bg-white p-3 flex flex-col items-center">
            <div className="w-full flex items-center justify-between px-3 py-2 border-b border-gray-100 mb-2">
              <span className="text-sm font-bold text-gray-800">{modalLightbox.title}</span>
              <button
                onClick={() => setModalLightbox(null)}
                className="p-1 text-gray-500 hover:text-gray-900 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <img
              src={modalLightbox.url}
              alt="선명한 원본 사진"
              className="max-w-full max-h-[82vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
