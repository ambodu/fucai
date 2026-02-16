'use client';

import React from 'react';

interface TrendCellProps {
  value: number | string;
  isHit: boolean;
  missingCount: number;
  rowIndex?: number;
  colIndex?: number;
  groupColor?: string;
}

const TrendCell = React.memo(function TrendCell({ value, isHit, missingCount, rowIndex, colIndex, groupColor }: TrendCellProps) {
  if (isHit) {
    const bgColor = groupColor || '#e74c3c';
    return (
      <div className="flex items-center justify-center">
        <div
          className="w-[26px] h-[26px] rounded-full text-white flex items-center justify-center text-[11px] font-bold leading-none relative z-[5]"
          style={{ backgroundColor: bgColor }}
          data-hit="true"
          data-row={rowIndex}
          data-col={colIndex}
        >
          {value}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center text-[#aeaeb2] text-[11px]">
      {missingCount}
    </div>
  );
});

export default TrendCell;
