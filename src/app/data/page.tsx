'use client';

import { useState, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import MobileTabBar from '@/components/layout/MobileTabBar';
import Footer from '@/components/layout/Footer';
import Disclaimer from '@/components/layout/Disclaimer';
import DrawHistory from '@/components/lottery/DrawHistory';
import { mockDraws } from '@/lib/mock/fc3d-draws';

const GROUP_FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'six', label: '组六' },
  { value: 'pair', label: '对子' },
  { value: 'triplet', label: '豹子' },
] as const;

const PAGE_SIZE = 20;

export default function DataPage() {
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [searchPeriod, setSearchPeriod] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = mockDraws;
    if (groupFilter !== 'all') {
      result = result.filter(d => d.group === groupFilter);
    }
    if (searchPeriod.trim()) {
      result = result.filter(d => d.period.includes(searchPeriod.trim()));
    }
    return result;
  }, [groupFilter, searchPeriod]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen pb-[52px] lg:pb-0 bg-white">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-[#e5e5ea] px-4 pt-6 pb-5 lg:py-8">
        <div className="max-w-[980px] mx-auto lg:px-6">
          <h1 className="text-[#1d1d1f] text-xl lg:text-2xl font-semibold mb-1">数据中心</h1>
          <p className="text-[#8e8e93] text-[13px] lg:text-[14px]">
            福彩3D 历史开奖数据查询 · 共 {mockDraws.length.toLocaleString()} 期
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-[980px] mx-auto px-4 lg:px-6 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Group filter */}
          <div className="flex gap-1.5 bg-[#f5f5f7] rounded-full p-1">
            {GROUP_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => { setGroupFilter(f.value); setPage(1); }}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all whitespace-nowrap ${
                  groupFilter === f.value
                    ? 'bg-[#1d1d1f] text-white shadow-sm'
                    : 'text-[#8e8e93] hover:text-[#1d1d1f]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Period search */}
          <div className="ml-auto">
            <input
              value={searchPeriod}
              onChange={e => { setSearchPeriod(e.target.value); setPage(1); }}
              placeholder="搜索期号..."
              className="px-4 py-2 rounded-xl bg-[#f5f5f7] text-[13px] outline-none focus:ring-2 focus:ring-[#007AFF]/20 text-[#1d1d1f] placeholder:text-[#8e8e93]/50 w-[130px] lg:w-[200px] transition-all"
            />
          </div>
        </div>

        {/* Result count */}
        <div className="text-[12px] text-[#8e8e93] mt-3">
          共 {filtered.length.toLocaleString()} 条记录
          {groupFilter !== 'all' && `（${GROUP_FILTERS.find(f => f.value === groupFilter)?.label}）`}
        </div>
      </div>

      {/* Data Table */}
      <div className="max-w-[980px] mx-auto px-4 lg:px-6 pb-4">
        <DrawHistory draws={paged} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="max-w-[980px] mx-auto px-4 lg:px-6 pb-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-5 py-2 rounded-full text-[13px] border border-[#e5e5ea] text-[#8e8e93] disabled:opacity-30 hover:bg-[#f5f5f7] transition-all"
          >
            上一页
          </button>
          <span className="text-[13px] text-[#8e8e93] px-3">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-5 py-2 rounded-full text-[13px] border border-[#e5e5ea] text-[#8e8e93] disabled:opacity-30 hover:bg-[#f5f5f7] transition-all"
          >
            下一页
          </button>
        </div>
      )}

      {/* Statistics summary */}
      <div className="max-w-[980px] mx-auto px-4 lg:px-6 pb-8">
        <div className="rounded-2xl shadow-card bg-white p-5 lg:p-6">
          <h3 className="text-[14px] font-semibold mb-4 text-[#1d1d1f]">数据概览</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: '总期数', value: mockDraws.length, unit: '期' },
              { label: '豹子次数', value: mockDraws.filter(d => d.isTriplet).length, unit: '次' },
              { label: '对子次数', value: mockDraws.filter(d => d.group === 'pair').length, unit: '次' },
              { label: '组六次数', value: mockDraws.filter(d => d.group === 'six').length, unit: '次' },
            ].map(item => (
              <div key={item.label} className="bg-[#f5f5f7] rounded-xl p-3.5 text-center">
                <div className="text-[11px] text-[#8e8e93] mb-1">{item.label}</div>
                <div className="text-xl font-semibold text-[#1d1d1f]">
                  {item.value.toLocaleString()}
                  <span className="text-[12px] text-[#8e8e93] font-normal ml-0.5">{item.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Disclaimer />
      <Footer />
      <MobileTabBar />
    </div>
  );
}
