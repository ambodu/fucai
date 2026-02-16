'use client';

import { useState, useMemo } from 'react';
import { mockDraws } from '@/lib/mock/fc3d-draws';
import { calculatePatternMissing } from '@/utils/trend-calc';
import { BIG_SMALL_PATTERNS } from '@/utils/fc3d-calc';
import TrendTable from '@/components/trend/TrendTable';
import PeriodSelector from '@/components/trend/PeriodSelector';

export default function BigSmallPatternPage() {
  const [periodCount, setPeriodCount] = useState(30);
  const draws = useMemo(() => mockDraws.slice(0, periodCount), [periodCount]);
  const periods = useMemo(() => draws.map(d => d.period), [draws]);

  const cellData = useMemo(
    () => calculatePatternMissing(draws, [...BIG_SMALL_PATTERNS], d => d.bigSmallPattern),
    [draws]
  );

  const columnLabels = [...BIG_SMALL_PATTERNS];

  const extraColumns = [
    { label: '号码', values: draws.map(d => `${d.digit1}${d.digit2}${d.digit3}`) },
    { label: '形态', values: draws.map(d => d.bigSmallPattern) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1d1d1f]">大小形态走势</h2>
        <PeriodSelector value={periodCount} onChange={setPeriodCount} />
      </div>
      <div className="text-xs text-[#8e8e93]">规则：0-4为小，5-9为大</div>
      <TrendTable
        periods={periods}
        cellData={cellData}
        columnLabels={columnLabels}
        extraColumns={extraColumns}
        title="大小形态"
        showStats={true}
      />
    </div>
  );
}
