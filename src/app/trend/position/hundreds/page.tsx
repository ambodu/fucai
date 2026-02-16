'use client';

import { useState, useMemo } from 'react';
import { mockDraws } from '@/lib/mock/fc3d-draws';
import { calculatePositionMissing } from '@/utils/trend-calc';
import TrendTable from '@/components/trend/TrendTable';
import PeriodSelector from '@/components/trend/PeriodSelector';

export default function HundredsPage() {
  const [periodCount, setPeriodCount] = useState(30);
  const draws = useMemo(() => mockDraws.slice(0, periodCount), [periodCount]);
  const periods = useMemo(() => draws.map(d => d.period), [draws]);

  const cellData = useMemo(() => calculatePositionMissing(draws, 1), [draws]);
  const columnLabels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const extraColumns = [
    { label: '号码', values: draws.map(d => `${d.digit1}${d.digit2}${d.digit3}`) },
    { label: '和值', values: draws.map(d => d.sum) },
    { label: '跨度', values: draws.map(d => d.span) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#E13C39]">百位走势图</h2>
        <PeriodSelector value={periodCount} onChange={setPeriodCount} />
      </div>
      <TrendTable
        periods={periods}
        cellData={cellData}
        columnLabels={columnLabels}
        extraColumns={extraColumns}
        title="百位走势"
        showStats={true}
      />
    </div>
  );
}
