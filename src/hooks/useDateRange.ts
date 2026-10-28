import { useCallback, useState } from 'react';

import { currentMonthRange, lastMonthRange } from '@/src/lib/date';
import type { DateRange } from '@/src/lib/types';

export type RangePreset = 'thisMonth' | 'lastMonth' | 'custom';

export function useDateRange(initialPreset: 'thisMonth' | 'lastMonth' = 'thisMonth') {
  const [preset, setPresetState] = useState<RangePreset>(initialPreset);
  const [range, setRange] = useState<DateRange>(
    initialPreset === 'lastMonth' ? lastMonthRange() : currentMonthRange()
  );

  const setPreset = useCallback((nextPreset: RangePreset) => {
    setPresetState(nextPreset);
    if (nextPreset === 'thisMonth') {
      setRange(currentMonthRange());
    } else if (nextPreset === 'lastMonth') {
      setRange(lastMonthRange());
    }
  }, []);

  const setCustomRange = useCallback((nextRange: DateRange) => {
    setPresetState('custom');
    setRange(nextRange);
  }, []);

  return { preset, range, setPreset, setCustomRange };
}
