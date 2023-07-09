import { createConfig, configureChains, mainnet } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { hardhat } from "@wagmi/chains";
import { parseAbiItem } from "viem";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [hardhat, mainnet],
  [publicProvider()]
);

publicClient({ chainId: 31337 })
  ?.getLogs({
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    event: parseAbiItem("event ArenaCreated(uint arenaId)"),
    fromBlock: BigInt(0),
  })
  .then((e) => console.log("hi", e))
  .catch(console.error);

console.log("hi from wagmi.config.ts");

// Set up wagmi config
export const config = createConfig({
  autoConnect: true,
  connectors: [new MetaMaskConnector({ chains })],
  publicClient,
  webSocketPublicClient,
});
