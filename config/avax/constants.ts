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

export const REFERENCE_TOKEN = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'
export const STABLE_TOKEN_POOL = '0xfae3f424a0a47706811521e3ee268f00cfb5c45e'

export const ROLL_DELETE_HOUR = 768
export const ROLL_DELETE_MINUTE = 1680

export const ROLL_DELETE_HOUR_LIMITER = BigInt.fromI32(500)
export const ROLL_DELETE_MINUTE_LIMITER = BigInt.fromI32(1000)

// token where amounts should contribute to tracked volume and liquidity
// usually tokens that many tokens are paired with s
export const WHITELIST_TOKENS: string[] = [
  REFERENCE_TOKEN, // WETH
  '0xd586e7f844cea2f87f50152665bcbc2c279d8d70', // dai.e
  '0xba7deebbfc5fa1100fb055a87773e1e99cd3507a', // dai
  '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664', // usdc.e
  '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', // usdc
  '0xc7198437980c041c805a1edcba50c1ce5db95118', // usdt.e
  '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7', // usdt
  '0x130966628846bfd36ff31a822705796e8cb8c18d' // mim
]

export const STABLE_COINS: string[] = [
  '0xd586e7f844cea2f87f50152665bcbc2c279d8d70', // dai.e
  '0xba7deebbfc5fa1100fb055a87773e1e99cd3507a', // dai
  '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664', // usdc.e
  '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', // usdc
  '0xc7198437980c041c805a1edcba50c1ce5db95118', // usdt.e
  '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7' // usdt
]

// Initialize a Token Definition with the attributes
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
