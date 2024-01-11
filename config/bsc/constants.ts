import { BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'
import { Factory as FactoryContract } from '../../generated/templates/Pool/Factory'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const FACTORY_ADDRESS = Address.fromString('0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7')
export const NONFUNGIBLE_POSITION_MANAGER = '0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613'

export const ZERO_BI = BigInt.fromI32(0)
export const ONE_BI = BigInt.fromI32(1)
export const ZERO_BD = BigDecimal.fromString('0')
export const ONE_BD = BigDecimal.fromString('1')
export const BI_18 = BigInt.fromI32(18)

export const factoryContract = FactoryContract.bind(FACTORY_ADDRESS)

export const REFERENCE_TOKEN = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c' // WBNB
export const STABLE_TOKEN_POOL = '0x6fe9e9de56356f7edbfcbb29fab7cd69471a4869' // WBNB/USDT 0.05%

// token where amounts should contribute to tracked volume and liquidity
// usually tokens that many tokens are paired with s
export const WHITELIST_TOKENS: string[] = [
  REFERENCE_TOKEN, // WETH
  '0xe9e7cea3dedca5984780bafc599bd69add087d56', // BUSD
  '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC
  '0x55d398326f99059ff775485246999027b3197955' // USDT
]

export const STABLE_COINS: string[] = ['0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d','0x55d398326f99059ff775485246999027b3197955','0xe9e7cea3dedca5984780bafc599bd69add087d56']

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
