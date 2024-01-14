import { ZERO_BD, ROLL_DELETE_HOUR_LIMITER, ROLL_DELETE_MINUTE_LIMITER, ROLL_DELETE_MINUTE, ROLL_DELETE_HOUR } from './constants'
/* eslint-disable prefer-const */
import { Token, TokenDayData, TokenHourData, TokenMinuteData, Bundle } from '../../generated/schema'
import { ethereum, store, BigInt } from '@graphprotocol/graph-ts'

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
    tokenDayData.periodStartUnix = dayStartTimestamp
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
  let isNew = false
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
    isNew = true
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

  if(isNew){
    let lastHourArchived = token.lastHourArchived.toI32()
    let lastHourRecorded = token.lastHourRecorded.toI32()
    let interval = hourIndex - lastHourArchived -  ROLL_DELETE_HOUR;
    if(interval > 0){
    let difference = lastHourRecorded - lastHourArchived;
    let lastRecordedDiff = hourIndex - lastHourRecorded -  ROLL_DELETE_HOUR;
    
    
      if(interval > difference && lastRecordedDiff > 0){
        interval = difference
      }
      archiveHourData(BigInt.fromI32(lastHourArchived + interval), token) //cur
    }
    token.lastHourRecorded = BigInt.fromI32(hourIndex);
    token.save()
  }
  

  return tokenHourData as TokenHourData
}

export function updateTokenMinuteData(token: Token, event: ethereum.Event): TokenMinuteData {
  let bundle = Bundle.load('1')!
  let timestamp = event.block.timestamp.toI32()
  let minuteIndex = timestamp / 60 // get unique hour within unix history
  let minuteStartUnix = minuteIndex * 60 // want the rounded effect
  let tokenMinuteID = token.id
    .toHexString()
    .concat('-')
    .concat(minuteIndex.toString())
  let tokenMinuteData = TokenMinuteData.load(tokenMinuteID)
  let tokenPrice = token.derivedETH.times(bundle.ethPriceUSD)
  let isNew = false;
  if (!tokenMinuteData) {
    tokenMinuteData = new TokenMinuteData(tokenMinuteID)
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
    isNew = true
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
  if(isNew){
    let lastMinuteArchived = token.lastMinuteArchived.toI32()
    let lastMinuteRecorded = token.lastMinuteRecorded.toI32()
    let interval = minuteIndex - lastMinuteArchived -  ROLL_DELETE_MINUTE;
    if(interval > 0){
    let lastRecordedDiff = minuteIndex - lastMinuteRecorded -  ROLL_DELETE_MINUTE;
    let difference = lastMinuteRecorded - lastMinuteArchived;
   
   
      if(interval > difference && lastRecordedDiff > 0){
        interval = difference
      }
      archiveMinuteData(BigInt.fromI32(lastMinuteArchived + interval), token)
    }
  
    token.lastMinuteRecorded =  BigInt.fromI32(minuteIndex);
    token.save()
  }
  
  // Rolling deletion segment

   //current minute minus 10800 seconds (28 hours)

  return tokenMinuteData as TokenMinuteData
}

function archiveMinuteData(end: BigInt, token: Token): void {
  let limiter = token.lastMinuteArchived
  for (let interval = token.lastMinuteArchived; interval < end; interval.plus(BigInt.fromI32(1))) {
    let tokenMinuteID = token.id
    .toHexString()
    .concat('-')
    .concat(interval.toString())
    let tokenMinuteData = TokenMinuteData.load(tokenMinuteID)
    if (tokenMinuteData) {
      store.remove('TokenMinuteData', tokenMinuteID)
    }
    if(interval.equals(token.lastMinuteArchived.plus(ROLL_DELETE_MINUTE_LIMITER))){
      break
    }
    limiter = limiter.plus(BigInt.fromI32(1))
  }

  token.lastMinuteArchived = limiter;
  token.save()
}

function archiveHourData(end: BigInt, token: Token): void {
  let limiter = token.lastHourArchived
  for (let interval = token.lastHourArchived; interval < end; interval.plus(BigInt.fromI32(1))) {
    let tokenHourID = token.id
    .toHexString()
    .concat('-')
    .concat(interval.toString())
    let tokenHourData = TokenHourData.load(tokenHourID)
    if (tokenHourData) {
      store.remove('TokenHourData', tokenHourID)
    }
    if(interval.equals(token.lastHourArchived.plus(ROLL_DELETE_HOUR_LIMITER))){
      break
    }
    limiter = limiter.plus(BigInt.fromI32(1))
  }
  
  token.lastHourArchived = limiter
  token.save()
}
