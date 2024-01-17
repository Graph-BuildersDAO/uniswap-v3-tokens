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

export const REFERENCE_TOKEN = '0x471ece3750da237f93b8e339c536989b8978a438'
export const STABLE_TOKEN_POOL = '0x079e7a44f42e9cd2442c3b9536244be634e8f888'
export const MINIMUM_NATIVE_LOCKED_USD = BigDecimal.fromString('75000')

export const ROLL_DELETE_HOUR = 768
export const ROLL_DELETE_MINUTE = 1680

export const ROLL_DELETE_HOUR_LIMITER = BigInt.fromI32(500)
export const ROLL_DELETE_MINUTE_LIMITER = BigInt.fromI32(1000)

// token where amounts should contribute to tracked volume and liquidity
// usually tokens that many tokens are paired with s
export const WHITELIST_TOKENS: string[] = [
  REFERENCE_TOKEN, // WETH
  '0x66803fb87abd4aac3cbb3fad7c3aa01f6f3fb207', // WETH
  '0x471ece3750da237f93b8e339c536989b8978a438', // CELO
  '0xd71ffd0940c920786ec4dbb5a12306669b5b81ef', // WBTC
  '0x37f750b7cc259a2f741af45294f6a16572cf5cad', // USDC
  '0x765de816845861e75a25fca122bb6898b8b1282a' // cUSDC
]

export const STABLE_COINS: string[] = [
  '0x765de816845861e75a25fca122bb6898b8b1282a', //cUSD
  '0x37f750b7cc259a2f741af45294f6a16572cf5cad' //USDC
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
      Address.fromString('0x66803fb87abd4aac3cbb3fad7c3aa01f6f3fb207'),
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
