import { Pair } from '@kyberswap/ks-sdk-classic'
import { Currency } from '@kyberswap/ks-sdk-core'
import { Trans } from '@lingui/macro'
import { darken, lighten, rgba } from 'polished'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import { ReactComponent as DropdownSVG } from 'assets/svg/down.svg'
import { ReactComponent as Lock } from 'assets/svg/ic_lock.svg'
import { ReactComponent as SwitchIcon } from 'assets/svg/switch.svg'
import Card from 'components/Card'
import CurrencyLogo from 'components/CurrencyLogo'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import Wallet from 'components/Icons/Wallet'
import { Input as NumericalInput } from 'components/NumericalInput'
import { RowFixed } from 'components/Row'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import { useActiveWeb3React } from 'hooks'
import useTheme from 'hooks/useTheme'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useCurrencyConvertedToNative } from 'utils/dmm'
import { shortString } from 'utils/string'

export const InputRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
`

const StyledSwitchIcon = styled(SwitchIcon)<{ selected: boolean }>`
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.subText : theme.primary)};
  }
`

export const CurrencySelect = styled.button<{ selected: boolean; hideInput?: boolean; isDisable?: boolean }>`
  align-items: center;
  height: ${({ hideInput }) => (hideInput ? '2.5rem' : 'unset')};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  font-size: 20px;
  font-weight: 500;
  background-color: ${({ theme, hideInput }) => (hideInput ? theme.buttonBlack : theme.background)};
  border: 1px solid ${({ theme, selected }) => (selected ? 'transparent' : theme.primary)} !important;
  color: ${({ selected, theme }) => (selected ? theme.subText : theme.primary)};
  border-radius: 999px;
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  padding: 6px 8px;
  padding-right: ${({ hideInput }) => (hideInput ? '8px' : 0)};
  cursor: ${({ isDisable: disabled }) => (disabled ? 'default' : 'pointer')};
  :focus,
  :hover {
    background-color: ${({ selected, hideInput, theme, isDisable: disabled }) =>
      selected
        ? hideInput
          ? darken(disabled ? 0 : 0.05, theme.buttonBlack)
          : lighten(disabled ? 0 : 0.05, theme.background)
        : darken(0.05, theme.primary)};
    color: ${({ selected, theme }) => (selected ? theme.subText : theme.textReverse)};
  }
`

export const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  background-color: ${({ theme, hideInput }) => (hideInput ? 'transparent' : theme.bg2)};
  z-index: 1;
`

const FixedContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.buttonGray};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`

export const Container = styled.div<{ selected: boolean; hideInput: boolean; error?: boolean }>`
  border-radius: 16px;
  background-color: ${({ theme, hideInput }) => (hideInput ? 'transparent' : theme.buttonBlack)};
  padding: ${({ hideInput }) => (hideInput ? 0 : '0.75rem')};
  border: ${({ error, theme }) => (error ? `1px solid ${theme.red}` : 'none')};
`

export const StyledTokenName = styled.span<{ active?: boolean; fontSize?: string }>`
  margin-left: 0.5rem;
  font-size: ${({ active, fontSize }) => (fontSize ? fontSize : active ? '20px' : '16px')};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media only screen and (max-width: 445px) {
    max-width: 102px;
  }

  @media only screen and (max-width: 420px) {
    max-width: 76px;
  }
`

const StyledBalanceMax = styled.button`
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${({ theme }) => rgba(theme.subText, 0.2)};
  color: ${({ theme }) => theme.subText};
  border: none;
  border-radius: 999px;
  cursor: pointer;
  &:focus-visible {
    outline-width: 0;
  }
`

const Card2 = styled(Card)<{ balancePosition: string }>`
  padding: 0 0.25rem 0.5rem;
  text-align: ${({ balancePosition }) => `${balancePosition}`};
`

interface CurrencyInputPanelProps {
  value: string
  onMax: (() => void) | null
  onHalf: (() => void) | null
  onUserInput?: (value: string) => void
  positionMax?: 'inline' | 'top'
  label?: string
  onCurrencySelect?: (currency: Currency) => void
  onSwitchCurrency?: () => void
  currency?: Currency | null
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  disabledInput?: boolean
  otherCurrency?: Currency | null
  id: string
  showCommonBases?: boolean
  customBalanceText?: string
  balancePosition?: string
  hideLogo?: boolean
  fontSize?: string
  customCurrencySelect?: ReactNode
  estimatedUsd?: string
  isSwitchMode?: boolean
  locked?: boolean
  maxCurrencySymbolLength?: number
  error?: boolean
  maxLength?: number
  filterWrap?: boolean
}

export default function CurrencyInputPanel({
  value,
  error,
  onUserInput = (value: string) => {
    //
  },
  onMax,
  onHalf,
  positionMax = 'inline',
  label = '',
  onCurrencySelect,
  onSwitchCurrency,
  currency,
  disableCurrencySelect = false,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  disabledInput = false,
  otherCurrency,
  id,
  showCommonBases,
  customBalanceText,
  balancePosition = 'right',
  hideLogo = false,
  fontSize,
  customCurrencySelect,
  estimatedUsd,
  isSwitchMode = false,
  locked = false,
  maxCurrencySymbolLength,
  maxLength,
  filterWrap,
}: CurrencyInputPanelProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { chainId, account } = useActiveWeb3React()

  const selectedCurrencyBalance = useCurrencyBalance(currency ?? undefined)
  const balanceRef = useRef(selectedCurrencyBalance?.toSignificant(10))

  useEffect(() => {
    balanceRef.current = undefined
  }, [chainId])

  // Keep previous value of balance if rpc node was down
  useEffect(() => {
    if (!!selectedCurrencyBalance) balanceRef.current = selectedCurrencyBalance.toSignificant(10)
    if (!currency || !account) balanceRef.current = '0'
  }, [selectedCurrencyBalance, currency, account])

  const theme = useTheme()

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  const nativeCurrency = useCurrencyConvertedToNative(currency || undefined)

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <Card2 borderRadius={'20px'} balancePosition={balancePosition}>
          <Flex justifyContent={label ? 'space-between' : 'end'} alignItems="center">
            {label && (
              <Text fontSize={12} color={theme.subText} fontWeight={500}>
                {label}:
              </Text>
            )}
          </Flex>
        </Card2>
      )}
      <InputPanel id={id} hideInput={hideInput}>
        {locked && (
          <FixedContainer>
            <Flex padding={'0 20px'} sx={{ gap: '16px' }}>
              <div style={{ width: '26px', margin: 'auto' }}>
                <Lock />
              </div>
              <Text fontSize="12px" textAlign="left" padding="8px 16px" lineHeight={'16px'}>
                <Trans>
                  The price of the pool is outside your selected price range and hence you can only deposit a single
                  token. To see more options, update the price range.
                </Trans>
              </Text>
            </Flex>
          </FixedContainer>
        )}
        <Container hideInput={hideInput} selected={disableCurrencySelect} error={error}>
          {!hideBalance && (
            <Flex justifyContent="space-between" fontSize="12px" marginBottom="12px" alignItems="center">
              {(onMax || onHalf) && positionMax === 'top' && currency && account ? (
                <Flex alignItems="center" sx={{ gap: '4px' }}>
                  {onMax && (
                    <StyledBalanceMax onClick={onMax}>
                      <Trans>Max</Trans>
                    </StyledBalanceMax>
                  )}
                  {onHalf && (
                    <StyledBalanceMax onClick={onHalf}>
                      <Trans>Half</Trans>
                    </StyledBalanceMax>
                  )}
                </Flex>
              ) : (
                <div />
              )}
              <Flex onClick={onMax ?? undefined} style={{ cursor: onMax ? 'pointer' : undefined }} alignItems="center">
                <Wallet color={theme.subText} />
                <Text fontWeight={500} color={theme.subText} marginLeft="4px">
                  {customBalanceText || selectedCurrencyBalance?.toSignificant(10) || balanceRef.current || 0}
                </Text>
              </Flex>
            </Flex>
          )}
          <InputRow>
            {!hideInput && (
              <>
                <NumericalInput
                  error={error}
                  className="token-amount-input"
                  value={value}
                  disabled={disabledInput}
                  maxLength={maxLength}
                  onUserInput={val => {
                    onUserInput(val)
                  }}
                />
                {estimatedUsd ? (
                  <Text fontSize="0.875rem" marginRight="8px" fontWeight="500" color={theme.border}>
                    ~{estimatedUsd}
                  </Text>
                ) : (
                  account &&
                  currency &&
                  onMax &&
                  positionMax === 'inline' && (
                    <StyledBalanceMax onClick={onMax ?? undefined}>
                      <Trans>MAX</Trans>
                    </StyledBalanceMax>
                  )
                )}
              </>
            )}
            {customCurrencySelect || (
              <CurrencySelect
                isDisable={disableCurrencySelect}
                hideInput={hideInput}
                selected={!!currency}
                className="open-currency-select-button"
                onClick={() => {
                  if (!disableCurrencySelect && !isSwitchMode) {
                    setModalOpen(true)
                  } else if (!disableCurrencySelect && isSwitchMode && onSwitchCurrency) {
                    onSwitchCurrency()
                  }
                }}
              >
                <Aligner>
                  <RowFixed>
                    {hideLogo ? null : pair ? (
                      <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={20} margin={true} />
                    ) : currency ? (
                      <CurrencyLogo currency={currency || undefined} size={'20px'} />
                    ) : null}
                    {pair ? (
                      <StyledTokenName className="pair-name-container">
                        {pair?.token0.symbol}:{pair?.token1.symbol}
                      </StyledTokenName>
                    ) : (
                      <StyledTokenName
                        className="token-symbol-container"
                        active={Boolean(currency && currency.symbol)}
                        fontSize={fontSize}
                        style={{ paddingRight: disableCurrencySelect ? '8px' : 0 }}
                      >
                        {(nativeCurrency?.symbol && maxCurrencySymbolLength
                          ? shortString(nativeCurrency.symbol, maxCurrencySymbolLength)
                          : nativeCurrency?.symbol) || <Trans>Select a token</Trans>}
                      </StyledTokenName>
                    )}
                  </RowFixed>
                  {!disableCurrencySelect && !isSwitchMode && <DropdownSVG />}
                  {!disableCurrencySelect && isSwitchMode && <StyledSwitchIcon selected={!!currency} />}
                </Aligner>
              </CurrencySelect>
            )}
          </InputRow>
        </Container>
        {!disableCurrencySelect && !isSwitchMode && onCurrencySelect && (
          <CurrencySearchModal
            isOpen={modalOpen}
            onDismiss={handleDismissSearch}
            onCurrencySelect={onCurrencySelect}
            selectedCurrency={currency}
            otherSelectedCurrency={otherCurrency}
            showCommonBases={showCommonBases}
            filterWrap={filterWrap}
          />
        )}
      </InputPanel>
    </div>
  )
}
