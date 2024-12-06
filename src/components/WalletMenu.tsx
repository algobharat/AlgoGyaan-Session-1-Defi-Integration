import { useWallet } from '@txnlab/use-wallet-react'
import './WalletMenu.css'

export function WalletMenu() {
  const { wallets, activeWallet, activeAccount } = useWallet()

  return (
    <div className="wallet-menu">
      <ul className="wallet-list">
        {wallets.map((wallet) => (
          <li key={wallet.id} className="wallet-item">
            <button className="wallet-button" onClick={() => wallet.connect()}>
              {wallet.metadata.name}
            </button>
          </li>
        ))}
      </ul>

      {activeWallet && (
        <div className="active-wallet">
          <h2>Active Wallet</h2>
          <p>{activeWallet.metadata.name}</p>
          <h2>Active Account</h2>
          <p>{activeAccount?.address}</p>
          <button className="disconnect-button" onClick={() => activeWallet.disconnect()}>
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}