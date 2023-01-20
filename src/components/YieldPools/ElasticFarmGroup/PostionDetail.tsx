import { Currency, Price } from '@kyberswap/ks-sdk-core'
import { Trans, t } from '@lingui/macro'
import { BigNumber } from 'ethers'
import { Minus } from 'react-feather'
import { Flex, Text } from 'rebass'

import RangeBadge from 'components/Badge/RangeBadge'
import CurrencyLogo from 'components/CurrencyLogo'
import HoverDropdown from 'components/HoverDropdown'
import { MouseoverTooltipDesktopOnly } from 'components/Tooltip'
import useTheme from 'hooks/useTheme'
import { useElasticFarms, useFarmAction } from 'state/farms/elastic/hooks'
import { FarmingPool, NFTPosition } from 'state/farms/elastic/types'
import { formatDollarAmount } from 'utils/numbers'

import FeeTarget from './FeeTarget'
import { ButtonColorScheme, MinimalActionButton } from './buttons'
import { Dot, NFTWrapper, PriceVisualize } from './styleds'

type Props = {
  isRevertPrice: boolean
  price: Price<Currency, Currency>
  farmAddress: string
  pool: FarmingPool
  nftInfo: NFTPosition
  tokenPrices: { [key: string]: number }
  targetPercent: string
}
const PositionDetail = ({
  price,
  isRevertPrice,
  farmAddress,
  pool,
  targetPercent,
  nftInfo: item,
  tokenPrices,
}: Props) => {
  const theme = useTheme()

  const { userFarmInfo } = useElasticFarms()
  const joinedPositions = userFarmInfo?.[farmAddress]?.joinedPositions[pool.pid] || []
  const { unstake } = useFarmAction(farmAddress)

  const joinedInfo = joinedPositions.find(jp => jp.nftId.toString() === item.nftId.toString())

  const canUnstake = !!joinedInfo

  const positionValue =
    (tokenPrices[item.amount0.currency.address] || 0) * +item.amount0.toExact() +
    (tokenPrices[item.amount1.currency.address] || 0) * +item.amount1.toExact()

  const outOfRange = item.pool.tickCurrent < item.tickLower || item.pool.tickCurrent >= item.tickUpper

  const priceLower = !isRevertPrice ? item.token0PriceLower : item.token0PriceUpper.invert()
  const priceUpper = !isRevertPrice ? item.token0PriceUpper : item.token0PriceLower.invert()

  const rewardByNft = userFarmInfo?.[farmAddress]?.rewardByNft
  const rewards = rewardByNft?.[pool.pid + '_' + item.nftId.toString()] || []

  const rewardValue = rewards.reduce(
    (usd, am) => usd + +am.toExact() * (tokenPrices[am.currency.wrapped.address] || 0),
    0,
  )

  const minPrice = priceLower.lessThan(price) ? priceLower : price
  const maxPrice = priceUpper.greaterThan(price) ? priceUpper : price
  const middlePrice = priceLower.lessThan(price) ? (priceUpper.greaterThan(price) ? price : priceUpper) : priceLower

  const delta = middlePrice.subtract(minPrice).divide(maxPrice.subtract(minPrice)).toSignificant(6)

  const renderUnstakeButton = () => {
    if (!canUnstake) {
      return (
        <MinimalActionButton colorScheme={ButtonColorScheme.Red} disabled={!canUnstake}>
          <Minus size={16} />
        </MinimalActionButton>
      )
    }

    return (
      <MouseoverTooltipDesktopOnly
        text={t`Unstake your liquidity positions (i.e. your NFT tokens) from the farm`}
        placement="top"
        width="300px"
      >
        <MinimalActionButton
          colorScheme={ButtonColorScheme.Red}
          onClick={() =>
            unstake(BigNumber.from(pool.pid), [item.nftId], [BigNumber.from(joinedInfo.liquidity.toString())])
          }
        >
          <Minus size={16} />
        </MinimalActionButton>
      </MouseoverTooltipDesktopOnly>
    )
  }

  return (
    <NFTWrapper key={item.nftId.toString()}>
      <Flex alignItems="center" justifyContent="space-between" color={theme.subText}>
        <Flex alignItems="center" sx={{ gap: '4px' }} fontSize="14px" fontWeight="500">
          NFT ID <Text color={outOfRange ? theme.warning : theme.primary}>{item.nftId.toString()}</Text>
          <RangeBadge size={12} hideText removed={false} inRange={!outOfRange} />
        </Flex>
        {renderUnstakeButton()}
      </Flex>

      <Flex
        alignItems="center"
        justifyContent="space-between"
        marginTop="12px"
        color={theme.subText}
        fontSize="12px"
        fontWeight="500"
      >
        <Text>
          <Trans>My Deposit</Trans>
        </Text>
        <Text>
          <Trans>My Rewards</Trans>
        </Text>
      </Flex>

      <Flex
        alignItems="center"
        justifyContent="space-between"
        marginTop="4px"
        marginBottom={targetPercent ? '12px' : '0'}
      >
        <HoverDropdown
          style={{ padding: '0' }}
          content={
            <Text as="span" fontSize="16px" fontWeight="500">
              {formatDollarAmount(positionValue)}
            </Text>
          }
          dropdownContent={
            <>
              <Flex alignItems="center" key={item.amount0.currency.address}>
                <CurrencyLogo currency={item.amount0.currency} size="16px" />
                <Text fontSize="12px" marginLeft="4px" fontWeight="500">
                  {item.amount0.toSignificant(8)} {item.amount0.currency.symbol}
                </Text>
              </Flex>

              <Flex alignItems="center" key={item.amount1.currency.address}>
                <CurrencyLogo currency={item.amount1.currency} size="16px" />
                <Text fontSize="12px" marginLeft="4px" fontWeight="500">
                  {item.amount1.toSignificant(8)} {item.amount1.currency.symbol}
                </Text>
              </Flex>
            </>
          }
        />

        <HoverDropdown
          style={{ padding: '0' }}
          content={
            rewardValue ? (
              <Text as="span" fontSize="16px" fontWeight="500">
                {formatDollarAmount(rewardValue)}
              </Text>
            ) : (
              '--'
            )
          }
          hideIcon={!rewardValue}
          dropdownContent={rewards.map(rw => (
            <Flex alignItems="center" key={rw.currency.wrapped.address}>
              <CurrencyLogo currency={rw.currency} size="16px" />
              <Text fontSize="12px" marginLeft="4px" fontWeight="500">
                {rw.toSignificant(8)} {rw.currency.wrapped.symbol}
              </Text>
            </Flex>
          ))}
        />
      </Flex>

      {targetPercent && <FeeTarget percent={targetPercent} style={{ maxWidth: '100%' }} />}

      <PriceVisualize>
        <Flex width="20%" />
        <Dot isCurrentPrice={minPrice.equalTo(price)} outOfRange={outOfRange} />
        <Flex
          height="2px"
          width={(+delta * 60).toString() + '%'}
          backgroundColor={
            middlePrice.equalTo(priceUpper) ? theme.warning : middlePrice.equalTo(price) ? theme.primary : theme.border
          }
        />
        <Dot isCurrentPrice={middlePrice.equalTo(price)} outOfRange={outOfRange} />
        <Flex
          height="2px"
          flex={1}
          backgroundColor={
            middlePrice.equalTo(priceLower) ? theme.warning : middlePrice.equalTo(price) ? theme.primary : theme.border
          }
        />
        <Dot isCurrentPrice={maxPrice.equalTo(price)} outOfRange={outOfRange} />
        <Flex width="20%" />
      </PriceVisualize>

      <Flex justifyContent="space-between" fontSize="12px" fontWeight="500" marginTop="8px">
        <Text>
          <Text as="span" color={theme.subText}>
            <Trans>Min Price</Trans>:
          </Text>{' '}
          {priceLower.toSignificant(6)}
        </Text>
        <Text>
          <Text as="span" color={theme.subText}>
            <Trans>Max Price</Trans>:
          </Text>{' '}
          {priceUpper.toSignificant(6)}
        </Text>
      </Flex>
    </NFTWrapper>
  )
}

export default PositionDetail
