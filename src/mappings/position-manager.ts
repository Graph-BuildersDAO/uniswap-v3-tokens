/* eslint-disable prefer-const */
import {
  Collect,
  DecreaseLiquidity,
  IncreaseLiquidity,
  NonfungiblePositionManager,
  Transfer
} from '../../generated/NonfungiblePositionManager/NonfungiblePositionManager'
import { ADDRESS_ZERO } from '../utils/constants'
import { Address, BigDecimal, BigInt, ethereum, log } from '@graphprotocol/graph-ts'
import { convertTokenToDecimal } from '../utils'
import { getPool } from '../utils/entityGetters'
