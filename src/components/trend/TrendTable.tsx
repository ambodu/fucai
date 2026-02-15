'use client';

import React, { useMemo, useRef, useState } from 'react';
import TrendCell from './TrendCell';
import TrendLines from './TrendLines';
import { TrendCellData } from '@/types/trend';
import { calculateTrendStats } from '@/utils/trend-calc';

export interface ColumnGroup {
  label: string;
  color?: string;
  columns: string[];
}

interface TrendTableProps {
  periods: string[];
  cellData: TrendCellData[][];
  columnLabels: string[];
  columnGroups?: ColumnGroup[];
  extraColumns?: { label: string; values: (string | number)[] }[];
  title?: string;
  showStats?: boolean;
}

const GROUP_LINE_COLORS = ['#e74c3c', '#2980b9', '#27ae60', '#e67e22'];

export default function TrendTable({
  periods,
  cellData,
  columnLabels,
  columnGroups,
  extraColumns,
  title,
  showStats = true,
}: TrendTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLines, setShowLines] = useState(true);

  const stats = useMemo(() => {
    if (!showStats || cellData.length === 0) return [];
    return calculateTrendStats(cellData);
  }, [cellData, showStats]);

  const hasGroups = columnGroups && columnGroups.length > 0;

  const colGroupMap = useMemo(() => {
    if (!hasGroups) return {};
    const map: Record<number, number> = {};
    let colIdx = 0;
    columnGroups!.forEach((group, gi) => {
      group.columns.forEach(() => {
        map[colIdx] = gi;
        colIdx++;
      });
    });
    return map;
  }, [columnGroups, hasGroups]);

  return (
    <div className="bg-white rounded-2xl shadow-apple overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b border-[#ebebed] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1d1d1f]">{title}</h3>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
            <input
              type="checkbox"
              checked={showLines}
              onChange={e => setShowLines(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-[#0071e3]"
            />
            显示连线
          </label>
        </div>
      )}
      <div className="overflow-x-auto relative" ref={containerRef}>
        <table className="trend-table">
          <thead>
            {hasGroups && (
              <tr>
                <th rowSpan={2} className="period-col">期号</th>
                {columnGroups!.map((group, gi) => (
                  <th
                    key={gi}
                    colSpan={group.columns.length}
                    className="position-header"
                    style={group.color ? { backgroundColor: group.color, color: '#fff' } : undefined}
                  >
                    {group.label}
                  </th>
                ))}
                {extraColumns?.map((ec, i) => (
                  <th key={`eh-${i}`} rowSpan={2} className="extra-col">{ec.label}</th>
                ))}
              </tr>
            )}
            <tr>
              {!hasGroups && <th className="period-col">期号</th>}
              {columnLabels.map((label, i) => (
                <th key={i}>{label}</th>
              ))}
              {!hasGroups && extraColumns?.map((ec, i) => (
                <th key={`eh-${i}`} className="extra-col">{ec.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((period, rowIdx) => {
              const row = cellData[rowIdx];
              if (!row) return null;
              return (
                <tr key={period}>
                  <td className="period-col">{period.slice(-3)}</td>
                  {row.map((cell, colIdx) => (
                    <td key={colIdx}>
                      <TrendCell
                        value={columnLabels[colIdx]}
                        isHit={cell.isHit}
                        missingCount={cell.missingCount}
                        rowIndex={rowIdx}
                        colIndex={colIdx}
                        groupColor={hasGroups ? GROUP_LINE_COLORS[colGroupMap[colIdx] ?? 0] : undefined}
                      />
                    </td>
                  ))}
                  {extraColumns?.map((ec, i) => (
                    <td key={`ex-${i}`} className="extra-col-value">
                      {ec.values[rowIdx]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
          {showStats && stats.length > 0 && (
            <tfoot>
              {stats.map((stat) => (
                <tr key={stat.label} className="trend-stats-row">
                  <td className="period-col text-[10px]">{stat.label}</td>
                  {stat.values.map((v, i) => (
                    <td key={i} className="text-[10px] font-semibold">{v}</td>
                  ))}
                  {extraColumns?.map((_, i) => (
                    <td key={`se-${i}`} />
                  ))}
                </tr>
              ))}
            </tfoot>
          )}
        </table>
        {showLines && (
          <TrendLines
            containerRef={containerRef}
            cellData={cellData}
            columnGroups={columnGroups}
          />
        )}
      </div>
    </div>
  );
}
