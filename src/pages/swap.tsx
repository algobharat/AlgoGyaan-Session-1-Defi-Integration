import React, { useCallback, useEffect, useRef } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { WidgetController, SignerTransaction } from '@tinymanorg/tinyman-swap-widget-sdk';

export const TinymanSwap: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { activeAccount, signTransactions } = useWallet();

  const iframeUrl = WidgetController.generateWidgetIframeUrl({
    useParentSigner: true,
    accountAddress: activeAccount?.address,
    network: "testnet",
    parentUrlOrigin: window.location.origin,
  });

  const onTxnSignRequest = useCallback(
    async ({ txGroups }: { txGroups: SignerTransaction[][] }) => {
      try {
        if (!activeAccount) throw new Error("No active account");

        const signedTxns = await Promise.all(
          txGroups.map(group => signTransactions(group))
        );

        WidgetController.sendMessageToWidget({
          data: { message: { type: "TXN_SIGN_RESPONSE", signedTxns: signedTxns.flat() } },
          targetWindow: iframeRef.current?.contentWindow,
        });
      } catch (error) {
        WidgetController.sendMessageToWidget({
          data: { message: { type: "FAILED_TXN_SIGN", error } },
          targetWindow: iframeRef.current?.contentWindow,
        });
      }
    },
    [activeAccount, signTransactions]
  );

  const onTxnSignRequestTimeout = useCallback(() => {
    console.error("Transaction sign request timed out");
  }, []);

  const onSwapSuccess = useCallback((response: any) => {
    console.log("Swap successful:", response);
    // You can add additional logic here, such as showing a success message
  }, []);

  useEffect(() => {
    const swapController = new WidgetController({
      onTxnSignRequest,
      onTxnSignRequestTimeout,
      onSwapSuccess,
    });

    swapController.addWidgetEventListeners();

    return () => {
      swapController.removeWidgetEventListeners();
    };
  }, [onSwapSuccess, onTxnSignRequest, onTxnSignRequestTimeout]);

  if (!activeAccount) {
    return <div className="text-center p-4">Please connect your wallet to use the swap widget.</div>;
  }

  return (
    <div className="flex justify-center items-center p-4">
      <iframe
        ref={iframeRef}
        title="Tinyman Swap Widget"
        className="border-none rounded-lg shadow-lg"
        style={{ width: 400, height: 444 }}
        src={iframeUrl}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
    </div>
  );
};

export default TinymanSwap;

