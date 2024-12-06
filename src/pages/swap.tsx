'use client'

import React, { useCallback, useEffect, useRef } from "react"
import { useWallet } from "@txnlab/use-wallet-react"
import { WidgetController } from "@tinymanorg/tinyman-swap-widget-sdk"
import algosdk from "algosdk"

export function TinymanSwapWidget() {
  const { activeAddress, signTransactions } = useWallet()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const iframeUrl = activeAddress
    ? WidgetController.generateWidgetIframeUrl(
        {
            "platformName": "algogyaan swap",
            "useParentSigner": true,
            "assetIds": [
              0,
              31566704
            ],
            "network": "testnet",
            "themeVariables": {
              "theme": "light",
              "containerButtonBg": "#2cbca2",
              "widgetBg": "#a056ff",
              "headerButtonBg": "#8346d1",
              "headerButtonText": "#ffffff",
              "headerTitle": "#ffffff",
              "containerButtonText": "#ffffff",
              "iframeBg": "#F8F8F8",
              "title": "Swap",
              "shouldDisplayTinymanLogo": false
            },
            "accountAddress": "YOUR_ACCOUNT_ADDRESS_VARIABLE_NAME"
          }
      )
    : ''

  const onTxnSignRequest = useCallback(
    async ({ txGroups }: { txGroups: any[][] }) => {
      try {
        if (!activeAddress || !signTransactions) throw new Error("Wallet not connected")

        const flattenedTxns = txGroups.flat()
        const encodedTxns = flattenedTxns.map(txn => algosdk.encodeUnsignedTransaction(txn))
        
        const signedTxns = await signTransactions(encodedTxns)

        WidgetController.sendMessageToWidget({
          data: { message: { type: "TXN_SIGN_RESPONSE", signedTxns: signedTxns.filter(txn => txn !== null) } },
          targetWindow: iframeRef.current?.contentWindow,
        })
      } catch (error) {
        console.error("Failed to sign transaction:", error)
        WidgetController.sendMessageToWidget({
          data: { message: { type: "FAILED_TXN_SIGN", error } },
          targetWindow: iframeRef.current?.contentWindow,
        })
      }
    },
    [activeAddress, signTransactions]
  )

  const onTxnSignRequestTimeout = useCallback(() => {
    console.error("Transaction sign request timed out")
  }, [])

  const onSwapSuccess = useCallback((response: any) => {
    console.log("Swap successful:", response)
    // You can add additional logic here, such as showing a success message
  }, [])

  useEffect(() => {
    if (!activeAddress) return

    const swapController = new WidgetController({
      onTxnSignRequest,
      onTxnSignRequestTimeout,
      onSwapSuccess,
    })

    swapController.addWidgetEventListeners()

    return () => {
      swapController.removeWidgetEventListeners()
    }
  }, [activeAddress, onSwapSuccess, onTxnSignRequest, onTxnSignRequestTimeout])

  if (!activeAddress) {
    return <div className="text-center p-4 bg-yellow-100 rounded-lg">Please connect your wallet to use the swap widget.</div>
  }

  return (
    <iframe
      ref={iframeRef}
      title="Tinyman Swap Widget"
      style={{ width: 400, height: 444, border: 'none' }}
      src={iframeUrl}
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
    />
  )
}

