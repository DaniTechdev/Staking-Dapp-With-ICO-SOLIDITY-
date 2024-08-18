import "../styles/globals.css";
import toast, { Toaster } from "react-hot-toast";
import merge from "loadash/merge";
import "@rainbow-me/rainbowkit/styles.css";

import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
  midnightTheme,
} from "@rainbow-me/rainbowkit";

//NETWORK SETUP
const HOLESKY = process.env.NEXT_PUBLIC_HOLESKY_RPC_URL;
const EXPLORER = process.env.NEXT_PUBLIC_EXPLORER;
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID;
const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY;
const DECIMALS = process.env.NEXT_PUBLIC_NETWORK_DECIMALS;
const NAME = process.env.NEXT_PUBLIC_NETWORK_NAME;
const NETWORK = process.env.NEXT_PUBLIC_NETWORK;

import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

export default function App({ Component, pageProps }) {
  //NETWORKS and CHAIN configuration
  const { chains, provider } = configureChains(
    [
      {
        id: Number(CHAIN_ID),
        name: NAME,
        network: NETWORK,
        nativeCurrency: {
          name: NAME,
          symbol: CURRENCY,
          decimals: DECIMALS,
        },
        rpcUrls: {
          default: {
            http: [`${HOLESKY}`],
          },
          public: {
            http: [`${HOLESKY}`],
          },
        },
        blockExplorers: {
          default: {
            name: "Holescan",
            url: EXPLORER,
          },
        },
        testnet: true,
      },
    ],
    [
      jsonRpcProvider({
        rpc: (chain) => {
          if (chain.id === Number(CHAIN_ID)) {
            return { http: `${HOLESKY}` };
          }
          return null;
        },
        priority: 1,
      }),
    ]
  );

  const { connectors } = getDefaultWallets({
    appName: "StakingDapp",
    chains,
  });

  const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
  });

  const myTheme = merge(midnightTheme(), {
    color: {
      accentColor: "#562c7B",
      accentColorForeground: "#fff",
    },
  });
  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chain} theme={myTheme}>
          <Component {...pageProps} />
          <Toaster />
        </RainbowKitProvider>
      </WagmiConfig>

      <script src="js/bootstrap.bundle.min.js"></script>
      <script src="js/smooth-scrollbar.js"></script>
      <script src="js/splide.min.js"></script>
      <script src="js/three.min.js"></script>
      <script src="js/vanta.fog.min.js"></script>
      <script src="js/main.js"></script>
    </>
  );
}
