import { http, createConfig, useAccount, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { SessionProvider } from "next-auth/react";
import { mainnet, sepolia } from "wagmi/chains";
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors';
import { NotificationProvider } from "@web3uikit/core"

import { Account } from "../components/Account";
import { WalletOptions } from "../components/WalletOptions";

const projectId = 'dd939dd3f5c6cc9967d570af4b5bce3a';

const config = createConfig({
    chains: [ sepolia],
    ssr: true,
    connectors: [
      injected(),
      walletConnect({ projectId }),
      metaMask(),
      safe(),
    ],
    transports: {
        // [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
});

const queryClient = new QueryClient();

function ConnectWallet() {
    const { isConnected } = useAccount()
    if (isConnected) return <Account />
    return <WalletOptions />
  }

function MyApp({ Component, pageProps }) {
  return (
    
    <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
            <SessionProvider session={pageProps.session} refetchInterval={0}>
                <NotificationProvider>
                    <ConnectWallet />
                    
                    <Component {...pageProps} />
                </NotificationProvider>
            </SessionProvider>
        </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;