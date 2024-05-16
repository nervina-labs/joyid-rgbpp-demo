import { useMediaQuery } from '@chakra-ui/react';

export const useIsMobileLayout = () => useMediaQuery(`(max-width: 500px)`, { ssr: false })[0];
