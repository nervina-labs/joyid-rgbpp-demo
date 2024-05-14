import { useState } from 'react';
import { Button, VStack, useToast, Radio, RadioGroup, Stack } from '@chakra-ui/react';
import { connect } from '@joyid/ckb';
import { Navigate } from 'react-router-dom';
import { BTCAddressType, useAccount, useBtcAddressType, useSetAccountInfo, useSetBtcAddressType } from '../../hooks';
import { RoutePath } from '../../route/path';

export function Root() {
  const [isLoading, setIsLoading] = useState(false);
  const btcAddressType = useBtcAddressType();
  const setBtcAddressType = useSetBtcAddressType();
  const toast = useToast();
  const setAccount = useSetAccountInfo();
  const account = useAccount();

  const updateBtcAddressType = (value: string) => {
    setBtcAddressType(value as BTCAddressType);
  };

  const onPopupClick = async () => {
    setIsLoading(true);
    try {
      const res = await connect();
      setAccount({
        ...res,
        callbackType: 'popup',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (account) {
    return <Navigate to={RoutePath.Home} replace />;
  }

  return (
    <div className="App">
      <VStack spacing={6} mt="200px">
        <RadioGroup onChange={updateBtcAddressType} value={btcAddressType}>
          <Stack direction="row">
            <Radio value="p2tr">P2TR</Radio>
            <Radio value="p2wpkh">P2WPKH</Radio>
          </Stack>
        </RadioGroup>

        <Button onClick={onPopupClick} colorScheme="teal" w="200px" isLoading={isLoading}>
          Connect JoyID
        </Button>
      </VStack>
    </div>
  );
}
