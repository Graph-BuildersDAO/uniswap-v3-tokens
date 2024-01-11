import { Token } from '../../../generated/schema'
import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { Mint as MintEvent } from '../../../generated/templates/Pool/Pool'
import { convertTokenToDecimal } from '../../utils'
import { ONE_BI } from '../../utils/constants'
import { updateTokenDayData, updateTokenHourData, updateTokenMinuteData } from '../../utils/intervalUpdates'
import { getBundle, getFactory, getPool } from '../../utils/entityGetters'

export function handleMint(event: MintEvent): void {
  let bundle = getBundle()
  let poolAddress = event.address
  let pool = getPool(poolAddress)
  let factory = getFactory()

  let token0 = Token.load(pool.token0)
  let token1 = Token.load(pool.token1)

  let amount0 = BigDecimal.zero()
  let amount1 = BigDecimal.zero()
  if (token0 && token1) {
    amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals)
    amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals)

    // reset tvl aggregates until new amounts calculated
    // KENT TODO: MOVE LOWER - AFTER CHECKING IF POOL APPROVED
    factory.totalValueLockedETH = factory.totalValueLockedETH.minus(pool.totalValueLockedETH)

    //update position

    // update globals
    factory.txCount = factory.txCount.plus(ONE_BI)

    // update token0 data
    token0.txCount = token0.txCount.plus(ONE_BI)
    token0.totalValueLocked = token0.totalValueLocked.plus(amount0)
    token0.totalValueLockedUSD = token0.totalValueLocked.times(token0.derivedETH.times(bundle.ethPriceUSD))

    // KENT TODO: CHECK IF APPROVED POOL HERE
    // update token1 data
    token1.txCount = token1.txCount.plus(ONE_BI)
    token1.totalValueLocked = token1.totalValueLocked.plus(amount1)
    token1.totalValueLockedUSD = token1.totalValueLocked.times(token1.derivedETH.times(bundle.ethPriceUSD))

    // pool data
    pool.txCount = pool.txCount.plus(ONE_BI)

    // Pools liquidity tracks the currently active liquidity given pools current tick.
    // We only want to update it on mint if the new position includes the current tick.
    if (
      pool.tick &&
      BigInt.fromI32(event.params.tickLower).le(pool.tick as BigInt) &&
      BigInt.fromI32(event.params.tickUpper).gt(pool.tick as BigInt)
    ) {
      pool.liquidity = pool.liquidity.plus(event.params.amount)
    }

    pool.totalValueLockedToken0 = pool.totalValueLockedToken0.plus(amount0)
    pool.totalValueLockedToken1 = pool.totalValueLockedToken1.plus(amount1)
    pool.totalValueLockedETH = pool.totalValueLockedToken0
      .times(token0.derivedETH)
      .plus(pool.totalValueLockedToken1.times(token1.derivedETH))
    pool.totalValueLockedUSD = pool.totalValueLockedETH.times(bundle.ethPriceUSD)

    // reset aggregates with new amounts
    // KENT TODO: MOVE LOWER - AFTER CHECKING IF POOL APPROVED
    factory.totalValueLockedETH = factory.totalValueLockedETH.plus(pool.totalValueLockedETH)
    factory.totalValueLockedUSD = factory.totalValueLockedETH.times(bundle.ethPriceUSD)

    updateTokenDayData(token0 as Token, event)
    updateTokenDayData(token1 as Token, event)
    updateTokenHourData(token0 as Token, event)
    updateTokenHourData(token1 as Token, event)
    updateTokenMinuteData(token0 as Token, event)
    updateTokenMinuteData(token1 as Token, event)

    token0.save()
    token1.save()
    pool.save()
    factory.save()
  }
}
