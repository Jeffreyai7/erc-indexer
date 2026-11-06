import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  Input,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import TokenCard from './components/TokenCard';
import { fetchTokens, hasApiKey, resolveAddress } from './lib/alchemy';

function App() {
  const [input, setInput] = useState('');
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [tokens, setTokens] = useState(null); // null = not queried yet
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  async function lookup(value = input) {
    setError('');
    setIsLoading(true);
    setTokens(null);
    try {
      const address = await resolveAddress(value);
      setResolvedAddress(address);
      setTokens(await fetchTokens(address));
    } catch (err) {
      setResolvedAddress('');
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function connectWallet() {
    if (!window.ethereum) {
      setError('No wallet found. Install MetaMask (or another browser wallet) to connect.');
      return;
    }
    setError('');
    setIsConnecting(true);
    try {
      const [account] = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setInput(account);
      await lookup(account);
    } catch (err) {
      setError(err?.code === 4001 ? 'Wallet connection was rejected.' : err?.message);
    } finally {
      setIsConnecting(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    lookup();
  }

  return (
    <Container maxW="6xl" py={{ base: 8, md: 16 }} px={4}>
      <Stack spacing={3} textAlign="center" mb={10}>
        <Heading size="2xl" bgGradient="linear(to-r, purple.300, blue.300)" bgClip="text">
          ERC-20 Token Indexer
        </Heading>
        <Text color="gray.400">
          Enter an Ethereum address or ENS name to see all of its ERC-20 token balances.
        </Text>
      </Stack>

      {!hasApiKey && (
        <Alert status="warning" mb={6} borderRadius="md">
          <AlertIcon />
          <AlertDescription>
            No Alchemy API key found. Create a <code>.env</code> file with{' '}
            <code>VITE_ALCHEMY_API_KEY=your_key</code> and restart <code>npm run dev</code>.
          </AlertDescription>
        </Alert>
      )}

      <Box as="form" onSubmit={onSubmit} maxW="2xl" mx="auto">
        <Flex gap={3} direction={{ base: 'column', sm: 'row' }}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="0x… or vitalik.eth"
            size="lg"
            fontFamily="mono"
            spellCheck={false}
            autoComplete="off"
          />
          <Button
            type="submit"
            size="lg"
            colorScheme="purple"
            isLoading={isLoading && !isConnecting}
            loadingText="Checking"
            isDisabled={!input.trim() || isLoading}
            flexShrink={0}
          >
            Check balances
          </Button>
        </Flex>
        <Center mt={3}>
          <Button
            variant="link"
            colorScheme="purple"
            onClick={connectWallet}
            isLoading={isConnecting}
            isDisabled={isLoading}
          >
            or connect your wallet
          </Button>
        </Center>
      </Box>

      {error && (
        <Alert status="error" mt={8} borderRadius="md" maxW="2xl" mx="auto">
          <AlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Box mt={12}>
        {isLoading && (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} height="130px" borderRadius="md" />
            ))}
          </SimpleGrid>
        )}

        {!isLoading && tokens && (
          <>
            <Text mb={4} color="gray.400" fontSize="sm" wordBreak="break-all">
              {tokens.length} token{tokens.length === 1 ? '' : 's'} held by{' '}
              <Text as="span" fontFamily="mono" color="gray.200">
                {resolvedAddress}
              </Text>
            </Text>
            {tokens.length === 0 ? (
              <Text textAlign="center" py={10} color="gray.500">
                This address doesn't hold any ERC-20 tokens.
              </Text>
            ) : (
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
                {tokens.map((token) => (
                  <TokenCard key={token.contractAddress} token={token} />
                ))}
              </SimpleGrid>
            )}
          </>
        )}
      </Box>
    </Container>
  );
}

export default App;
