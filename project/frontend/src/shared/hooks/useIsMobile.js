import { useMediaQuery } from '@mantine/hooks';

// Below Mantine's `sm` breakpoint (48em = 768px) the dashboard switches to the phone layout:
// sidebars become drawers instead of side columns.
export function useIsMobile() {
  return useMediaQuery('(max-width: 48em)', false, { getInitialValueInEffect: false });
}
