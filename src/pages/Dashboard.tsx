import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../lib/utils';
import { isSameMonth, parseISO } from 'date-fns';
import { Wrench, TrendingUp, CheckCircle2, Clock, Download, Upload } from 'lucide-react';

export function Dashboard() {
  const { clients, exportData, importData } = useApp();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const success = await importData(file);
      if (success) {
        alert('데이터를 성공적으로 불러왔습니다.');
      } else {
        alert('데이터 불러오기에 실패했습니다. 올바른 형식의 JSON 파일인지 확인해주세요.');
      }
    }
  };

  const ongoingCount = clients.filter((c) => c.status !== '출고').length;
  const completedCount = clients.filter((c) => c.status === '출고').length;
  
  const currentMonthRevenue = clients
    .filter((c) => {
      const isCompletedOrPaid = c.status === '결제확인' || c.status === '출고';
      const isThisMonth = isSameMonth(parseISO(c.updatedAt), new Date());
      return isCompletedOrPaid && isThisMonth;
    })
    .reduce((sum, c) => sum + (Number(c.price) || 0), 0);

  const recentClients = [...clients]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">대시보드</h2>
            <p className="text-[15px] text-[#86868b] mt-2">현재 AS 진행 상황과 매출을 확인하세요.</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportData}
              className="flex items-center px-4 py-2 bg-white text-[#1d1d1f] border border-gray-200 rounded-2xl text-[14px] font-medium hover:bg-[#f5f5f7] transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              데이터 내보내기
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center px-4 py-2 bg-white text-[#1d1d1f] border border-gray-200 rounded-2xl text-[14px] font-medium hover:bg-[#f5f5f7] transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              데이터 불러오기
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border-0 flex items-center space-x-5">
          <div className="p-3.5 bg-[#f5f5f7] text-[#0071e3] rounded-2xl">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#86868b] uppercase tracking-wider">진행중인 AS</p>
            <p className="text-2xl font-semibold text-[#1d1d1f] mt-1">{ongoingCount}건</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border-0 flex items-center space-x-5">
          <div className="p-3.5 bg-[#f5f5f7] text-[#34c759] rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#86868b] uppercase tracking-wider">이번 달 매출</p>
            <p className="text-2xl font-semibold text-[#1d1d1f] mt-1">{formatCurrency(currentMonthRevenue)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border-0 flex items-center space-x-5">
          <div className="p-3.5 bg-[#f5f5f7] text-[#1d1d1f] rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#86868b] uppercase tracking-wider">누적 완료 건수</p>
            <p className="text-2xl font-semibold text-[#1d1d1f] mt-1">{completedCount}건</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border-0 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-[#1d1d1f]">최근 업데이트된 AS</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {recentClients.length === 0 ? (
            <div className="p-8 text-center text-[#86868b] text-[15px]">최근 내역이 없습니다.</div>
          ) : (
            recentClients.map((client) => (
              <div key={client.id} className="px-8 py-5 flex items-center justify-between hover:bg-[#f5f5f7]/50 transition-colors">
                <div className="flex items-center space-x-5">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f] font-semibold text-lg">
                      {client.name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[#1d1d1f]">{client.name}</p>
                    <p className="text-[13px] text-[#86868b] mt-0.5">{client.model}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium bg-[#f5f5f7] text-[#1d1d1f]">
                    {client.status}
                  </span>
                  <div className="text-[13px] text-[#86868b] flex items-center">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {new Date(client.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
