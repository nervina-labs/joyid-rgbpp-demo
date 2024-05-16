import { useState } from 'react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Button, VStack, Textarea, Alert, AlertIcon, AlertTitle, AlertDescription, Link, Text } from '@chakra-ui/react';
import { Navigate, useNavigate } from 'react-router-dom';
import { CKBTransaction, signRawTransaction } from '@joyid/ckb';
import { useAccount } from '../../hooks';
import { RoutePath } from '../../route/path';
import { atom, useAtom } from 'jotai';
import { useIsMobileLayout } from '../../hooks/useIsMobileLayout';
import { buildJoyIDCellToSporeCreation, collector } from '../../rgbpp';

const CKB_RAW_TX_PLACEHOLDER = `{"version":"0x0","cellDeps":[{"outPoint":{"txHash":"0xf1de59e973b85791ec32debbba08dff80c63197e895eb95d67fc1e9f6b413e00","index":"0x0"},"depType":"code"}],"headerDeps":[],"inputs":[{"previousOutput":{"index":"0x4","txHash":"0x215c160043b26d5e50c61e57a15e98d66c730ab8b39c9765c5cf49ebd1a36caf"},"since":"0x0"}],"outputs":[{"capacity":"0x59c78b6d2","lock":{"codeHash":"0x00cdf8fab0f8ac638758ebf5ea5e4052b1d71e8a77b9f43139718621f6849326","hashType":"type","args":"0x065602fce8d8ea00209d038c786495e8c37b0e55dddf4a08befdc1aba32d099e"}}],"outputsData":["0x6200000010000000190000003e00000005000000646f622f30210000007b226964223a342c22646e61223a2231363565336464653138663732613236227d200000009c5ef9d69d2ba84516a367af41edcdd221c31cee3312d0c7c195ccbe384196a2"],"witnesses":[]}`;

const rawTxAtom = atom<string>('');

export function SignSporeCkbRawTx() {
  const account = useAccount();
  const navi = useNavigate();
  const isMobile = useIsMobileLayout();
  const [rawTx, setRawTx] = useAtom(rawTxAtom);
  const [loading, setLoading] = useState(false);
  const [hash, setHash] = useState('');

  const signCkbTx = async () => {
    setLoading(true);
    const ckbAddress = account?.address ?? '';
    const ckbRawTx: CKBComponents.RawTransaction = JSON.parse(rawTx);
    const { unsignedTx, witnessIndex } = await buildJoyIDCellToSporeCreation(ckbAddress, ckbRawTx);
    const signedTx = await signRawTransaction(unsignedTx as CKBTransaction, ckbAddress, { witnessIndex });
    const txHash = await collector.getCkb().rpc.sendTransaction(signedTx);
    setHash(txHash);
    console.log(`Create spores tx hash: ${txHash}`);
    setLoading(false);
  };

  if (!account) {
    return <Navigate to={RoutePath.Root} replace />;
  }

  return (
    <div className="App">
      <VStack spacing={4}>
        <Textarea
          value={rawTx}
          name="rawTx"
          height="400px"
          width={isMobile ? 'calc(100% - 64px)' : '600px'}
          placeholder={CKB_RAW_TX_PLACEHOLDER}
          onChange={(e) => setRawTx(e.target.value)}
        />
        <Button colorScheme="teal" w="240px" onClick={signCkbTx} isLoading={loading}>
          Sign Spore CKB Raw TX
        </Button>

        {hash ? (
          <Alert
            status="success"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            variant="subtle"
          >
            <AlertIcon />
            <AlertTitle>Creation Successful</AlertTitle>
            <AlertDescription>
              <Text>{`The transaction hash is: `}</Text>
              <Link
                href={`https://pudge.explorer.nervos.org/transaction/${hash}`}
                isExternal
                wordBreak="break-all"
                textDecoration="underline"
              >
                {hash}
                <ExternalLinkIcon mx="2px" />
              </Link>
            </AlertDescription>
          </Alert>
        ) : null}

        <Button colorScheme="purple" onClick={() => navi(RoutePath.Home)}>
          {`<< Go Home`}
        </Button>
      </VStack>
    </div>
  );
}
