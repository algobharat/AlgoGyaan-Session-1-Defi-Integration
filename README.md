# AlgoGyaan Session 3 - DeFi Integration with Tinyman Swap

This repository demonstrates different methods of integrating Tinyman's Swap functionality into a React-Vite application, showcasing DeFi capabilities on the Algorand blockchain. The implementation includes three approaches: iframe integration, local signer, and parent signer implementations.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Basic understanding of React and Algorand
- A wallet with some test ALGOs on Algorand testnet

## 🚀 Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/algobharat/AlgoGyaan-Session-3-Defi-Integration.git
   cd AlgoGyaan-Session-3-Defi-Integration
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 💡 Implementation Methods

### 1. Simple iframe Integration (Easiest Method)

The quickest way to add Tinyman swap functionality to your application is using an iframe:

```jsx
<iframe 
  title="tinyman swap widget"
  src="https://tinymanorg.github.io/swap-widget/?platformName=algoerand&network=mainnet&themeVariables=eyJ0aGVtZSI6ImxpZ2h0IiwiY29udGFpbmVyQnV0dG9uQmciOiIjMmNiY2EyIiwid2lkZ2V0QmciOiIjYTA1NmZmIiwiaGVhZGVyQnV0dG9uQmciOiIjODM0NmQxIiwiaGVhZGVyQnV0dG9uVGV4dCI6IiNmZmZmZmYiLCJoZWFkZXJUaXRsZSI6IiNmZmZmZmYiLCJjb250YWluZXJCdXR0b25UZXh0IjoiI2ZmZmZmZiIsImlmcmFtZUJnIjoiI0Y4RjhGOCIsImJvcmRlclJhZGl1c1NpemUiOiJtZWRpdW0iLCJ0aXRsZSI6IlN3YXAiLCJzaG91bGREaXNwbGF5VGlueW1hbkxvZ28iOmZhbHNlfQ%3D%3D&assetIn=0&assetOut=31566704"
  style={{
    width: "415px",
    height: "440px",
    border: "none"
  }}
  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
/>
```

Key features of iframe integration:
- No additional dependencies required
- Minimal setup and configuration
- Pre-built UI and functionality
- Customizable through URL parameters
- Suitable for quick implementations

### 2. Local Signer Implementation

```javascript
import { TinymanSwapWidget } from '@tinymanorg/tinyman-swap-widget-sdk';
import { PeraWalletConnect } from '@perawallet/connect';

const peraWallet = new PeraWalletConnect();

const LocalSignerExample = () => {
  const handleSwapWidget = async () => {
    try {
      const widget = new TinymanSwapWidget({
        network: 'testnet',
        theme: 'light',
        containerStyle: {
          width: '400px',
          height: '600px',
        },
        signer: {
          // Implement transaction signing
          signTxn: async (txnGroup) => {
            try {
              // Connect wallet if not connected
              let addresses = await peraWallet.connect();
              
              // Sign transactions
              const signedTxns = await peraWallet.signTransaction([
                txnGroup.map((txn) => {
                  return {
                    txn: txn.toByte(),
                    signers: [addresses[0]],
                  };
                }),
              ]);
              
              return signedTxns;
            } catch (error) {
              console.error("Error signing transaction:", error);
              throw error;
            }
          }
        },
        // Optional callbacks
        onTxnConfirm: () => {
          console.log('Transaction confirmed!');
        },
        onTxnComplete: () => {
          console.log('Swap completed successfully!');
        },
        onClose: () => {
          console.log('Widget closed');
        },
        onError: (error) => {
          console.error('Error occurred:', error);
        }
      });

      // Mount the widget
      widget.mount(document.getElementById('tinyman-swap-widget'));
    } catch (error) {
      console.error("Error initializing widget:", error);
    }
  };

  return (
    <div id="tinyman-swap-widget" />
  );
};
```

### 3. Parent Signer Implementation

```javascript
import { TinymanSwapWidget } from '@tinymanorg/tinyman-swap-widget-sdk';

const ParentSignerExample = () => {
  const handleSwapWidget = async () => {
    try {
      const widget = new TinymanSwapWidget({
        network: 'testnet',
        theme: 'light',
        containerStyle: {
          width: '400px',
          height: '600px',
        },
        parentSigner: {
          // Implement postMessage communication
          postMessage: (message) => {
            window.parent.postMessage(message, "*");
          },
          // Optional: Implement custom message handling
          onMessage: (message) => {
            console.log('Received message:', message);
            // Handle different message types
            switch (message.type) {
              case 'SIGN_TXN':
                // Handle transaction signing request
                break;
              case 'SEND_TXN':
                // Handle transaction submission
                break;
              default:
                console.log('Unknown message type:', message.type);
            }
          }
        },
        // Optional callbacks
        onTxnConfirm: () => {
          console.log('Transaction confirmed!');
        },
        onTxnComplete: () => {
          console.log('Swap completed successfully!');
        },
        onClose: () => {
          console.log('Widget closed');
        },
        onError: (error) => {
          console.error('Error occurred:', error);
        }
      });

      // Mount the widget
      widget.mount(document.getElementById('tinyman-swap-widget'));
    } catch (error) {
      console.error("Error initializing widget:", error);
    }
  };

  return (
    <div id="tinyman-swap-widget" />
  );
};
```

### Parent Application Message Handling
```javascript
// In the parent application
window.addEventListener('message', async (event) => {
  // Verify the origin
  if (event.origin !== 'your-trusted-origin') return;

  const message = event.data;
  
  switch (message.type) {
    case 'SIGN_TXN':
      try {
        // Handle transaction signing
        const signedTxns = await handleSignTransaction(message.txns);
        // Send signed transactions back to widget
        event.source.postMessage({
          type: 'SIGNED_TXN',
          signedTxns: signedTxns
        }, event.origin);
      } catch (error) {
        event.source.postMessage({
          type: 'ERROR',
          error: error.message
        }, event.origin);
      }
      break;
      
    case 'SEND_TXN':
      try {
        // Handle transaction submission
        const txnId = await handleSendTransaction(message.signedTxns);
        event.source.postMessage({
          type: 'TXN_SENT',
          txnId: txnId
        }, event.origin);
      } catch (error) {
        event.source.postMessage({
          type: 'ERROR',
          error: error.message
        }, event.origin);
      }
      break;
  }
});
```

## 🔧 Configuration Options

### Widget Customization

You can customize the widget appearance and behavior through various configuration options:

```javascript
const customConfig = {
  network: "testnet",
  theme: "light",
  containerStyle: {
    width: "100%",
    maxWidth: "500px",
    height: "600px",
    border: "1px solid #ccc",
    borderRadius: "10px",
  },
  slippage: 0.5,  // 0.5% slippage tolerance
  assetIn: {
    id: 0,        // ALGO
  },
  assetOut: {
    id: 123456789 // Your desired asset ID
  }
};
```

### Handling Transactions

The widget provides several callback methods for transaction handling:

```javascript
const callbacks = {
  onTxnSubmitted: (txnId) => {
    console.log(`Transaction submitted: ${txnId}`);
  },
  onTxnCompleted: (txnId) => {
    console.log(`Transaction completed: ${txnId}`);
  },
  onError: (error) => {
    console.error('Transaction error:', error);
  }
};
```

## 🔍 Testing

1. Ensure you're connected to the Algorand testnet
2. Have test ALGOs in your wallet
3. Try swapping between different assets to test the integration
4. Test all three implementation methods to understand their differences

## 📝 Implementation Notes

- iframe method is recommended for quick implementations
- Local signer is best for standalone applications
- Parent signer is ideal for embedded scenarios
- Always test transactions with small amounts first
- Keep your wallet's private keys secure
- Monitor slippage settings for optimal trades
- Consider implementing error handling for failed transactions

## 📚 Resources

- [Tinyman Swap Widget Documentation](https://docs.tinyman.org/swap-widget)
- [Tinyman SDK Package](https://www.npmjs.com/package/@tinymanorg/tinyman-swap-widget-sdk)
- [Algorand Developer Documentation](https://developer.algorand.org/)

## 🆘 Support

For issues and questions:
- Create an issue in this repository
- Join the Algorand Discord community
- Visit the Tinyman documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.