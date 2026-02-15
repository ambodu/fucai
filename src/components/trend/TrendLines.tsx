'use client';

import React, { useEffect, useState, useCallback, RefObject } from 'react';
import { ColumnGroup } from './TrendTable';
import { TrendCellData } from '@/types/trend';

const GROUP_LINE_COLORS = ['#e74c3c', '#2980b9', '#27ae60', '#e67e22'];

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

    // Build groups: each group is a range of column indices
    // For single-position trend charts (no columnGroups), all columns are one group
    // For comprehensive charts, each columnGroup defines a range
    interface GroupRange {
      startCol: number;
      endCol: number; // exclusive
      colorIdx: number;
    }

    const groups: GroupRange[] = [];
    if (columnGroups && columnGroups.length > 0) {
      let colIdx = 0;
      columnGroups.forEach((group, gi) => {
        const start = colIdx;
        colIdx += group.columns.length;
        groups.push({ startCol: start, endCol: colIdx, colorIdx: gi });
      });
    } else {
      // Single group: all columns
      const totalCols = cellData[0]?.length || 0;
      groups.push({ startCol: 0, endCol: totalCols, colorIdx: 0 });
    }

    const containerRect = container.getBoundingClientRect();
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;

    // Build a map of all hit elements by (row, col) for fast lookup
    const hitElements = container.querySelectorAll('[data-hit="true"]');
    const hitMap: Record<string, HTMLElement> = {};
    hitElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const row = htmlEl.getAttribute('data-row');
      const col = htmlEl.getAttribute('data-col');
      if (row !== null && col !== null) {
        hitMap[`${row}-${col}`] = htmlEl;
      }
    });

    const newLines: LineSegment[] = [];

    // For each group, scan rows to find hits and connect adjacent rows
    for (const group of groups) {
      const color = GROUP_LINE_COLORS[group.colorIdx % GROUP_LINE_COLORS.length];

      // Track previous row's hit element
      let prevEl: HTMLElement | null = null;

      for (let rowIdx = 0; rowIdx < cellData.length; rowIdx++) {
        const row = cellData[rowIdx];
        if (!row) continue;

        // Find the hit column in this group's range for this row
        let currentEl: HTMLElement | null = null;
        for (let col = group.startCol; col < group.endCol; col++) {
          if (row[col]?.isHit) {
            const el = hitMap[`${rowIdx}-${col}`];
            if (el) {
              currentEl = el;
              break;
            }
          }
        }

        if (currentEl && prevEl) {
          // Draw line from prevEl to currentEl
          const r1 = prevEl.getBoundingClientRect();
          const r2 = currentEl.getBoundingClientRect();

          const x1 = r1.left - containerRect.left + scrollLeft + r1.width / 2;
          const y1 = r1.top - containerRect.top + scrollTop + r1.height / 2;
          const x2 = r2.left - containerRect.left + scrollLeft + r2.width / 2;
          const y2 = r2.top - containerRect.top + scrollTop + r2.height / 2;

          newLines.push({ x1, y1, x2, y2, color });
        }

        if (currentEl) {
          prevEl = currentEl;
        }
      }
    }

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
