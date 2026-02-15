'use client';

import { useState, useMemo } from 'react';
import { mockDraws } from '@/lib/mock/fc3d-draws';
import { calculate012RoadMissing } from '@/utils/trend-calc';
import TrendTable, { ColumnGroup } from '@/components/trend/TrendTable';
import PeriodSelector from '@/components/trend/PeriodSelector';

export default function Road012Page() {
  const [periodCount, setPeriodCount] = useState(30);
  const draws = useMemo(() => mockDraws.slice(0, periodCount), [periodCount]);
  const periods = useMemo(() => draws.map(d => d.period), [draws]);

  const cellData = useMemo(() => calculate012RoadMissing(draws), [draws]);

  const roads = ['0路', '1路', '2路'];
  const columnLabels = [...roads, ...roads, ...roads];

  const columnGroups: ColumnGroup[] = [
    { label: '百位', color: '#7434f3', columns: roads },
    { label: '十位', color: '#00d4aa', columns: roads },
    { label: '个位', color: '#3498db', columns: roads },
  ];

  const extraColumns = [
    { label: '号码', values: draws.map(d => `${d.digit1}${d.digit2}${d.digit3}`) },
    { label: '012路', values: draws.map(d => d.road012.join('-')) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">012路走势</h2>
        <PeriodSelector value={periodCount} onChange={setPeriodCount} />
      </div>
      <div className="text-xs text-gray-500">规则：数字除以3的余数，0路(0,3,6,9)、1路(1,4,7)、2路(2,5,8)</div>
      <TrendTable
        periods={periods}
        cellData={cellData}
        columnLabels={columnLabels}
        columnGroups={columnGroups}
        extraColumns={extraColumns}
        title="012路走势"
        showStats={true}
      />
    </div>
  );
}
