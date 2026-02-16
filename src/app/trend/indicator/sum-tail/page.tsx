'use client';

import { useState, useMemo } from 'react';
import { mockDraws } from '@/lib/mock/fc3d-draws';
import { calculateSumTailMissing } from '@/utils/trend-calc';
import TrendTable from '@/components/trend/TrendTable';
import PeriodSelector from '@/components/trend/PeriodSelector';

export default function SumTailTrendPage() {
  const [periodCount, setPeriodCount] = useState(30);
  const draws = useMemo(() => mockDraws.slice(0, periodCount), [periodCount]);
  const periods = useMemo(() => draws.map(d => d.period), [draws]);

  const cellData = useMemo(() => calculateSumTailMissing(draws), [draws]);
  const columnLabels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const extraColumns = [
    { label: '号码', values: draws.map(d => `${d.digit1}${d.digit2}${d.digit3}`) },
    { label: '和值', values: draws.map(d => d.sum) },
    { label: '和尾', values: draws.map(d => d.sumTail) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#E13C39]">和值尾走势</h2>
        <PeriodSelector value={periodCount} onChange={setPeriodCount} />
      </div>
      <div className="text-xs text-[#8e8e93]">和值尾 = 和值的个位数</div>
      <TrendTable
        periods={periods}
        cellData={cellData}
        columnLabels={columnLabels}
        extraColumns={extraColumns}
        title="和值尾走势"
        showStats={true}
      />
    </div>
  );
}
