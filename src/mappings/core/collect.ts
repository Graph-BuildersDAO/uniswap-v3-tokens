/* eslint-disable prefer-const */
import { Collect as CollectEvent } from '../../../generated/templates/Pool/Pool'
import { convertTokenToDecimal } from '../../utils'
import { ONE_BI, ZERO_BD } from '../../utils/constants'
import { getBundle, getFactory, getPool, getToken } from '../../utils/entityGetters'
import { getTrackedAmountUSD } from '../../utils/pricing'
import { BigDecimal } from '@graphprotocol/graph-ts'

// @TODO Prior NonfungiblePositionManager Collect code, to be updated to Pool collect code
export function handleCollect(event: CollectEvent): void {
  let bundle = getBundle()
  let factory = getFactory()
  let pool = getPool(event.address)
  let token0 = getToken(pool.token0)
  let token1 = getToken(pool.token1)

  // reset aggregate tvl before individual pool tvl updates
  let currentPoolTvlETH = pool.totalValueLockedETH
  // KENT TODO: MOVE LOWER - AFTER CHECKING IF POOL APPROVED
  factory.totalValueLockedETH = factory.totalValueLockedETH.minus(currentPoolTvlETH)

  let amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals)
  let amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals)

  // pool data
  pool.txCount = pool.txCount.plus(ONE_BI)

  let tvlToken0 = pool.totalValueLockedToken0.minus(amount0)
  if (tvlToken0.lt(ZERO_BD)) {
    tvlToken0 = tvlToken0.times(BigDecimal.fromString('-1'))
  }
  let tvlToken1 = pool.totalValueLockedToken1.minus(amount1)
  if (tvlToken1.lt(ZERO_BD)) {
    tvlToken1 = tvlToken1.times(BigDecimal.fromString('-1'))
  }
  pool.totalValueLockedToken0 = tvlToken0
  pool.totalValueLockedToken1 = tvlToken1
  pool.totalValueLockedETH = pool.totalValueLockedToken0
    .times(token0.derivedETH)
    .plus(pool.totalValueLockedToken1.times(token1.derivedETH))
  pool.totalValueLockedUSD = pool.totalValueLockedETH.times(bundle.ethPriceUSD)
  // KENT TODO: MOVE LOWER - AFTER CHECKING IF POOL APPROVED
  factory.totalValueLockedETH = factory.totalValueLockedETH.plus(pool.totalValueLockedETH)
  factory.totalValueLockedUSD = factory.totalValueLockedETH.times(bundle.ethPriceUSD)

  factory.save()
  pool.save()
}
