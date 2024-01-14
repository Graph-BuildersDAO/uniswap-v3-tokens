import { ZERO_BD, ZERO_BI, ONE_BI } from './constants'
/* eslint-disable prefer-const */
import {
  Factory,
  Pool,
  Token,
  TokenDayData,
  TokenHourData,
  TokenMinuteData,
  Bundle
} from '../../generated/schema'
import { FACTORY_ADDRESS } from './constants'
import { ethereum, BigDecimal, store, BigInt } from '@graphprotocol/graph-ts'

/**
 * Tracks global aggregate data over daily windows
 * @param event
 */
export function updateTokenDayData(token: Token, event: ethereum.Event): TokenDayData {
  let bundle = Bundle.load('1')!
  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400
  let dayStartTimestamp = dayID * 86400
  let tokenDayID = token.id
    .toHexString()
    .concat('-')
    .concat(dayID.toString())
  let tokenPrice = token.derivedETH.times(bundle.ethPriceUSD)

  let tokenDayData = TokenDayData.load(tokenDayID)
  if (!tokenDayData) {
    tokenDayData = new TokenDayData(tokenDayID)
    tokenDayData.date = dayStartTimestamp
    tokenDayData.token = token.id
    tokenDayData.volume = ZERO_BD
    tokenDayData.volumeUSD = ZERO_BD
    tokenDayData.feesUSD = ZERO_BD
    tokenDayData.untrackedVolumeUSD = ZERO_BD
    tokenDayData.open = tokenPrice
    tokenDayData.high = tokenPrice
    tokenDayData.low = tokenPrice
    tokenDayData.close = tokenPrice
  }

  if (tokenPrice.gt(tokenDayData.high)) {
    tokenDayData.high = tokenPrice
  }

  if (tokenPrice.lt(tokenDayData.low)) {
    tokenDayData.low = tokenPrice
  }

  tokenDayData.close = tokenPrice
  tokenDayData.priceUSD = token.derivedETH.times(bundle.ethPriceUSD)
  tokenDayData.totalValueLocked = token.totalValueLocked
  tokenDayData.totalValueLockedUSD = token.totalValueLockedUSD
  tokenDayData.save()

  return tokenDayData as TokenDayData
}

export function updateTokenHourData(token: Token, event: ethereum.Event): TokenHourData {
  let bundle = Bundle.load('1')!
  let timestamp = event.block.timestamp.toI32()
  let hourIndex = timestamp / 3600 // get unique hour within unix history
  let hourStartUnix = hourIndex * 3600 // want the rounded effect
  let tokenHourID = token.id
    .toHexString()
    .concat('-')
    .concat(hourIndex.toString())
  let tokenHourData = TokenHourData.load(tokenHourID)
  let tokenPrice = token.derivedETH.times(bundle.ethPriceUSD)

  if (!tokenHourData) {
    tokenHourData = new TokenHourData(tokenHourID)
    tokenHourData.periodStartUnix = hourStartUnix
    tokenHourData.token = token.id
    tokenHourData.volume = ZERO_BD
    tokenHourData.volumeUSD = ZERO_BD
    tokenHourData.untrackedVolumeUSD = ZERO_BD
    tokenHourData.feesUSD = ZERO_BD
    tokenHourData.open = tokenPrice
    tokenHourData.high = tokenPrice
    tokenHourData.low = tokenPrice
    tokenHourData.close = tokenPrice
  }

  if (tokenPrice.gt(tokenHourData.high)) {
    tokenHourData.high = tokenPrice
  }

  if (tokenPrice.lt(tokenHourData.low)) {
    tokenHourData.low = tokenPrice
  }

  tokenHourData.close = tokenPrice
  tokenHourData.priceUSD = tokenPrice
  tokenHourData.totalValueLocked = token.totalValueLocked
  tokenHourData.totalValueLockedUSD = token.totalValueLockedUSD
  tokenHourData.save()

  let lastHourArchived = token.lastHourArchived.toI32()
  let lastHourRecorded = token.lastHourRecorded.toI32()
  let difference = lastHourRecorded - lastHourArchived;
  let interval = hourIndex - lastHourArchived -  768;
  if(interval > 0){
    if(difference > 0 && difference < interval){
      interval = difference
    }
    archiveHourData(BigInt.fromI32(lastHourArchived + interval), token) //cur
  }
  token.lastHourRecorded = BigInt.fromI32(hourIndex);
  token.save()
  

  return tokenHourData as TokenHourData
}

export function updateTokenMinuteData(token: Token, event: ethereum.Event): TokenMinuteData {
  let bundle = Bundle.load('1')!
  let timestamp = event.block.timestamp.toI32()
  let minuteIndex = timestamp / 60 // get unique hour within unix history
  let minuteStartUnix = minuteIndex * 60 // want the rounded effect
  let tokenDayID = token.id
    .toHexString()
    .concat('-')
    .concat(minuteIndex.toString())
  let tokenMinuteData = TokenMinuteData.load(tokenDayID)
  let tokenPrice = token.derivedETH.times(bundle.ethPriceUSD)

  if (!tokenMinuteData) {
    tokenMinuteData = new TokenMinuteData(tokenDayID)
    tokenMinuteData.periodStartUnix = minuteStartUnix
    tokenMinuteData.token = token.id
    tokenMinuteData.volume = ZERO_BD
    tokenMinuteData.volumeUSD = ZERO_BD
    tokenMinuteData.untrackedVolumeUSD = ZERO_BD
    tokenMinuteData.feesUSD = ZERO_BD
    tokenMinuteData.open = tokenPrice
    tokenMinuteData.high = tokenPrice
    tokenMinuteData.low = tokenPrice
    tokenMinuteData.close = tokenPrice
  }

  if (tokenPrice.gt(tokenMinuteData.high)) {
    tokenMinuteData.high = tokenPrice
  }

  if (tokenPrice.lt(tokenMinuteData.low)) {
    tokenMinuteData.low = tokenPrice
  }

  tokenMinuteData.close = tokenPrice
  tokenMinuteData.priceUSD = tokenPrice
  tokenMinuteData.totalValueLocked = token.totalValueLocked
  tokenMinuteData.totalValueLockedUSD = token.totalValueLockedUSD
  tokenMinuteData.save()

  let lastMinuteArchived = token.lastMinuteArchived.toI32()
  let lastMinuteRecorded = token.lastMinuteRecorded.toI32()
  let difference = lastMinuteRecorded - lastMinuteArchived;
  let interval = minuteIndex - lastMinuteArchived -  1680;
  if(interval > 0){
    if(difference > 0 && difference < interval){
      interval = difference
    }
    archiveMinuteData(BigInt.fromI32(lastMinuteArchived + interval), token)
  }

  token.lastMinuteRecorded =  BigInt.fromI32(minuteIndex);
  token.save()
  // Rolling deletion segment
   //current minute minus 10800 seconds (28 hours)
 
  return tokenMinuteData as TokenMinuteData
}

function archiveMinuteData(end: BigInt, token: Token): void {
  for (let interval = token.lastMinuteArchived; interval < end.plus(BigInt.fromI32(1)); interval.plus(BigInt.fromI32(1))) {
    let tokenDayID = token.id
    .toHexString()
    .concat('-')
    .concat(interval.toString())
    let tokenMinuteData = TokenMinuteData.load(tokenDayID)
    if (tokenMinuteData) {
      store.remove('TokenMinuteData', tokenMinuteData.id)
    }
  }

  token.lastMinuteArchived = end;
  token.save()
}

function archiveHourData(end: BigInt, token: Token): void {
  for (let interval = token.lastHourArchived; interval < end.plus(BigInt.fromI32(1)); interval.plus(BigInt.fromI32(1))) {
    let tokenHourID = token.id
    .toHexString()
    .concat('-')
    .concat(interval.toString())
    let tokenHourData = TokenHourData.load(tokenHourID)
    if (tokenHourData) {
      store.remove('TokenHourData', tokenHourData.id)
    }
  }
  
  token.lastHourArchived = end
  token.save()
}
