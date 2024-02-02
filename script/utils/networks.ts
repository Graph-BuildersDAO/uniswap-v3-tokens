
interface NetworkConfig {
    studioEndpoint: string,
    hostedEndpoint: string,
    lastV:string
}
export interface NetworkConfigs {
[networkId: string]: NetworkConfig;
}
/*
 * IMPORTANT: Increment all lastV after deployment please
 */
export const networks : NetworkConfigs=  {
    "arbitrum-one": {
        studioEndpoint: "univ3-tokens-arbitrum",
        hostedEndpoint: "univ3-tokens-arbitrum",
        lastV:"v1.0.2"
    },
    "ethereum": {
        studioEndpoint: "univ3-tokens-ethereum",
        hostedEndpoint: "univ3-tokens-ethereum",
        lastV:"v1.0.3"
    },
    "avax": {
        studioEndpoint: "univ3-tokens-avax",
        hostedEndpoint: "univ3-tokens-avax",
        lastV:"v1.0.3"
    },
    "base": {
        studioEndpoint: "univ3-tokens-base",
        hostedEndpoint: "univ3-tokens-base",
        lastV:"v1.0.2"
    },
    "celo": {
        studioEndpoint: "univ3-tokens-celo",
        hostedEndpoint: "univ3-tokens-celo",
        lastV:"v1.0.3"
    },
    "polygon": {
        studioEndpoint: "univ3-tokens-polygon",
        hostedEndpoint: "univ3-tokens-polygon",
        lastV:"v1.0.4"
    },
    "optimism": {
        studioEndpoint: "univ3-tokens-optimism",
        hostedEndpoint: "univ3-tokens-optimism",
        lastV:"v1.0.2"
    },
    "bsc": {
        studioEndpoint: "univ3-tokens-bsc",
        hostedEndpoint: "univ3-tokens-bsc",
        lastV:"v1.0.2"
    },
} 
    
export default networks