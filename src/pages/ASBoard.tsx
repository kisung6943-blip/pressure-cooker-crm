import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useApp } from '../context/AppContext';
import { STATUSES, ASStatus } from '../types';
import { cn } from '../lib/utils';
import { Clock, Phone, Camera, X, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export function ASBoard() {
  const { clients, updateClientStatus } = useApp();
  const [gallery, setGallery] = useState<{ images: string[]; title: string; index: number } | null>(null);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as ASStatus;
    updateClientStatus(draggableId, newStatus);
  };

  const openGallery = (images: string[], title: string, initialIdx = 0) => {
    if (images.length === 0) return;
    setGallery({ images, title, index: initialIdx });
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">AS 현황판</h2>
        <p className="text-sm text-gray-500 mt-1">드래그 앤 드롭으로 AS 진행 상태를 변경하세요.</p>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex space-x-4 h-full items-start min-w-max">
            {STATUSES.map((status) => {
              const columnClients = clients.filter((c) => c.status === status);
              return (
                <div key={status} className="w-72 flex flex-col h-full max-h-full">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-sm font-medium text-gray-700">{status}</h3>
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">
                      {columnClients.length}
                    </span>
                  </div>

                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          'flex-1 bg-gray-100/50 rounded-xl p-2 overflow-y-auto min-h-[150px] border border-transparent transition-colors',
                          snapshot.isDraggingOver && 'bg-gray-100 border-gray-300'
                        )}
                      >
                        {columnClients.map((client, index) => {
                          const productImages = client.productImageUrls && client.productImageUrls.length > 0 
                            ? client.productImageUrls 
                            : (client.productImageUrl ? [client.productImageUrl] : []);

                          return (
                            // @ts-ignore
                            <Draggable key={client.id} draggableId={client.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={cn(
                                    'bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-3 select-none',
                                    snapshot.isDragging && 'shadow-md border-gray-300 ring-1 ring-gray-200'
                                  )}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-sm font-semibold text-gray-900">{client.name}</h4>
                                    <span className="text-xs text-gray-500 font-medium">{client.model}</span>
                                  </div>
                                  
                                  {productImages.length > 0 && (
                                    <div className="mb-2 relative rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                                      <img
                                        src={productImages[0]}
                                        alt="압력솥 대표 사진"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openGallery(productImages, `${client.name} 님의 압력솥 사진`);
                                        }}
                                        className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity rounded-lg"
                                      />
                                      {productImages.length > 1 && (
                                        <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                          +{productImages.length}장
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                                    {client.asDetails}
                                  </p>
                                  
                                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                                    <div className="flex items-center">
                                      <Phone className="w-3 h-3 mr-1" />
                                      {client.contact.slice(-4)}
                                    </div>
                                    <div className="flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {new Date(client.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </div>
                                  </div>

                                  {(client.trackingImageUrl || client.quotationUrl) && (
                                    <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap gap-2">
                                      {client.trackingImageUrl && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openGallery([client.trackingImageUrl!], `${client.name} 님의 택배 송장 사진 (전체 내용)`);
                                          }}
                                          className="text-[10px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded flex items-center transition-colors"
                                        >
                                          <ImageIcon className="w-3 h-3 mr-1 text-blue-600" />
                                          송장사진
                                        </button>
                                      )}
                                      {client.quotationUrl && (
                                        <a 
                                          href={client.quotationUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-[10px] font-medium text-[#0071e3] bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2 py-0.5 rounded flex items-center transition-colors"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          견적서
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Gallery Lightbox with Navigation */}
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
