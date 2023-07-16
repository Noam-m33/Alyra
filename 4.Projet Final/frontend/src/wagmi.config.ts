import { createConfig, configureChains, mainnet } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { hardhat } from "@wagmi/chains";
import { parseAbiItem } from "viem";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [hardhat, mainnet],
  [publicProvider()]
);

console.log("hi from wagmi.config.ts");

// Set up wagmi config
export const config = createConfig({
  autoConnect: true,
  connectors: [new MetaMaskConnector({ chains })],
  publicClient,
  webSocketPublicClient,
});
