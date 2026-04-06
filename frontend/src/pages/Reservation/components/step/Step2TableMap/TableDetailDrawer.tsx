import React from 'react';
import type { TableLayout } from '@/types/layout';
import { X, Users, BadgeDollarSign, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TableDetailDrawerProps {
  table: TableLayout | null;
  onClose: () => void;
  onSelect: (table: TableLayout) => void;
  isSelected: boolean;
}

const TableDetailDrawer: React.FC<TableDetailDrawerProps> = ({ 
  table, 
  onClose, 
  onSelect,
  isSelected
}) => {
  if (!table) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 z-[100] ${
          table ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] transform transition-transform duration-500 ease-out border-l border-gray-100 ${
          table ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full bg-background">
          {/* Header */}
          <div className="relative h-72 w-full overflow-hidden bg-gray-100 shadow-inner">
            {table.imageUrl ? (
              <img 
                src={table.imageUrl} 
                alt={table.name} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-400 bg-linear-to-br from-gray-50 to-gray-100 flex-col gap-3">
                <div className="w-20 h-20 rounded-3xl bg-white shadow-soft flex items-center justify-center text-orange-500">
                   <Info size={40} />
                </div>
                <span className="text-sm font-bold tracking-tight text-gray-500 uppercase">Hình ảnh bàn đang cập nhật</span>
              </div>
            )}
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2.5 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-all duration-200 z-10 hover:rotate-90"
            >
              <X size={20} />
            </button>

            <div className="absolute bottom-0 left-0 right-0 p-8 bg-linear-to-t from-black/90 via-black/40 to-transparent">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-orange-500 text-[10px] font-black text-white rounded-sm uppercase tracking-widest">
                  {table.areaName || 'Khu vực chung'}
                </span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tighter drop-shadow-sm">{table.name}</h2>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-5">
              <div className="group bg-white p-5 rounded-2xl border-2 border-orange-100 flex flex-col gap-1.5 transition-all hover:border-orange-500 hover:bg-orange-50/30">
                <div className="flex items-center gap-2 text-orange-600 font-bold text-sm">
                  <Users size={16} />
                  <span>Sức chứa</span>
                </div>
                <p className="text-3xl font-black text-gray-900 leading-none">
                  {table.capacity} <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">khách</span>
                </p>
              </div>
              <div className="group bg-white p-5 rounded-2xl border-2 border-amber-100 flex flex-col gap-1.5 transition-all hover:border-amber-500 hover:bg-amber-50/30">
                 <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                  <BadgeDollarSign size={16} />
                  <span>Tiền cọc</span>
                </div>
                <p className="text-3xl font-black text-gray-900 leading-none">
                  {table.deposit?.toLocaleString()} <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">đ</span>
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1.5 rounded-full bg-orange-500"></div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight italic">Thông tin từ nhà hàng</h3>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <p className="text-gray-600 leading-relaxed text-base font-medium relative z-10">
                  {table.description || `Đây là một lựa chọn tuyệt vời tại khu vực ${table.areaName || 'Sảnh chính'}. Không gian được thiết kế tỉ mỉ để mang lại sự thoải mái nhất cho quý khách.`}
                </p>
                <div className="mt-4 flex items-center gap-2 text-orange-500/50">
                   <Info size={14} />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Dữ liệu hệ thống</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm">
            <Button 
               className={`w-full h-16 text-lg font-black rounded-xl transition-all relative overflow-hidden group ${
                 isSelected 
                 ? 'bg-red-500 hover:bg-red-600 text-white shadow-[4px_4px_0px_0px_rgba(153,27,27,1)] active:translate-y-1 active:shadow-none' 
                 : 'bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-[4px_4px_0px_0px_rgba(124,45,18,1)] active:translate-y-1 active:shadow-none'
               }`}
               onClick={() => {
                 onSelect(table);
                 onClose();
               }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-widest">
                {isSelected ? 'Bỏ chọn bàn này' : 'Xác nhận chọn bàn ngay'}
              </span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-20deg]"></div>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TableDetailDrawer;
