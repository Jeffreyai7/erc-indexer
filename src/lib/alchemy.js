import { Alchemy, Network } from 'alchemy-sdk';
import { utils } from 'ethers';

const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY;

export const hasApiKey = Boolean(apiKey);

// One shared client instead of a new one per request.
const alchemy = hasApiKey
  ? new Alchemy({ apiKey, network: Network.ETH_MAINNET })
  : null;

function requireClient() {
  if (!alchemy) {
    throw new Error(
      'Missing Alchemy API key. Add VITE_ALCHEMY_API_KEY to your .env file and restart the dev server.'
    );
  }
  return alchemy;
}

/**
 * Turns user input (0x address or ENS name) into a checksummed address.
 */
export async function resolveAddress(input) {
  const value = input.trim();
  if (!value) throw new Error('Enter an address or ENS name.');

  if (utils.isAddress(value)) return utils.getAddress(value);

  if (value.includes('.')) {
    const resolved = await requireClient().core.resolveName(value);
    if (!resolved) throw new Error(`Could not resolve ENS name "${value}".`);
    return resolved;
  }

  throw new Error('That is not a valid Ethereum address or ENS name.');
}

/**
 * Fetches every ERC-20 token held by `address`, with metadata, using
 * getTokensForOwner (balances + metadata in one paginated call instead of
 * one metadata request per token).
 */
export async function fetchTokens(address) {
  const client = requireClient();
  const tokens = [];
  let pageKey;

  do {
    const res = await client.core.getTokensForOwner(address, { pageKey });
    tokens.push(...res.tokens);
    pageKey = res.pageKey;
  } while (pageKey);

  return tokens
    .filter((t) => !t.error && t.rawBalance && BigInt(t.rawBalance) > 0n)
    .sort((a, b) => (a.symbol || '~').localeCompare(b.symbol || '~'));
}
