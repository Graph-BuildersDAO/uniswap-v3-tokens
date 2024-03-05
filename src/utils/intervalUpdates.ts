import {
  ZERO_BD,
  ROLL_DELETE_HOUR_LIMITER,
  ROLL_DELETE_MINUTE_LIMITER,
  ROLL_DELETE_MINUTE,
  ROLL_DELETE_HOUR,
  ZERO_BI
} from './constants'
/* eslint-disable prefer-const */
import { Token, TokenDayData, TokenHourData, TokenMinuteData, Bundle } from '../../generated/schema'
import { ethereum, store, BigInt, log } from '@graphprotocol/graph-ts'

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
    let tokenHourArray = token.hourArray
    tokenHourArray.push(hourIndex)
    token.hourArray = tokenHourArray
    token.save()
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

  if (token.lastHourArchived.equals(ZERO_BI) && token.lastHourRecorded.equals(ZERO_BI)) {
    token.lastHourRecorded = BigInt.fromI32(hourIndex)
    token.lastHourArchived = BigInt.fromI32(hourIndex - 1)
  }

  if (isNew) {
    let lastHourArchived = token.lastHourArchived.toI32()
    let stop = hourIndex - ROLL_DELETE_HOUR
    if (stop > lastHourArchived) {
      archiveHourData(token, stop) //cur
    }
    token.lastHourRecorded = BigInt.fromI32(hourIndex)
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
  let isNew = false
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
    let tokenMinuteArray = token.minuteArray
    tokenMinuteArray.push(minuteIndex)
    token.minuteArray = tokenMinuteArray
    token.save()
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

  if (token.lastMinuteArchived.equals(ZERO_BI) && token.lastMinuteRecorded.equals(ZERO_BI)) {
    token.lastMinuteRecorded = BigInt.fromI32(minuteIndex)
    token.lastMinuteArchived = BigInt.fromI32(minuteIndex - 1)
  }
  if (isNew) {
    let lastMinuteArchived = token.lastMinuteArchived.toI32()
    let stop = minuteIndex - ROLL_DELETE_MINUTE
    if (stop > lastMinuteArchived) {
      archiveMinuteData(token, stop)
    }

    token.lastMinuteRecorded = BigInt.fromI32(minuteIndex)
    token.save()
  }

  // Rolling deletion segment

  //current minute minus 10800 seconds (28 hours)

  return tokenMinuteData as TokenMinuteData
}

function archiveMinuteData(token: Token, end: i32): void {
  // log.warning('ARCHIVING MINUTE - {}   - TOKEN - {}', [token.lastMinuteArchived.toString(), token.id.toHexString()])
  let length = token.minuteArray.length
  let array = token.minuteArray
  let modArray = token.minuteArray
  let last = token.lastMinuteArchived.toI32()
  for (let i = 0; i < length; i++) {
    if (array[i] > end) {
      break
    }
    let tokenMinuteID = token.id
      .toHexString()
      .concat('-')
      .concat(array[i].toString())
    // let tokenMinuteData = TokenMinuteData.load(tokenMinuteID)
    // if (tokenMinuteData) {
    store.remove('TokenMinuteData', tokenMinuteID)
    // }
    modArray.shift()
    last = array[i]
    if (BigInt.fromI32(i + 1).equals(ROLL_DELETE_MINUTE_LIMITER)) {
      // log.warning('INTERVAL REACH - {} - LIMITER - {}', [tokenMinuteID, i.toString()])
      break
    }
  }
  if (modArray) {
    token.minuteArray = modArray
  } else {
    token.minuteArray = []
  }
  token.lastMinuteArchived = BigInt.fromI32(last - 1)
  token.save()
}

function archiveHourData(token: Token, end: i32): void {
  let length = token.hourArray.length

  let array = token.hourArray
  let modArray = token.hourArray
  let last = token.lastHourArchived.toI32()
  for (let i = 0; i < length; i++) {
    if (array[i] > end) {
      break
    }
    let tokenHourID = token.id
      .toHexString()
      .concat('-')
      .concat(array[i].toString())
    // let tokenMinuteData = TokenMinuteData.load(tokenMinuteID)
    // if (tokenMinuteData) {
    store.remove('TokenHourData', tokenHourID)
    // }
    modArray.shift()
    last = array[i]
    if (BigInt.fromI32(i + 1).equals(ROLL_DELETE_HOUR_LIMITER)) {
      // log.warning('INTERVAL REACH - {} - LIMITER - {}', [tokenMinuteID, i.toString()])
      break
    }
  }
  if (modArray) {
    token.hourArray = modArray
  } else {
    token.hourArray = []
  }
  token.lastHourArchived = BigInt.fromI32(last - 1)
  token.save()
}
