import { Trans, t } from '@lingui/macro'
import { BigNumber } from 'ethers'
import { debounce } from 'lodash'
import { rgba } from 'polished'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Info, Trash } from 'react-feather'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import { ButtonEmpty } from 'components/Button'
import LocalLoader from 'components/LocalLoader'
import Pagination from 'components/Pagination'
import SearchInput from 'components/SearchInput'
import Select from 'components/Select'
import SubscribeNotificationButton from 'components/SubscribeButton'
import LIMIT_ORDER_ABI from 'constants/abis/limit_order.json'
import { useActiveWeb3React, useWeb3React } from 'hooks'
import { useContract } from 'hooks/useContract'
import { NotificationType, useNotify } from 'state/application/hooks'
import { useLimitState } from 'state/limit/hooks'
import { useAllTransactions, useTransactionAdder } from 'state/transactions/hooks'
import { TRANSACTION_TYPE } from 'state/transactions/type'
import { TRANSACTION_STATE_DEFAULT, TransactionFlowState } from 'types'
import { findTx } from 'utils'
import {
  subscribeNotificationOrderCancelled,
  subscribeNotificationOrderExpired,
  subscribeNotificationOrderFilled,
} from 'utils/firebase'
import { sendEVMTransaction } from 'utils/sendTransaction'

import EditOrderModal from '../EditOrderModal'
import CancelOrderModal from '../Modals/CancelOrderModal'
import { ACTIVE_ORDER_OPTIONS, CLOSE_ORDER_OPTIONS } from '../const'
import { calcPercentFilledOrder, formatAmountOrder, isActiveStatus } from '../helpers'
import { ackNotificationOrder, getEncodeData, getListOrder, insertCancellingOrder } from '../request'
import { LimitOrder, LimitOrderStatus, ListOrderHandle } from '../type'
import useCancellingOrders from '../useCancellingOrders'
import OrderItem from './OrderItem'
import SummaryNotify from './SummaryNotify'
import TabSelector from './TabSelector'
import TableHeader from './TableHeader'

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const ButtonCancelAll = styled(ButtonEmpty)`
  background-color: ${({ theme }) => rgba(theme.red, 0.2)};
  color: ${({ theme }) => theme.red};
  font-size: 14px;
  width: fit-content;
  padding: 8px 14px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
   width: 100%;
   padding: 10px;
  `};
`

const PAGE_SIZE = 10
const NoResultWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${({ theme }) => theme.subText};
  margin-top: 40px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
   margin-top: 16px;
  `};
`

const TableFooterWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column-reverse;
  `};
`

const SearchFilter = styled.div`
  gap: 16px;
  margin-top: 24px;
  display: flex;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    gap: 8px;
  `};
`
const SelectFilter = styled(Select)`
  background: ${({ theme }) => theme.background};
  border-radius: 40px;
  max-width: 50%;
  font-size: 14px;
  width: 180px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
     width: 160px;
  `};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
     width: 40%;
  `};
`
const SearchInputWrapped = styled(SearchInput)`
  flex: 1;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
     width: 60%;
  `};
`

export default forwardRef<ListOrderHandle>(function ListLimitOrder(props, ref) {
  const { account, chainId, networkInfo } = useActiveWeb3React()
  const { library } = useWeb3React()
  const [curPage, setCurPage] = useState(1)
  const [orderType, setOrderType] = useState<LimitOrderStatus>(LimitOrderStatus.ACTIVE)
  const [keyword, setKeyword] = useState('')
  const [isOpenCancel, setIsOpenCancel] = useState(false)
  const [isOpenEdit, setIsOpenEdit] = useState(false)

  const limitOrderContract = useContract(networkInfo.limitOrder ?? '', LIMIT_ORDER_ABI)
  const notify = useNotify()
  const { ordersUpdating } = useLimitState()
  const addTransactionWithType = useTransactionAdder()
  const { isOrderCancelling, setCancellingOrders, cancellingOrdersIds } = useCancellingOrders()
  const transactions = useAllTransactions()

  const [orders, setOrders] = useState<LimitOrder[]>([])
  const [totalOrder, setTotalOrder] = useState<number>(0)
  const [flowState, setFlowState] = useState<TransactionFlowState>(TRANSACTION_STATE_DEFAULT)
  const [currentOrder, setCurrentOrder] = useState<LimitOrder>()
  const [isCancelAll, setIsCancelAll] = useState(false)
  const [loading, setLoading] = useState(true)

  const onPageChange = (page: number) => {
    setCurPage(page)
  }

  const onReset = () => {
    setKeyword('')
    setCurPage(1)
  }

  const onSelectTab = (type: LimitOrderStatus) => {
    setOrderType(type)
    onReset()
  }

  const onChangeKeyword = (val: string) => {
    setKeyword(val)
    setCurPage(1)
  }

  const controller = useRef(new AbortController())
  const fetchListOrder = useCallback(
    async (orderType: LimitOrderStatus, query: string, curPage: number) => {
      try {
        let orders: LimitOrder[] = []
        let totalItems = 0
        if (account) {
          controller.current.abort()
          controller.current = new AbortController()
          const response = await getListOrder(
            {
              chainId,
              maker: account,
              status: orderType,
              query,
              page: curPage,
              pageSize: PAGE_SIZE,
            },
            controller.current.signal,
          )
          orders = response.orders ?? []
          totalItems = response.pagination.totalItems ?? 0
        }
        setOrders(orders)
        setTotalOrder(totalItems)
      } catch (error) {
        if (error?.name === 'AbortError') return
        console.error(error)
      }
      setLoading(false)
    },
    [account, chainId],
  )

  const fetchListOrderDebounce = useMemo(() => debounce(fetchListOrder, 400), [fetchListOrder])
  useEffect(() => {
    setLoading(true)
    setOrders([])
    fetchListOrderDebounce(orderType, keyword, curPage)
  }, [orderType, keyword, fetchListOrderDebounce, curPage])

  const refreshListOrder = useCallback(() => {
    onReset()
    fetchListOrderDebounce(orderType, '', 1)
  }, [fetchListOrderDebounce, orderType])

  useImperativeHandle(ref, () => ({
    refreshListOrder,
  }))

  const isTransactionFailed = (txHash: string) => {
    const transactionInfo = findTx(transactions, txHash)
    return transactionInfo?.receipt !== undefined && transactionInfo?.receipt?.status !== 1
  }

  const isTxFailed = useRef(isTransactionFailed)
  isTxFailed.current = isTransactionFailed

  const showedNotificationOrderIds = useRef<{ [id: string]: boolean }>({})
  const ackNotiLocal = (id: string | number) => {
    showedNotificationOrderIds.current = { ...showedNotificationOrderIds.current, [id]: true }
  }

  useEffect(() => {
    if (!account || !chainId) return
    const unsubscribeCancelled = subscribeNotificationOrderCancelled(account, chainId, data => {
      refreshListOrder()
      const cancelAllData = data?.all?.[0]
      const cancelAllSuccess = cancelAllData?.isSuccessful
      if (cancelAllSuccess !== undefined) {
        // not show Notification when cancel failed because duplicate.
        if (
          !isTxFailed.current(cancelAllData?.txHash ?? '') &&
          !showedNotificationOrderIds.current[cancelAllData.id ?? '']
        ) {
          notify(
            {
              type: cancelAllSuccess ? NotificationType.WARNING : NotificationType.ERROR,
              title: cancelAllSuccess ? t`Order Cancelled` : t`Cancel Orders Failed`,
              summary: (
                <SummaryNotify
                  message={
                    cancelAllSuccess
                      ? t`You have successfully cancelled all orders.`
                      : t`Cancel all orders failed. Please try again.`
                  }
                />
              ),
            },
            10000,
          )
        }
        const nonces =
          data?.all.map((e: { id: string }) => {
            ackNotiLocal(e.id)
            return e.id
          }) ?? []
        if (nonces.length) {
          ackNotificationOrder(nonces, account, chainId, LimitOrderStatus.CANCELLED).catch(console.error)
        }
      }

      const orders: LimitOrder[] = data?.orders ?? []
      const orderCancelSuccess = orders.filter(e => e.isSuccessful && !showedNotificationOrderIds.current[e.id])
      const orderCancelFailed = orders.filter(
        e => !e.isSuccessful && !isTxFailed.current(e.txHash) && !showedNotificationOrderIds.current[e.id],
      )

      if (orderCancelSuccess.length)
        notify(
          {
            type: NotificationType.WARNING,
            title: t`Order Cancelled`,
            summary: <SummaryNotify orders={orderCancelSuccess} type={LimitOrderStatus.CANCELLED} />,
          },
          10000,
        )
      if (orderCancelFailed.length)
        notify(
          {
            type: NotificationType.ERROR,
            title: t`Order Cancel Failed`,
            summary: <SummaryNotify orders={orderCancelFailed} type={LimitOrderStatus.CANCELLED_FAILED} />,
          },
          10000,
        )
      if (orders.length)
        ackNotificationOrder(
          orders.map(({ id }) => {
            ackNotiLocal(id)
            return id.toString()
          }),
          account,
          chainId,
          LimitOrderStatus.CANCELLED,
        ).catch(console.error)
    })
    const unsubscribeExpired = subscribeNotificationOrderExpired(account, chainId, data => {
      refreshListOrder()
      const orders: LimitOrder[] = data?.orders ?? []
      if (orders.length) {
        notify(
          {
            type: NotificationType.WARNING,
            title: t`Order Expired`,
            summary: <SummaryNotify orders={orders} type={LimitOrderStatus.EXPIRED} />,
          },
          10000,
        )
        ackNotificationOrder(
          orders.map(e => e.id.toString()),
          account,
          chainId,
          LimitOrderStatus.EXPIRED,
        ).catch(console.error)
      }
    })
    const unsubscribeFilled = subscribeNotificationOrderFilled(account, chainId, data => {
      refreshListOrder()
      const orders: LimitOrder[] = data?.orders ?? []
      const orderFilled = orders.filter(
        order => order.status === LimitOrderStatus.FILLED || order.takingAmount === order.filledTakingAmount,
      )
      const orderPartialFilled = orders.filter(
        order => order.status === LimitOrderStatus.PARTIALLY_FILLED || order.takingAmount !== order.filledTakingAmount,
      )
      if (orderFilled.length) {
        notify(
          {
            type: NotificationType.SUCCESS,
            title: t`Order Filled`,
            summary: <SummaryNotify orders={orderFilled} type={LimitOrderStatus.FILLED} />,
          },
          10000,
        )
      }
      orderPartialFilled.forEach(order => {
        notify(
          {
            type: NotificationType.SUCCESS,
            title: t`Order Partially Filled`,
            summary: <SummaryNotify orders={[order]} type={LimitOrderStatus.PARTIALLY_FILLED} />,
          },
          10000,
        )
      })
      if (orders.length) {
        ackNotificationOrder(
          orders.map(e => e.uuid),
          account,
          chainId,
          LimitOrderStatus.FILLED,
        ).catch(console.error)
      }
    })
    return () => {
      unsubscribeCancelled?.()
      unsubscribeExpired?.()
      unsubscribeFilled?.()
    }
  }, [account, chainId, notify, refreshListOrder])

  const hideConfirmCancel = useCallback(() => {
    setFlowState(state => ({ ...state, showConfirm: false }))
    setIsOpenCancel(false)
    setTimeout(() => {
      setCurrentOrder(undefined)
    }, 300)
  }, [])

  const hideEditModal = useCallback(() => {
    setFlowState(state => ({ ...state, showConfirm: false }))
    setCurrentOrder(undefined)
    setIsOpenEdit(false)
  }, [])

  const showConfirmCancel = useCallback((order?: LimitOrder) => {
    setCurrentOrder(order)
    setFlowState({ ...TRANSACTION_STATE_DEFAULT, showConfirm: true })
    setIsOpenCancel(true)
    setIsCancelAll(false)
  }, [])

  const showEditOrderModal = useCallback((order: LimitOrder) => {
    setCurrentOrder(order)
    setIsOpenEdit(true)
    setIsCancelAll(false)
  }, [])

  const totalOrderNotCancelling = useMemo(() => {
    return orders.filter(e => !isOrderCancelling(e)).length
  }, [orders, isOrderCancelling])

  const requestCancelOrder = async (order: LimitOrder | undefined) => {
    if (!library || !account || !chainId || !limitOrderContract) return Promise.reject('Wrong input')

    setFlowState(state => ({
      ...state,
      pendingText: t`Canceling your orders`,
      showConfirm: true,
      attemptingTxn: true,
    }))

    const { encodedData } = await getEncodeData([order?.id].filter(Boolean) as number[], isCancelAll)
    const response = await sendEVMTransaction(
      account,
      library,
      networkInfo.limitOrder ?? '',
      encodedData,
      BigNumber.from(0),
    )
    const newOrders = isCancelAll ? orders.map(e => e.id) : order?.id ? [order?.id] : []
    setCancellingOrders({ orderIds: cancellingOrdersIds.concat(newOrders) })

    if (response?.hash && account) {
      let nonce: BigNumber = BigNumber.from(0)
      if (isCancelAll) {
        nonce = await limitOrderContract.nonce(account)
      }
      insertCancellingOrder({
        maker: account,
        chainId: chainId.toString(),
        txHash: response.hash,
        [isCancelAll ? 'nonce' : 'orderIds']: isCancelAll ? nonce?.toNumber() : newOrders,
      })
    }

    response &&
      addTransactionWithType({
        ...response,
        type: TRANSACTION_TYPE.CANCEL_LIMIT_ORDER,
        summary: order
          ? t`Order ${formatAmountOrder(order.makingAmount, order.makerAssetDecimals)} ${
              order.makerAssetSymbol
            } to ${formatAmountOrder(order.takingAmount, order.takerAssetDecimals)} ${order.takerAssetSymbol}`
          : t`all orders`,
      })
    return
  }

  const onCancelOrder = async (order: LimitOrder | undefined) => {
    try {
      await requestCancelOrder(order)
      setFlowState(state => ({ ...state, showConfirm: false }))
    } catch (error) {
      console.error(error)
      setFlowState(state => ({
        ...state,
        attemptingTxn: false,
        errorMessage: 'Error occur. Please try again.',
      }))
    }
  }

  const onCancelAllOrder = () => {
    showConfirmCancel()
    setIsCancelAll(true)
  }

  const onUpdateOrder = async () => {
    await requestCancelOrder(currentOrder)
  }

  const disabledBtnCancelAll = totalOrderNotCancelling === 0
  const isTabActive = isActiveStatus(orderType)

  useEffect(() => {
    const orderCancelling = orders.length - totalOrderNotCancelling
    window.onbeforeunload = () => (orderCancelling > 0 && ordersUpdating.length > 0 ? '' : null) // return null will not show confirm, else will show
  }, [totalOrderNotCancelling, orders, ordersUpdating])

  return (
    <>
      <Flex justifyContent={'space-between'} alignItems="center">
        <TabSelector
          setActiveTab={onSelectTab}
          activeTab={isTabActive ? LimitOrderStatus.ACTIVE : LimitOrderStatus.CLOSED}
        />
        <SubscribeNotificationButton subscribeTooltip={t`Subscribe to receive notifications on your limit orders`} />
      </Flex>

      <Flex flexDirection={'column'} style={{ gap: '1rem' }}>
        <SearchFilter>
          <SelectFilter
            key={orderType}
            options={isTabActive ? ACTIVE_ORDER_OPTIONS : CLOSE_ORDER_OPTIONS}
            value={orderType}
            onChange={setOrderType}
          />
          <SearchInputWrapped
            placeholder={t`Search by token symbol or token address`}
            maxLength={255}
            value={keyword}
            onChange={onChangeKeyword}
          />
        </SearchFilter>
        {loading ? (
          <LocalLoader />
        ) : (
          <>
            <div>
              <TableHeader />
              <ListWrapper>
                {orders.map((order, index) => (
                  <OrderItem
                    isOrderCancelling={isOrderCancelling}
                    index={index + (curPage - 1) * PAGE_SIZE}
                    key={order.id}
                    order={order}
                    onCancelOrder={showConfirmCancel}
                    onEditOrder={showEditOrderModal}
                  />
                ))}
              </ListWrapper>
            </div>
            {orders.length === 0 && (
              <NoResultWrapper>
                <Info size={isMobile ? 40 : 48} />
                <Text marginTop={'10px'}>
                  {isTabActive ? (
                    <Trans>You don&apos;t have any active orders yet</Trans>
                  ) : (
                    <Trans>You don&apos;t have any order history</Trans>
                  )}
                </Text>
              </NoResultWrapper>
            )}
            {orders.length !== 0 && (
              <TableFooterWrapper>
                {isTabActive ? (
                  <ButtonCancelAll onClick={onCancelAllOrder} disabled={disabledBtnCancelAll}>
                    <Trash size={15} />
                    <Text marginLeft={'5px'}>
                      <Trans>Cancel All</Trans>
                    </Text>
                  </ButtonCancelAll>
                ) : (
                  <div />
                )}
                <Pagination
                  haveBg={false}
                  onPageChange={onPageChange}
                  totalCount={totalOrder}
                  currentPage={curPage}
                  pageSize={PAGE_SIZE}
                  style={{ padding: '0' }}
                />
              </TableFooterWrapper>
            )}
          </>
        )}
      </Flex>

      <CancelOrderModal
        isOpen={isOpenCancel}
        flowState={flowState}
        onDismiss={hideConfirmCancel}
        onSubmit={() => onCancelOrder(currentOrder)}
        order={currentOrder}
        isCancelAll={isCancelAll}
      />
      {currentOrder && (
        <EditOrderModal
          flowState={flowState}
          setFlowState={setFlowState}
          isOpen={isOpenEdit}
          onDismiss={hideEditModal}
          onCancelOrder={onUpdateOrder}
          refreshListOrder={refreshListOrder}
          order={currentOrder}
          note={t`Note: Your existing order will be automatically cancelled and a new order will be created.${
            currentOrder.status === LimitOrderStatus.PARTIALLY_FILLED
              ? ` Your currently existing order is ${calcPercentFilledOrder(
                  currentOrder.filledTakingAmount,
                  currentOrder.takingAmount,
                  currentOrder.takerAssetDecimals,
                )}% filled`
              : ''
          }`}
        />
      )}
    </>
  )
})
