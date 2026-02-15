'use client';

import { useState, useMemo } from 'react';
import { mockDraws } from '@/lib/mock/fc3d-draws';
import { calculateSumMissing } from '@/utils/trend-calc';
import TrendTable from '@/components/trend/TrendTable';
import PeriodSelector from '@/components/trend/PeriodSelector';

export default function SumTrendPage() {
  const [periodCount, setPeriodCount] = useState(30);
  const draws = useMemo(() => mockDraws.slice(0, periodCount), [periodCount]);
  const periods = useMemo(() => draws.map(d => d.period), [draws]);

  const cellData = useMemo(() => calculateSumMissing(draws), [draws]);
  const columnLabels = Array.from({ length: 28 }, (_, i) => String(i));

  const extraColumns = [
    { label: '号码', values: draws.map(d => `${d.digit1}${d.digit2}${d.digit3}`) },
    { label: '和值', values: draws.map(d => d.sum) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1d1d1f]">和值分布图</h2>
        <PeriodSelector value={periodCount} onChange={setPeriodCount} />
      </div>
      <div className="text-xs text-[#6e6e73]">和值 = 百位 + 十位 + 个位，范围 0-27</div>
      <TrendTable
        periods={periods}
        cellData={cellData}
        columnLabels={columnLabels}
        extraColumns={extraColumns}
        title="和值分布"
        showStats={true}
      />
    </div>
  );
}
