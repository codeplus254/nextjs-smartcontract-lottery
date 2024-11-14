import { useAccount, useDisconnect, useEnsAvatar, useEnsName, useSwitchChain } from 'wagmi';

export function Account() {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName })
  const { chains, switchChain } = useSwitchChain();

  return (
    <>
        <div>
        {chains.map((chain) => (
            <button key={chain.id} onClick={() => switchChain({ chainId: chain.id })}>
            {chain.name}
            </button>
        ))}
        </div>
        <div>
            {ensAvatar && <img alt="ENS Avatar" src={ensAvatar} />}
            {address && <p>{ensName ? `${ensName} (${address})` : address}</p>}
            <button onClick={() => disconnect()}>Disconnect</button>
        </div>
    </>
        
  )
}