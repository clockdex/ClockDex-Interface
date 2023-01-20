import { createReducer } from '@reduxjs/toolkit'

import { findTx } from 'utils'

import {
  addTransaction,
  checkedSubgraph,
  checkedTransaction,
  clearAllTransactions,
  finalizeTransaction,
  removeTx,
  replaceTx,
} from './actions'
import { GroupedTxsByHash } from './type'

const now = () => new Date().getTime()

interface TransactionState {
  [chainId: number]: GroupedTxsByHash | undefined
}

const initialState: TransactionState = {}

export default createReducer(initialState, builder =>
  builder
    .addCase(
      addTransaction,
      (
        transactions,
        {
          payload: {
            sentAtBlock,
            to,
            nonce,
            data,
            chainId,
            from,
            hash,
            approval,
            type,
            summary,
            arbitrary,
            firstTxHash,
          },
        },
      ) => {
        const chainTxs = transactions[chainId] ?? {}
        const txs = (firstTxHash && chainTxs[firstTxHash]) || []
        txs.push({ sentAtBlock, to, nonce, data, hash, approval, type, summary, arbitrary, from, addedTime: now() })
        chainTxs[txs[0].hash] = txs
        transactions[chainId] = chainTxs
      },
    )
    .addCase(clearAllTransactions, (transactions, { payload: { chainId } }) => {
      if (!transactions[chainId]) return
      transactions[chainId] = {}
    })
    .addCase(checkedTransaction, (transactions, { payload: { chainId, hash, blockNumber } }) => {
      const tx = findTx(transactions[chainId], hash)
      if (!tx) return
      if (!tx.lastCheckedBlockNumber) tx.lastCheckedBlockNumber = blockNumber
      else tx.lastCheckedBlockNumber = Math.max(blockNumber, tx.lastCheckedBlockNumber)
    })
    .addCase(finalizeTransaction, (transactions, { payload: { hash, chainId, receipt, needCheckSubgraph } }) => {
      const tx = findTx(transactions[chainId], hash)
      if (!tx) return
      tx.receipt = receipt
      tx.confirmedTime = now()
      tx.needCheckSubgraph = needCheckSubgraph
    })
    .addCase(checkedSubgraph, (transactions, { payload: { chainId, hash } }) => {
      const tx = findTx(transactions[chainId], hash)
      if (!tx) return
      tx.needCheckSubgraph = false
    })
    .addCase(replaceTx, (transactions, { payload: { chainId, oldHash, newHash } }) => {
      const chainTxs = transactions[chainId] ?? {}
      const txGroup = chainTxs[oldHash] || Object.values(chainTxs).find(txs => txs?.some(tx => tx?.hash === oldHash))
      if (!txGroup) return
      const txIndex = txGroup.findIndex(tx => tx?.hash === oldHash)
      if (txIndex < 0) return
      txGroup[txIndex].hash = newHash
      if (chainTxs[oldHash]) {
        chainTxs[newHash] = txGroup
        delete chainTxs[oldHash]
      }
      transactions[chainId] = chainTxs
    })
    .addCase(removeTx, (transactions, { payload: { chainId, hash } }) => {
      const chainTxs = transactions[chainId] ?? {}
      if (chainTxs[hash]) {
        delete chainTxs[hash]
      } else {
        const txGroup = Object.values(chainTxs).find(txs => txs?.some(tx => tx?.hash === hash))
        if (!txGroup) return
        if (txGroup.length === 1) {
          delete transactions[chainId]?.[hash]
        } else {
          const txIndex = txGroup.findIndex(tx => tx?.hash === hash)
          if (txIndex < 0) return
          txGroup.splice(txIndex, 1)
        }
      }
      transactions[chainId] = chainTxs
    }),
)
