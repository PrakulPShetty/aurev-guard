// Enable any CIP-30 wallet (Nami, Flint, Lace)
export async function enableWallet() {
  if (!window.cardano) {
    throw new Error("No Cardano wallet extension found.");
  }

  const availableWallets = Object.entries(window.cardano)
    .filter(([key, wallet]) => wallet && wallet.enable);

  if (availableWallets.length === 0) {
    throw new Error("No CIP-30 compatible wallets found.");
  }

  // Pick the first available wallet (Nami / Flint / Lace)
  const [walletName, walletAPI] = availableWallets[0];

  try {
    const api = await walletAPI.enable();
    return { api, walletName };
  } catch (err) {
    throw new Error("Failed to enable wallet: " + err.message);
  }
}

// Get used/known wallet addresses
export async function getUsedAddresses(api) {
  try {
    const addrs = await api.getUsedAddresses();
    return addrs || [];
  } catch (err) {
    console.warn("getUsedAddresses error:", err);
    return [];
  }
}
