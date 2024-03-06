/* eslint-disable prefer-const */
import { ONE_BD, STABLE_TOKEN_POOL, REFERENCE_TOKEN, ZERO_BD, ZERO_BI } from './constants'
import { Bundle, Pool, Token } from '../../generated/schema'
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { exponentToBigDecimal, safeDiv } from './index'
import { STABLE_COINS, WHITELIST_TOKENS } from './constants'

let Q192 = BigInt.fromI32(2).pow(192 as u8)

export function sqrtPriceX96ToTokenPrices(sqrtPriceX96: BigInt, token0: Token, token1: Token): BigDecimal[] {
  let num = sqrtPriceX96.times(sqrtPriceX96).toBigDecimal()
  let denom = BigDecimal.fromString(Q192.toString())
  let price1 = safeDiv(
    safeDiv(num, denom).times(exponentToBigDecimal(token0.decimals)),
    exponentToBigDecimal(token1.decimals)
  )

  let price0 = safeDiv(BigDecimal.fromString('1'), price1)
  return [price0, price1]
}

export function getEthPriceInUSD(): BigDecimal {
  // fetch eth prices for each stablecoin
 // fetch eth prices for each stablecoin
 let usdcPool = Pool.load(Address.fromString(STABLE_TOKEN_POOL)) // dai is token0
 if (usdcPool) {
   if(usdcPool.token0 == Address.fromString(REFERENCE_TOKEN)) 
     return usdcPool.token1Price
   else 
     return usdcPool.token0Price
 } else {
   return ZERO_BD
 }
}

/**
 * Search through graph to find derived Eth per token.
 * @todo update to be derived ETH (add stablecoin estimates)
 **/
export function findEthPerToken(token: Token): BigDecimal {
  if (token.id == Address.fromString(REFERENCE_TOKEN)) {
    return ONE_BD
  }
  let whiteList = token.whitelistPools
  // for now just take USD from pool with greatest TVL
  // need to update this to actually detect best rate based on liquidity distribution
  let priceSoFar = ZERO_BD
  let bundle = Bundle.load('1')!
  // hardcoded fix for incorrect rates
  // if whitelist includes token - get the safe price
  if (STABLE_COINS.includes(token.id.toHexString())) {
    priceSoFar = safeDiv(ONE_BD, bundle.ethPriceUSD)
  } else {
    for (let i = 0; i < whiteList.length; ++i) {
      let poolAddress = whiteList[i]
      let pool = Pool.load(poolAddress)
      if (pool) {
        if (pool.liquidity.gt(ZERO_BI)) {
          if (pool.token0 == token.id) {
            // whitelist token is token1
            let token1 = Token.load(pool.token1)
            if (token1) {
                // token1 per our token * Eth per token1
                priceSoFar = pool.token1Price.times(token1.derivedETH as BigDecimal)
            }
          }
          if (pool.token1 == token.id) {
            let token0 = Token.load(pool.token0)
            if (token0) {
                // token0 per our token * ETH per token0
                priceSoFar = pool.token0Price.times(token0.derivedETH as BigDecimal)
            }
          }
        }
      }
    }
  }
  return priceSoFar // nothing was found return 0
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
export function getTrackedAmountUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token
): BigDecimal {
  let bundle = Bundle.load('1')!
  let price0USD = token0.derivedETH.times(bundle.ethPriceUSD)
  let price1USD = token1.derivedETH.times(bundle.ethPriceUSD)

  // both are whitelist tokens, return sum of both amounts
  if (WHITELIST_TOKENS.includes(token0.id.toHexString()) && WHITELIST_TOKENS.includes(token1.id.toHexString())) {
    return tokenAmount0.times(price0USD).plus(tokenAmount1.times(price1USD))
  }

  // take double value of the whitelisted token amount
  if (WHITELIST_TOKENS.includes(token0.id.toHexString()) && !WHITELIST_TOKENS.includes(token1.id.toHexString())) {
    return tokenAmount0.times(price0USD).times(BigDecimal.fromString('2'))
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST_TOKENS.includes(token0.id.toHexString()) && WHITELIST_TOKENS.includes(token1.id.toHexString())) {
    return tokenAmount1.times(price1USD).times(BigDecimal.fromString('2'))
  }

  // neither token is on white list, tracked amount is 0
  return ZERO_BD
}
