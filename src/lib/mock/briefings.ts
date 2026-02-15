import { Briefing } from '@/types/fc3d';

export const mockBriefings: Briefing[] = [
  {
    id: 1,
    period: '2025046',
    drawDate: '2025-02-15',
    status: 1,
    contentText: '第2025046期开奖号码3 5 8，和值16，跨度5，奇偶比2:1，大小比2:1，组六。百位3结束3期遗漏，个位8结束3期遗漏。',
    content: {
      drawNumbers: { digit1: 3, digit2: 5, digit3: 8 },
      basicFeatures: { sum: 16, span: 5, oddEven: '2:1', bigSmall: '2:1', group: '组六' },
      missingChanges: {
        endedMissing: [
          { position: 1, digit: 3, wasMissing: 3 },
          { position: 3, digit: 8, wasMissing: 3 },
        ],
        longestMissing: [
          { position: 2, digit: 0, currentMissing: 7 },
          { position: 3, digit: 0, currentMissing: 6 },
        ],
      },
      frequencyData: {
        digit1Top: { digit: 7, count: 8, in: 50 },
        digit1Bottom: { digit: 6, count: 4, in: 50 },
      },
      sumTrend: {
        last10: [16, 18, 11, 13, 16, 10, 18, 8, 15, 9],
        avg50: 13.5,
      },
    },
  },
  {
    id: 2,
    period: '2025045',
    drawDate: '2025-02-14',
    status: 1,
    contentText: '第2025045期开奖号码7 2 9，和值18，跨度7，奇偶比2:1，大小比2:1，组六。',
    content: {
      drawNumbers: { digit1: 7, digit2: 2, digit3: 9 },
      basicFeatures: { sum: 18, span: 7, oddEven: '2:1', bigSmall: '2:1', group: '组六' },
      missingChanges: {
        endedMissing: [{ position: 1, digit: 7, wasMissing: 2 }],
        longestMissing: [{ position: 2, digit: 0, currentMissing: 6 }],
      },
      frequencyData: {
        digit1Top: { digit: 5, count: 7, in: 50 },
        digit1Bottom: { digit: 6, count: 4, in: 50 },
      },
      sumTrend: {
        last10: [18, 11, 13, 16, 10, 18, 8, 15, 9, 13],
        avg50: 13.2,
      },
    },
  },
  {
    id: 3,
    period: '2025044',
    drawDate: '2025-02-13',
    status: 1,
    contentText: '第2025044期开奖号码1 6 4，和值11，跨度5，奇偶比1:2，大小比1:2，组六。',
    content: {
      drawNumbers: { digit1: 1, digit2: 6, digit3: 4 },
      basicFeatures: { sum: 11, span: 5, oddEven: '1:2', bigSmall: '1:2', group: '组六' },
      missingChanges: {
        endedMissing: [{ position: 1, digit: 1, wasMissing: 4 }],
        longestMissing: [{ position: 2, digit: 0, currentMissing: 5 }],
      },
      frequencyData: {
        digit1Top: { digit: 3, count: 7, in: 50 },
        digit1Bottom: { digit: 8, count: 4, in: 50 },
      },
      sumTrend: {
        last10: [11, 13, 16, 10, 18, 8, 15, 9, 13, 16],
        avg50: 13.0,
      },
    },
  },
  {
    id: 4,
    period: '2025043',
    drawDate: '2025-02-12',
    status: 1,
    contentText: '第2025043期开奖号码0 8 3，和值11，跨度8，奇偶比1:2，大小比1:2，组六。',
    content: {
      drawNumbers: { digit1: 0, digit2: 8, digit3: 3 },
      basicFeatures: { sum: 11, span: 8, oddEven: '1:2', bigSmall: '1:2', group: '组六' },
      missingChanges: {
        endedMissing: [{ position: 1, digit: 0, wasMissing: 5 }],
        longestMissing: [{ position: 3, digit: 0, currentMissing: 4 }],
      },
      frequencyData: {
        digit1Top: { digit: 5, count: 7, in: 50 },
        digit1Bottom: { digit: 0, count: 3, in: 50 },
      },
      sumTrend: {
        last10: [11, 16, 10, 18, 8, 15, 9, 13, 16, 20],
        avg50: 13.6,
      },
    },
  },
  {
    id: 5,
    period: '2025042',
    drawDate: '2025-02-11',
    status: 1,
    contentText: '第2025042期开奖号码5 5 2，和值12，跨度3，奇偶比2:1，大小比2:1，对子。',
    content: {
      drawNumbers: { digit1: 5, digit2: 5, digit3: 2 },
      basicFeatures: { sum: 12, span: 3, oddEven: '2:1', bigSmall: '2:1', group: '对子' },
      missingChanges: {
        endedMissing: [{ position: 1, digit: 5, wasMissing: 2 }],
        longestMissing: [{ position: 2, digit: 0, currentMissing: 3 }],
      },
      frequencyData: {
        digit1Top: { digit: 3, count: 7, in: 50 },
        digit1Bottom: { digit: 6, count: 4, in: 50 },
      },
      sumTrend: {
        last10: [12, 10, 18, 8, 15, 9, 13, 16, 20, 17],
        avg50: 13.8,
      },
    },
  },
];
