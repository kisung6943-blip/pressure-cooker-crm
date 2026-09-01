import React, { useState, useEffect } from 'react';
import { Client, ASStatus, STATUSES } from '../types';
import { X, Camera, FileText } from 'lucide-react';

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
  });

  useEffect(() => {
    if (initialData) {
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
        productImageUrl: initialData.productImageUrl || '',
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
      });
    }
  }, [initialData, isOpen]);

  const compressImage = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
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
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          callback(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기가 너무 큽니다. 10MB 이하의 이미지를 올려주세요.');
        return;
      }
      compressImage(file, (base64) => {
        setFormData((prev) => ({ ...prev, productImageUrl: base64 }));
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">압력솥 사진 (선택)</label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <Camera className="w-4 h-4 mr-1.5 text-gray-500" />
                사진 선택
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProductImageChange}
                  className="hidden"
                />
              </label>
              {formData.productImageUrl ? (
                <div className="relative flex items-center space-x-2">
                  <img
                    src={formData.productImageUrl}
                    alt="압력솥 사진 미리보기"
                    className="w-12 h-12 object-cover rounded-md border border-gray-200 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, productImageUrl: '' })}
                    className="text-xs text-red-500 hover:text-red-700 underline"
                  >
                    삭제
                  </button>
                </div>
              ) : (
                <span className="text-xs text-gray-400">선택된 사진 없음</span>
              )}
            </div>
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
                  className="text-xs text-red-500 hover:text-red-700 underline"
                >
                  삭제
                </button>
              )}
            </div>
            {formData.quotationUrl && (
              <div className="mt-2 text-xs text-gray-500 truncate">
                <span className="font-medium text-green-600">✓ 파일이 업로드되었습니다.</span>
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
          <div className="pt-4 flex justify-end space-x-3 shrink-0">
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
    </div>
  );
}
