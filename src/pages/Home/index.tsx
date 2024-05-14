import {
  useClipboard,
  Stat,
  StatLabel,
  StatNumber,
  VStack,
  Button,
  Link,
  StatHelpText,
  Spinner,
} from '@chakra-ui/react';
import { useQuery } from 'react-query';
import { Navigate } from 'react-router-dom';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { useAccount, useBtcAddressType, useSetAccountInfo } from '../../hooks';
import { RoutePath } from '../../route/path';
import { getCellsCapacity } from '../../indexer/ckb';
import { getBtcBalance } from '../../indexer/btc';

function truncateMiddle(str = '', takeLength = 6, tailLength = takeLength, pad = '...'): string {
  if (takeLength + tailLength >= str.length) return str;
  return `${str.slice(0, takeLength)}${pad}${str.slice(-tailLength)}`;
}

export const Home = () => {
  const account = useAccount();
  const { onCopy, hasCopied } = useClipboard(account?.address ?? '');
  const setAccount = useSetAccountInfo();
  const { data: capacity } = useQuery(
    ['ckb-capacity', account?.address],
    () => getCellsCapacity(account?.address ?? ''),
    {
      enabled: account?.address !== null,
      refetchInterval: 1000 * 10,
    },
  );

  const btcAddressType = useBtcAddressType();
  const btcAddress = btcAddressType === 'p2tr' ? account?.taproot.address : account?.nativeSegwit.address;
  const { data: btcBalance } = useQuery(['btc-balance', btcAddress], () => getBtcBalance(btcAddress!), {
    enabled: account?.btcAddressType !== undefined,
    refetchInterval: 1000 * 10,
  });
  if (account === null) {
    return <Navigate to={RoutePath.Root} replace />;
  }

  return (
    <VStack spacing={6}>
      <Stat>
        <StatLabel>CKB Address</StatLabel>
        <StatNumber>{truncateMiddle(account.address, 9, 6)}</StatNumber>
        <StatHelpText flexDirection="row" display="flex" alignItems="center">
          <Button colorScheme="teal" variant="outline" size="xs" onClick={onCopy}>
            {hasCopied ? 'Copied!' : 'Copy Address'}
          </Button>
        </StatHelpText>
        <StatLabel>{capacity ? `${capacity} CKB` : <Spinner size="xs" />}</StatLabel>
        <StatHelpText>
          <Link
            isExternal
            href="https://faucet.nervos.org/"
            flexDirection="row"
            display="flex"
            alignItems="center"
            mr="6px"
          >
            Claim CKB
            <ExternalLinkIcon mx="2px" />
          </Link>
        </StatHelpText>
      </Stat>

      <Stat>
        <StatLabel>BTC Address</StatLabel>
        <StatNumber>{truncateMiddle(account.address, 9, 6)}</StatNumber>
        <StatLabel>{btcBalance ? `${btcBalance} BTC` : <Spinner size="xs" />}</StatLabel>
      </Stat>
      <Button colorScheme="teal" w="240px" variant="outline" onClick={() => setAccount(null)}>
        Logout
      </Button>
    </VStack>
  );
};
