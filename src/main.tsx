import {
  NetworkId,
  WalletId,
  WalletManager,
  WalletProvider
} from '@txnlab/use-wallet-react'
import ReactDOM from 'react-dom/client'
import App from './App'


// Create a manager instance
const walletManager = new WalletManager({
  wallets: [
   
    {
      id: WalletId.WALLETCONNECT,
      options: { projectId: '9606ddd4e95e01cd41486cdaefb87928' }
    },
    // {
    //   id: WalletId.MAGIC,
    //   options: { apiKey: '<YOUR_API_KEY>' }
    // },
    // {
    //   id: WalletId.LUTE,
    //   options: { siteName: '<YOUR_SITE_NAME>' }
    // }
  ],
  network: NetworkId.TESTNET
})

function Main() {
  return (
    // Provide the manager to your App
    <WalletProvider manager={walletManager}>
      
      <App />
      
    </WalletProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Main />)