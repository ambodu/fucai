'use client';

import { useState, useMemo } from 'react';
import { mockDraws } from '@/lib/mock/fc3d-draws';
import { calculatePatternMissing } from '@/utils/trend-calc';
import { PRIME_COMPOSITE_PATTERNS } from '@/utils/fc3d-calc';
import TrendTable from '@/components/trend/TrendTable';
import PeriodSelector from '@/components/trend/PeriodSelector';

export default function PrimeCompositePatternPage() {
  const [periodCount, setPeriodCount] = useState(30);
  const draws = useMemo(() => mockDraws.slice(0, periodCount), [periodCount]);
  const periods = useMemo(() => draws.map(d => d.period), [draws]);

  const cellData = useMemo(
    () => calculatePatternMissing(draws, [...PRIME_COMPOSITE_PATTERNS], d => d.primeCompositePattern),
    [draws]
  );

  const columnLabels = [...PRIME_COMPOSITE_PATTERNS];

  const extraColumns = [
    { label: '号码', values: draws.map(d => `${d.digit1}${d.digit2}${d.digit3}`) },
    { label: '形态', values: draws.map(d => d.primeCompositePattern) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1d1d1f]">质合形态走势</h2>
        <PeriodSelector value={periodCount} onChange={setPeriodCount} />
      </div>
      <div className="text-xs text-[#8e8e93]">规则：1,2,3,5,7为质数，0,4,6,8,9为合数</div>
      <TrendTable
        periods={periods}
        cellData={cellData}
        columnLabels={columnLabels}
        extraColumns={extraColumns}
        title="质合形态"
        showStats={true}
      />
    </div>
  );
}
