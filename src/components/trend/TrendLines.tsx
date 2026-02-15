'use client';

import React, { useEffect, useState, useCallback, RefObject } from 'react';
import { ColumnGroup } from './TrendTable';
import { TrendCellData } from '@/types/trend';

const GROUP_LINE_COLORS = ['#7434f3', '#00d4aa', '#3498db', '#e67e22'];

interface TrendLinesProps {
  containerRef: RefObject<HTMLDivElement | null>;
  cellData: TrendCellData[][];
  columnGroups?: ColumnGroup[];
}

interface LineSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

export default function TrendLines({ containerRef, cellData, columnGroups }: TrendLinesProps) {
  const [lines, setLines] = useState<LineSegment[]>([]);
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });

  const calculateLines = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    setSvgSize({ width: container.scrollWidth, height: container.scrollHeight });

    const hitElements = container.querySelectorAll('[data-hit="true"]');
    if (hitElements.length === 0) return;

    // Group by column
    const colHits: Record<number, { row: number; el: HTMLElement }[]> = {};
    hitElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const row = parseInt(htmlEl.getAttribute('data-row') || '-1', 10);
      const col = parseInt(htmlEl.getAttribute('data-col') || '-1', 10);
      if (row < 0 || col < 0) return;
      if (!colHits[col]) colHits[col] = [];
      colHits[col].push({ row, el: htmlEl });
    });

    // Build column-to-group mapping
    const colGroupMap: Record<number, number> = {};
    if (columnGroups && columnGroups.length > 0) {
      let colIdx = 0;
      columnGroups.forEach((group, gi) => {
        group.columns.forEach(() => {
          colGroupMap[colIdx] = gi;
          colIdx++;
        });
      });
    }

    const newLines: LineSegment[] = [];
    const containerRect = container.getBoundingClientRect();
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;

    Object.entries(colHits).forEach(([colStr, hits]) => {
      const col = parseInt(colStr, 10);
      hits.sort((a, b) => a.row - b.row);

      for (let i = 0; i < hits.length - 1; i++) {
        const el1 = hits[i].el;
        const el2 = hits[i + 1].el;
        const r1 = el1.getBoundingClientRect();
        const r2 = el2.getBoundingClientRect();

        const x1 = r1.left - containerRect.left + scrollLeft + r1.width / 2;
        const y1 = r1.top - containerRect.top + scrollTop + r1.height / 2;
        const x2 = r2.left - containerRect.left + scrollLeft + r2.width / 2;
        const y2 = r2.top - containerRect.top + scrollTop + r2.height / 2;

        const groupIdx = colGroupMap[col] ?? 0;
        const color = GROUP_LINE_COLORS[groupIdx % GROUP_LINE_COLORS.length];

        newLines.push({ x1, y1, x2, y2, color });
      }
    });

    setLines(newLines);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, columnGroups]);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      calculateLines();
    });

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(calculateLines);
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      cancelAnimationFrame(timer);
      observer.disconnect();
    };
  }, [calculateLines, containerRef, cellData]);

  if (lines.length === 0) return null;

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      width={svgSize.width}
      height={svgSize.height}
      style={{ zIndex: 2 }}
    >
      {lines.map((line, i) => (
        <line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={line.color}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.6}
        />
      ))}
    </svg>
  );
}
