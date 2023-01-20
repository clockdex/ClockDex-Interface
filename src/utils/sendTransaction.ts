import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
import { t } from '@lingui/macro'
import { captureException } from '@sentry/react'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { Transaction, VersionedTransaction } from '@solana/web3.js'
import { ethers } from 'ethers'

import connection from 'state/connection/connection'
import { SolanaEncode } from 'state/swap/types'
import { TransactionHistory } from 'state/transactions/hooks'
import { TRANSACTION_TYPE } from 'state/transactions/type'
// import connection from 'state/connection/connection'
import { calculateGasMargin } from 'utils'

export async function sendEVMTransaction(
  account: string,
  library: ethers.providers.Web3Provider | undefined,
  contractAddress: string,
  encodedData: string,
  value: BigNumber,
  handler?: (response: TransactionResponse) => void,
): Promise<TransactionResponse | undefined> {
  if (!account || !library) return

  const estimateGasOption = {
    from: account,
    to: contractAddress,
    data: encodedData,
    value,
  }

  let gasEstimate: ethers.BigNumber | undefined
  try {
    gasEstimate = await library.getSigner().estimateGas(estimateGasOption)
    if (!gasEstimate) throw new Error('gasEstimate is nullish value')
  } catch (error) {
    const e = new Error('Swap failed', { cause: error })
    e.name = 'SwapError'

    const tmp = JSON.stringify(error)
    const tag = tmp.includes('minTotalAmountOut')
      ? 'minTotalAmountOut'
      : tmp.includes('ERR_LIMIT_OUT')
      ? 'ERR_LIMIT_OUT'
      : tmp.toLowerCase().includes('1inch')
      ? 'call1InchFailed'
      : 'other'

    captureException(e, {
      level: 'fatal',
      extra: estimateGasOption,
      tags: {
        type: tag,
      },
    })

    throw new Error('gasEstimate not found: Unexpected error. Please contact support: none of the calls threw an error')
  }

  const sendTransactionOption = {
    from: account,
    to: contractAddress,
    data: encodedData,
    gasLimit: calculateGasMargin(gasEstimate),
    ...(value.eq('0') ? {} : { value }),
  }

  try {
    const response = await library.getSigner().sendTransaction(sendTransactionOption)
    handler?.(response)
    return response
  } catch (error) {
    // if the user rejected the tx, pass this along
    if (error?.code === 4001 || error?.code === 'ACTION_REJECTED') {
      throw new Error('Transaction rejected.')
    } else {
      const e = new Error('Swap failed', { cause: error })
      e.name = 'SwapError'

      const tmp = JSON.stringify(error)
      const tag = tmp.includes('minTotalAmountOut')
        ? 'minTotalAmountOut'
        : tmp.includes('ERR_LIMIT_OUT')
        ? 'ERR_LIMIT_OUT'
        : tmp.toLowerCase().includes('1inch')
        ? 'call1InchFailed'
        : 'other'

      captureException(e, {
        level: 'error',
        extra: sendTransactionOption,
        tags: {
          type: tag,
        },
      })

      // Otherwise, the error was unexpected, and we need to convey that.
      throw new Error(error)
    }
  }
}

const getInspectTxSolanaUrl = (tx: Transaction | VersionedTransaction | undefined | null) => {
  if (!tx) return ''
  if ('serializeMessage' in tx) return Buffer.concat([Buffer.from([0]), tx.serializeMessage()]).toString('base64')
  if ('serialize' in tx) return Buffer.from(tx.serialize()).toString('base64')
  return ''
}

export async function sendSolanaTransactions(
  encode: SolanaEncode,
  solanaWallet: SignerWalletAdapter,
  addTransactionWithType: (tx: TransactionHistory) => void,
  swapData: TransactionHistory,
): Promise<string[] | undefined> {
  if (!encode) return
  if (!encode.swapTx) return

  const txs: (Transaction | VersionedTransaction)[] = []

  if (encode.setupTx) {
    txs.push(encode.setupTx)
  }

  txs.push(encode.swapTx)

  const populateTx = (
    txs: (Transaction | VersionedTransaction)[],
  ): {
    signedSetupTx: Transaction | undefined
    signedSwapTx: VersionedTransaction
  } => {
    const result: {
      signedSetupTx: Transaction | undefined
      signedSwapTx: VersionedTransaction | undefined
    } = { signedSetupTx: undefined, signedSwapTx: undefined }
    let count = 0
    if (encode.setupTx) result.signedSetupTx = txs[count++] as Transaction
    result.signedSwapTx = txs[count++] as VersionedTransaction
    return result as {
      signedSetupTx: Transaction | undefined
      signedSwapTx: VersionedTransaction
    }
  }

  console.group('Sending transactions:')
  encode.setupTx && console.info('setup tx:', getInspectTxSolanaUrl(encode.setupTx))
  console.info('swap tx:', getInspectTxSolanaUrl(encode.swapTx))
  console.info('inspector: https://explorer.solana.com/tx/inspector')
  console.groupEnd()

  try {
    let signedTxs: (Transaction | VersionedTransaction)[]
    try {
      signedTxs = await (solanaWallet as SignerWalletAdapter).signAllTransactions(txs)
    } catch (e) {
      console.log({ e })
      throw e
    }
    const { signedSetupTx, signedSwapTx } = populateTx(signedTxs)
    const txHashs: string[] = []
    let setupHash: string
    if (signedSetupTx) {
      try {
        setupHash = await connection.sendRawTransaction(signedSetupTx.serialize())
        txHashs.push(setupHash)
        addTransactionWithType({
          type: TRANSACTION_TYPE.SETUP,
          hash: setupHash,
          firstTxHash: txHashs[0],
          summary: 'swap ' + swapData.summary,
          arbitrary: {
            index: 1,
            total: signedTxs.length,
            mainTx: swapData,
          },
        })
        await connection.confirmTransaction(setupHash, 'finalized')
      } catch (error) {
        console.error({ error })
        throw new Error('Set up error' + (error.message ? ': ' + error.message : ''))
      }
    }

    let swapHash: string
    try {
      swapHash = await connection.sendRawTransaction(Buffer.from(signedSwapTx.serialize()))
      txHashs.push(swapHash)
      addTransactionWithType({ ...swapData, hash: swapHash, firstTxHash: txHashs[0] })
    } catch (error) {
      console.error({ error })
      if (error?.message?.endsWith('0x1771')) {
        throw new Error(t`An error occurred. Try refreshing the price rate or increase max slippage`)
      } else if (/0x[0-9a-f]+$/.test(error.message)) {
        const errorCode = error.message.split(' ').slice(-1)[0]
        throw new Error(t`Error encountered. We haven’t send the transaction yet. Error code ${errorCode}`)
      }
      throw new Error(t`Error encountered. We haven’t send the transaction yet.`)
    }

    return txHashs
  } catch (e) {
    throw e
  }
}
