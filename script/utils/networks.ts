
interface NetworkConfig {
    studioEndpoint: string,
    hostedEndpoint: string
}
export interface NetworkConfigs {
[networkId: string]: NetworkConfig;
}


export const networks : NetworkConfigs=  {
    "arbitrum-one": {
        studioEndpoint: "univ3-tokens-arbitrum",
        hostedEndpoint: "univ3-tokens-arbitrum"
    },
    "ethereum": {
        studioEndpoint: "univ3-tokens-ethereum",
        hostedEndpoint: "univ3-tokens-ethereum"
    },
    "avax": {
        studioEndpoint: "univ3-tokens-avax",
        hostedEndpoint: "univ3-tokens-avax"
    },
    "base": {
        studioEndpoint: "univ3-tokens-base",
        hostedEndpoint: "univ3-tokens-base"
    },
    "celo": {
        studioEndpoint: "univ3-tokens-celo",
        hostedEndpoint: "univ3-tokens-celo"
    },
    "polygon": {
        studioEndpoint: "univ3-tokens-polygon",
        hostedEndpoint: "univ3-tokens-polygon"
    },
    "optimism": {
        studioEndpoint: "univ3-tokens-optimism",
        hostedEndpoint: "univ3-tokens-optimism"
    },
    "bsc": {
        studioEndpoint: "univ3-tokens-bsc",
        hostedEndpoint: "univ3-tokens-bsc"
    },
} 
    
export default networks