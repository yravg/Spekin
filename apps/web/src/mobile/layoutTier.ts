import { useEffect, useState } from 'react';

export type LayoutTier = 'desktop' | 'tablet' | 'phone';

// T01 F341: width decides the layout, never the device name / user agent.
// >= 1024 px: desktop canvas (S29/S35); 768..1023 px: tablet list + frame; < 768 px: phone list, frame, sheet.
export function layoutTierForWidth(width: number): LayoutTier {
  if (width >= 1024) return 'desktop';
  if (width >= 768) return 'tablet';
  return 'phone';
}

function readCurrentTier(): LayoutTier {
  if (typeof window === 'undefined') return 'desktop';
  return layoutTierForWidth(window.innerWidth);
}

export function useLayoutTier(): LayoutTier {
  const [tier, setTier] = useState<LayoutTier>(readCurrentTier);

  useEffect(() => {
    const update = () => setTier(readCurrentTier());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return tier;
}
