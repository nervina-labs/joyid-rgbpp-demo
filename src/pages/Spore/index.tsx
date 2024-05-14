import { Button, VStack, Text } from '@chakra-ui/react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAccount } from '../../hooks';
import { RoutePath } from '../../route/path';

export function SignCkbRawTx() {
  const account = useAccount();
  const navi = useNavigate();

  const prepareCluster = async () => {};

  if (!account) {
    return <Navigate to={RoutePath.Root} replace />;
  }

  return (
    <div className="App">
      <VStack spacing={4}>
        <Text>Cluster Name: Test Cluster</Text>
        <Text>Cluster Description: CKB Test Cluster</Text>
        <Button colorScheme="teal" w="240px" onClick={prepareCluster}>
          Prepare Cluster Cell
        </Button>

        <Button colorScheme="purple" onClick={() => navi(RoutePath.Home)}>
          {`<< Go Home`}
        </Button>
      </VStack>
    </div>
  );
}
