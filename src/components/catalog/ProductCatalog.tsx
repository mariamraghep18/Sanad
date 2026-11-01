import React, { useState } from 'react';
import { Package, Tag, Plus, CheckCircle2, Search } from 'lucide-react';
import { ProductCatalogItem } from '../../types/order';
import { Button } from '../common/Button';
import { orderStorage } from '../../services/orderStorage';

export const ProductCatalog: React.FC = () => {
  const [catalog, setCatalog] = useState<ProductCatalogItem[]>(orderStorage.getCatalog());
  const [search, setSearch] = useState('');

  const filtered = catalog.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0F172A]">كتالوج المنتجات (مساحة العمل)</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#6D5EF5]/10 text-[#6D5EF5]">
              {catalog.length} منتجات
            </span>
          </div>
          <p className="text-sm text-[#64748B] mt-1">
            الأصناف المقترحة في الذكاء الاصطناعي تأتي من هذا الكتالوج حصراً لضمان عدم اختراع منتجات أو أسعار وهمية.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في الكتالوج بالاسم، كود الصنف (SKU) أو التصنيف..."
            className="w-full pr-10 pl-4 py-2.5 text-sm bg-[#F7F8FA] border border-[#E2E8F0] rounded-[10px] min-h-[44px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/20 focus:border-[#6D5EF5]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(product => (
          <div key={product.id} className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-semibold text-[#6D5EF5] bg-[#EEF2FF] px-2 py-0.5 rounded">
                  {product.sku}
                </span>
                <h3 className="font-bold text-base text-[#0F172A] mt-1.5">{product.name}</h3>
                <span className="text-xs text-slate-500">{product.category}</span>
              </div>
              <span className="font-mono font-bold text-base text-slate-900">
                {(product.referencePriceCents / 100).toFixed(2)} ج.م
              </span>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <div className="flex items-center gap-1 text-slate-600">
                <span className="font-semibold text-slate-800">الألوان:</span>
                <span>{product.colors.join('، ')}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <span className="font-semibold text-slate-800">المقاسات:</span>
                <span className="font-mono">{product.sizes.join('، ')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
