import { BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'
import { Factory as FactoryContract } from '../../generated/templates/Pool/Factory'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const FACTORY_ADDRESS = Address.fromString('0x1F98431c8aD98523631AE4a59f267346ea31F984')
export const NONFUNGIBLE_POSITION_MANAGER = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'

export const ZERO_BI = BigInt.fromI32(0)
export const ONE_BI = BigInt.fromI32(1)
export const ZERO_BD = BigDecimal.fromString('0')
export const ONE_BD = BigDecimal.fromString('1')
export const BI_18 = BigInt.fromI32(18)

export const factoryContract = FactoryContract.bind(FACTORY_ADDRESS)

export const REFERENCE_TOKEN = '0x4200000000000000000000000000000000000006'
export const STABLE_TOKEN_POOL = '0x85149247691df622eaf1a8bd0cafd40bc45154a9' // WETH/USDC 0.05%
export const MINIMUM_NATIVE_LOCKED_USD = BigDecimal.fromString('150000')

export const ROLL_DELETE_HOUR = 768
export const ROLL_DELETE_MINUTE = 1680

export const ROLL_DELETE_HOUR_LIMITER = BigInt.fromI32(500)
export const ROLL_DELETE_MINUTE_LIMITER = BigInt.fromI32(1000)

// token where amounts should contribute to tracked volume and liquidity
// usually tokens that many tokens are paired with s
export const WHITELIST_TOKENS: string[] = [
  REFERENCE_TOKEN, // WETH
  '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1', // DAI
  '0x7f5c764cbc14f9669b88837ca1490cca17c31607', // USDC Bridged
  '0x0b2c639c533813f4aa9d7837caf62653d097ff85', // USDC Native
  '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58' // USDT
]

export const STABLE_COINS: string[] = [
  '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
  '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  '0x7F5c764cBc14f9669B88837ca1490cCa17c31607'
]

export class StaticTokenDefinition {
  address: Address
  symbol: string
  name: string
  decimals: BigInt

  // Initialize a Token Definition with its attributes
  constructor(address: Address, symbol: string, name: string, decimals: BigInt) {
    this.address = address
    this.symbol = symbol
    this.name = name
    this.decimals = decimals
  }

  // Get all tokens with a static defintion
  static getStaticDefinitions(): Array<StaticTokenDefinition> {
    const staticDefinitions = new Array<StaticTokenDefinition>(6)

    // Add WETH
    const tokenWETH = new StaticTokenDefinition(
      Address.fromString('0x82af49447d8a07e3bd95bd0d56f35241523fbab1'),
      'WETH',
      'Wrapped Ethereum',
      BigInt.fromI32(18)
    )
    staticDefinitions.push(tokenWETH)

    return staticDefinitions
  }
  // Helper for hardcoded tokens
  static fromAddress(tokenAddress: Address): StaticTokenDefinition | null {
    const staticDefinitions = this.getStaticDefinitions()
    const tokenAddressHex = tokenAddress.toHexString()

    // Search the definition using the address
    for (let i = 0; i < staticDefinitions.length; i++) {
      const staticDefinition = staticDefinitions[i]
      if (staticDefinition.address.toHexString() == tokenAddressHex) {
        return staticDefinition
      }
    }

    // If not found, return null
    return null
  }
}
