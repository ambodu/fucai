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
    <div className="min-h-screen pb-[70px] lg:pb-0">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-[#13161b] to-[#0b0e11] border-b border-white/5 px-4 pt-5 pb-6 lg:py-10">
        <div className="max-w-[1200px] mx-auto lg:px-6">
          <h1 className="text-white text-lg lg:text-2xl font-bold mb-1">数据中心</h1>
          <p className="text-gray-500 text-xs lg:text-sm">
            福彩3D 历史开奖数据查询 · 共 {mockDraws.length} 期
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Group filter */}
          <div className="flex gap-1.5">
            {GROUP_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => { setGroupFilter(f.value); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                  groupFilter === f.value
                    ? 'bg-[#7434f3] text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
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
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#13161b] text-sm outline-none focus:border-[#7434f3]/50 text-gray-200 placeholder:text-gray-600 w-[140px] lg:w-[200px]"
            />
          </div>
        </div>

        {/* Result count */}
        <div className="text-xs text-gray-500 mt-2">
          共 {filtered.length} 条记录
          {groupFilter !== 'all' && `（${GROUP_FILTERS.find(f => f.value === groupFilter)?.label}）`}
        </div>
      </div>

      {/* Data Table */}
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6 pb-4">
        <DrawHistory draws={paged} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="max-w-[1200px] mx-auto px-4 lg:px-6 pb-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg text-sm border border-white/10 text-gray-400 disabled:opacity-30 hover:bg-white/5 transition-colors"
          >
            上一页
          </button>
          <span className="text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg text-sm border border-white/10 text-gray-400 disabled:opacity-30 hover:bg-white/5 transition-colors"
          >
            下一页
          </button>
        </div>
      )}

      {/* Statistics summary */}
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6 pb-6">
        <div className="bg-[#13161b] border border-white/5 rounded-2xl p-4 lg:p-6">
          <h3 className="text-sm font-bold mb-3 text-white">数据概览</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: '总期数', value: mockDraws.length, unit: '期' },
              { label: '豹子次数', value: mockDraws.filter(d => d.isTriplet).length, unit: '次' },
              { label: '对子次数', value: mockDraws.filter(d => d.group === 'pair').length, unit: '次' },
              { label: '组六次数', value: mockDraws.filter(d => d.group === 'six').length, unit: '次' },
            ].map(item => (
              <div key={item.label} className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-[11px] text-gray-500 mb-1">{item.label}</div>
                <div className="text-lg font-bold text-[#7434f3]">
                  {item.value}
                  <span className="text-xs text-gray-500 font-normal ml-0.5">{item.unit}</span>
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
