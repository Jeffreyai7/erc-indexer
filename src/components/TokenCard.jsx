import {
  Avatar,
  Box,
  Card,
  CardBody,
  HStack,
  Link,
  Text,
  Tooltip,
} from '@chakra-ui/react';

const compact = new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 });

function formatBalance(balance) {
  const n = Number(balance);
  if (!Number.isFinite(n)) return balance;
  if (n > 0 && n < 0.0001) return '< 0.0001';
  return compact.format(n);
}

export default function TokenCard({ token }) {
  const { contractAddress, name, symbol, logo, balance } = token;

  return (
    <Card variant="outline" bg="whiteAlpha.50" borderColor="whiteAlpha.200">
      <CardBody>
        <HStack spacing={3} mb={3} minW={0}>
          <Avatar size="sm" src={logo} name={symbol || '?'} bg="purple.500" />
          <Box minW={0}>
            <Text fontWeight="bold" noOfLines={1}>
              {symbol || 'Unknown'}
            </Text>
            <Text fontSize="sm" color="gray.400" noOfLines={1}>
              {name || 'Unnamed token'}
            </Text>
          </Box>
        </HStack>

        {/* Full balance on hover; truncated so long numbers never overflow. */}
        <Tooltip label={balance} placement="top" openDelay={300}>
          <Text fontSize="xl" fontFamily="mono" noOfLines={1} wordBreak="break-all">
            {formatBalance(balance)}
          </Text>
        </Tooltip>

        <Link
          href={`https://etherscan.io/token/${contractAddress}`}
          isExternal
          fontSize="xs"
          color="purple.300"
          fontFamily="mono"
        >
          {contractAddress.slice(0, 6)}…{contractAddress.slice(-4)}
        </Link>
      </CardBody>
    </Card>
  );
}
