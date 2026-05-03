import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useApp } from '../context/AppContext';
import { STATUSES, ASStatus } from '../types';
import { cn } from '../lib/utils';
import { Clock, Phone } from 'lucide-react';

export function ASBoard() {
  const { clients, updateClientStatus } = useApp();

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
                        {columnClients.map((client, index) => (
                          // @ts-ignore
                          <Draggable key={client.id} draggableId={client.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  'bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-2 select-none',
                                  snapshot.isDragging && 'shadow-md border-gray-300 ring-1 ring-gray-200'
                                )}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="text-sm font-medium text-gray-900">{client.name}</h4>
                                  <span className="text-xs text-gray-500">{client.model}</span>
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                                  {client.asDetails}
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <div className="flex items-center">
                                    <Phone className="w-3 h-3 mr-1" />
                                    {client.contact.slice(-4)}
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {new Date(client.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                  </div>
                                </div>
                                {client.quotationUrl && (
                                  <div className="mt-3 pt-2 border-t border-gray-100">
                                    <a 
                                      href={client.quotationUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-[10px] font-medium text-[#0071e3] hover:underline flex items-center"
                                    >
                                      <span className="w-1.5 h-1.5 bg-[#0071e3] rounded-full mr-1.5"></span>
                                      견적서 확인
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
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
    </div>
  );
}
