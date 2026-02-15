'use client';

import { useState, useMemo } from 'react';
import { mockDraws } from '@/lib/mock/fc3d-draws';
import { calculatePatternMissing } from '@/utils/trend-calc';
import { ODD_EVEN_PATTERNS } from '@/utils/fc3d-calc';
import TrendTable from '@/components/trend/TrendTable';
import PeriodSelector from '@/components/trend/PeriodSelector';

export default function OddEvenPatternPage() {
  const [periodCount, setPeriodCount] = useState(30);
  const draws = useMemo(() => mockDraws.slice(0, periodCount), [periodCount]);
  const periods = useMemo(() => draws.map(d => d.period), [draws]);

  const cellData = useMemo(
    () => calculatePatternMissing(draws, [...ODD_EVEN_PATTERNS], d => d.oddEvenPattern),
    [draws]
  );

  const columnLabels = [...ODD_EVEN_PATTERNS];

  const extraColumns = [
    { label: '号码', values: draws.map(d => `${d.digit1}${d.digit2}${d.digit3}`) },
    { label: '形态', values: draws.map(d => d.oddEvenPattern) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">奇偶形态走势</h2>
        <PeriodSelector value={periodCount} onChange={setPeriodCount} />
      </div>
      <div className="text-xs text-gray-500">规则：1,3,5,7,9为奇，0,2,4,6,8为偶</div>
      <TrendTable
        periods={periods}
        cellData={cellData}
        columnLabels={columnLabels}
        extraColumns={extraColumns}
        title="奇偶形态"
        showStats={true}
      />
    </div>
  );
}
