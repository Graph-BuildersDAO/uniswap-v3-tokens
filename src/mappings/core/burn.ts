import { Bundle, Factory, Pool, Token } from '../../../generated/schema'
import { BigInt } from '@graphprotocol/graph-ts'
import { Burn as BurnEvent } from '../../../generated/templates/Pool/Pool'
import { convertTokenToDecimal } from '../../utils'
import { FACTORY_ADDRESS, ONE_BI } from '../../utils/constants'
import { updateTokenDayData, updateTokenHourData, updateTokenMinuteData } from '../../utils/intervalUpdates'

export function handleBurn(event: BurnEvent): void {
  let bundle = Bundle.load('1')
  let poolAddress = event.address
  let pool = Pool.load(poolAddress)
  let factory = Factory.load(FACTORY_ADDRESS)
  if (pool && bundle && factory) {
    let token0 = Token.load(pool.token0)
    let token1 = Token.load(pool.token1)
    if (token0 && token1) {
      // reset tvl aggregates until new amounts calculated
      // KENT TODO: MOVE LOWER - AFTER CHECKING IF POOL APPROVED
      factory.totalValueLockedETH = factory.totalValueLockedETH.minus(pool.totalValueLockedETH)

      // update globals
      factory.txCount = factory.txCount.plus(ONE_BI)

      // update token0 data
      token0.txCount = token0.txCount.plus(ONE_BI)

      // update token1 data
      token1.txCount = token1.txCount.plus(ONE_BI)

      // pool data
      pool.txCount = pool.txCount.plus(ONE_BI)
      // Pools liquidity tracks the currently active liquidity given pools current tick.
      // We only want to update it on burn if the position being burnt includes the current tick.
      if (
        pool.tick &&
        BigInt.fromI32(event.params.tickLower).le(pool.tick as BigInt) &&
        BigInt.fromI32(event.params.tickUpper).gt(pool.tick as BigInt)
      ) {
        pool.liquidity = pool.liquidity.minus(event.params.amount)
      }

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
}
