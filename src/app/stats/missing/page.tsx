'use client';

import { useState, useMemo } from 'react';
import { mockDraws } from '@/lib/mock/fc3d-draws';
import { calculatePositionMissing, calculateTrendStats } from '@/utils/trend-calc';
import { getPositionLabel } from '@/utils/fc3d-calc';

interface MissingRow {
  position: number;
  positionLabel: string;
  digit: number;
  currentMissing: number;
  maxMissing: number;
  avgMissing: number;
  count30: number;
  count50: number;
  count100: number;
}

export default function MissingStatsPage() {
  const [sortField, setSortField] = useState<keyof MissingRow>('currentMissing');
  const [sortAsc, setSortAsc] = useState(false);

  const rows = useMemo(() => {
    const result: MissingRow[] = [];
    for (let pos = 1; pos <= 3; pos++) {
      const p = pos as 1 | 2 | 3;
      const data30 = calculatePositionMissing(mockDraws.slice(0, 30), p);
      const data50 = calculatePositionMissing(mockDraws.slice(0, 50), p);
      const data100 = calculatePositionMissing(mockDraws.slice(0, 100), p);
      const stats30 = calculateTrendStats(data30);
      const stats50 = calculateTrendStats(data50);
      const stats100 = calculateTrendStats(data100);

      for (let d = 0; d <= 9; d++) {
        const currentMissing = data100[0]?.[d]?.isHit ? 0 : (data100[0]?.[d]?.missingCount ?? 0);
        result.push({
          position: pos,
          positionLabel: getPositionLabel(pos),
          digit: d,
          currentMissing,
          maxMissing: stats100[2]?.values[d] ?? 0,
          avgMissing: stats100[1]?.values[d] ?? 0,
          count30: stats30[0]?.values[d] ?? 0,
          count50: stats50[0]?.values[d] ?? 0,
          count100: stats100[0]?.values[d] ?? 0,
        });
      }
    }
    return result;
  }, []);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const av = a[sortField] as number;
      const bv = b[sortField] as number;
      return sortAsc ? av - bv : bv - av;
    });
  }, [rows, sortField, sortAsc]);

  const handleSort = (field: keyof MissingRow) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const SortHeader = ({ field, label }: { field: keyof MissingRow; label: string }) => (
    <th
      className="px-3 py-2 text-left text-xs font-semibold text-gray-500 cursor-pointer hover:bg-white/5 select-none"
      onClick={() => handleSort(field)}
    >
      {label}
      {sortField === field && (
        <span className="ml-1">{sortAsc ? '\u2191' : '\u2193'}</span>
      )}
    </th>
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white">遗漏统计</h2>
      <p className="text-xs text-gray-500">点击表头可排序，查看各位置各数字的遗漏情况</p>

      <div className="bg-[#13161b] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-white/5 border-b border-white/5">
              <tr>
                <SortHeader field="position" label="位置" />
                <SortHeader field="digit" label="数字" />
                <SortHeader field="currentMissing" label="当前遗漏" />
                <SortHeader field="maxMissing" label="最大遗漏" />
                <SortHeader field="avgMissing" label="平均遗漏" />
                <SortHeader field="count30" label="近30期" />
                <SortHeader field="count50" label="近50期" />
                <SortHeader field="count100" label="近100期" />
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr
                  key={`${row.position}-${row.digit}`}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="px-3 py-2 font-medium text-gray-300">{row.positionLabel}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#7434f3] text-white text-[11px] font-bold">
                      {row.digit}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-300">
                    <span className={row.currentMissing >= 15 ? 'text-[#e74c3c] font-bold' : row.currentMissing >= 10 ? 'text-[#e67e22] font-semibold' : ''}>
                      {row.currentMissing}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-400">{row.maxMissing}</td>
                  <td className="px-3 py-2 text-gray-400">{row.avgMissing}</td>
                  <td className="px-3 py-2 text-gray-400">{row.count30}</td>
                  <td className="px-3 py-2 text-gray-400">{row.count50}</td>
                  <td className="px-3 py-2 text-gray-400">{row.count100}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
