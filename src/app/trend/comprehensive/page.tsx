'use client';

import { useState, useMemo } from 'react';
import { mockDraws } from '@/lib/mock/fc3d-draws';
import { calculatePositionMissing } from '@/utils/trend-calc';
import TrendTable, { ColumnGroup } from '@/components/trend/TrendTable';
import PeriodSelector from '@/components/trend/PeriodSelector';

export default function ComprehensivePage() {
  const [periodCount, setPeriodCount] = useState(30);
  const draws = useMemo(() => mockDraws.slice(0, periodCount), [periodCount]);
  const periods = useMemo(() => draws.map(d => d.period), [draws]);

  const pos1Data = useMemo(() => calculatePositionMissing(draws, 1), [draws]);
  const pos2Data = useMemo(() => calculatePositionMissing(draws, 2), [draws]);
  const pos3Data = useMemo(() => calculatePositionMissing(draws, 3), [draws]);

  const cellData = useMemo(() => {
    return draws.map((_, rowIdx) => [
      ...pos1Data[rowIdx],
      ...pos2Data[rowIdx],
      ...pos3Data[rowIdx],
    ]);
  }, [draws, pos1Data, pos2Data, pos3Data]);

  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const columnLabels = [...digits, ...digits, ...digits];

  const columnGroups: ColumnGroup[] = [
    { label: '百位', color: '#007AFF', columns: digits },
    { label: '十位', color: '#AF52DE', columns: digits },
    { label: '个位', color: '#34C759', columns: digits },
  ];

  const extraColumns = [
    { label: '和值', values: draws.map(d => d.sum) },
    { label: '跨度', values: draws.map(d => d.span) },
    { label: '大小', values: draws.map(d => d.bigSmallPattern) },
    { label: '奇偶', values: draws.map(d => d.oddEvenPattern) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#E13C39]">综合分布图</h2>
        <PeriodSelector value={periodCount} onChange={setPeriodCount} />
      </div>
      <TrendTable
        periods={periods}
        cellData={cellData}
        columnLabels={columnLabels}
        columnGroups={columnGroups}
        extraColumns={extraColumns}
        showStats={true}
      />
    </div>
  );
}
