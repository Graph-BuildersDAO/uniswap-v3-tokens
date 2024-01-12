
interface NetworkConfig {
    studioEndpoint: string,
    hostedEndpoint: string
}
export interface NetworkConfigs {
[networkId: string]: NetworkConfig;
}


export const networks : NetworkConfigs=  {
    "arbitrum-one": {
        studioEndpoint: "univ3-arbitrum",
        hostedEndpoint: "univ3-arbitrum"
    },
    "ethereum": {
        studioEndpoint: "univ3-ethereum",
        hostedEndpoint: "gundamdweeb/univ3-token-pricing-main"
    },
    "avax": {
        studioEndpoint: "univ3-avax",
        hostedEndpoint: "univ3-avax"
    },
    "base": {
        studioEndpoint: "univ3-base",
        hostedEndpoint: "univ3-base"
    },
    "celo": {
        studioEndpoint: "univ3-celo",
        hostedEndpoint: "univ3-celo"
    },
    "polygon": {
        studioEndpoint: "univ3-polygon",
        hostedEndpoint: "univ3-polygon"
    },
    "optimism": {
        studioEndpoint: "univ3-optimism",
        hostedEndpoint: "univ3-optimism"
    },
    "bsc": {
        studioEndpoint: "univ3-bsc",
        hostedEndpoint: "univ3-bsc"
    },
} 
    
export default networks