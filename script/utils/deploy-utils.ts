

const util = require('util')
const path = require('path');
const exec = util.promisify(require('child_process').exec)
import {networks} from "./networks";
import {prepare} from "./prepareNetwork";

const executeCommand = async (command) => {
  try {
    const { stdout, stderr } = await exec(command)
    if (stderr) {
      console.log(`stderr: ${stderr}`)
    }
    console.log('stdout:', stdout)
  } catch (e) {
    // should contain code (exit code) and signal (that caused the termination).
    console.error(`exec error: ${e}`)
  }
}

const executeComanndErrorReturn = async (command) => {
  try {
    const { stdout, stderr } = await exec(command)
    if (stderr) {
      return stderr;
    }
    console.log('stdout:', stdout)
  } catch (e) {
    // should contain code (exit code) and signal (that caused the termination).
    console.error(`exec error: ${e}`)
  }
}

const executeStudioDeployWithVersionIncrement = async (subgraphName, version) => {
  let [major, minor, patch] = version
      .split('.')
  const cmd = `yarn deploy-studio ${subgraphName} -l=${major}.${minor}.${ parseInt(patch)}`
  let stderr =  await executeComanndErrorReturn(cmd)
  if(stderr){
    if(stderr.includes("Version label already exists")){
      console.log(`Stuido version for ${subgraphName} exists - attempting deploy with version - ${major}.${minor}.${parseInt(patch)+1}`)
      return executeStudioDeployWithVersionIncrement(subgraphName, `${major}.${minor}.${parseInt(patch)+1}`)
    }
  }
}

const checkHostedServiceAccessToken = () => {
  if (!process.env.SUBGRAPH_DEPLOY_KEY) {
    throw new Error(
      `
      Missing access token in SUBGRAPH_DEPLOY_KEY env.
      You can get a token from https://thegraph.com/hosted-service/dashboard?account=unlock-protocol
      `
    )
  }
}

const checkStudioAccessToken = () => {
  if (!process.env.SUBGRAPH_STUDIO_DEPLOY_KEY) {
    throw new Error(
      `
      Missing access token in SUBGRAPH_STUDIO_DEPLOY_KEY env.
      You can get a token from https://thegraph.com/studio/
      `
    )
  }
}

  export const codegen = async () => {
    console.log('\n Running codegen...')
    await executeCommand('graph codegen')
  }
  
  // Creating subgraphs is only available from hosted-service dashboard
  // yarn graph create $network_name-v2 --node https://api.thegraph.com/deploy/ --access-token $SUBGRAPH_DEPLOY_KEY"
  export const build = async (network) => {
    console.log(`Building subgraph for ${network}`)
    console.log(`\n Copying constants & templates for ${network} \n`)
    await prepare(network)
    console.log(`\n Generating manifest for ${network} \n`)
    await executeCommand(`cross-env mustache config/${network}/config.json subgraph.template.yaml > subgraph.yaml`)
    await codegen()
  }


/**
 * Deploys subgraph with hosted service
 * @param graphLabel
 * @param subgraphName
 * @param graphNode
 * @param ipfs
 * @returns
 */
export const deployHosted = async (subgraphName) => {
  checkHostedServiceAccessToken()
  const cmd = `graph auth --product=hosted-service ${process.env.SUBGRAPH_DEPLOY_KEY} && yarn deploy-hosted ${subgraphName} --access-token ${process.env.SUBGRAPH_DEPLOY_KEY}`
  return executeCommand(cmd)
}

/**
 * Deploys subgraph with studio
 * @param version
 * @param subgraphName
 * @returns
 */
export const deployStudio = async (version, subgraphName) => {
  checkStudioAccessToken()
  await executeCommand(
    `graph auth --studio ${process.env.SUBGRAPH_STUDIO_DEPLOY_KEY}`
  )
  
  return executeStudioDeployWithVersionIncrement(subgraphName,version)
}

/**
 * deploy command
 * @param network 
 * @param studioName 
 * @param graphLabel 
 * @returns 
 */
export const deploy = async (network, studioName, graphLabel) => {
  if (!network) {
    throw new Error('Missing network name')
  }

  if (!networks[network].studioEndpoint) {
    throw new Error(`Missing subgraph configuration for ${network}`)
  }

  const hostedEndpoint = networks[network].hostedEndpoint;
  const studioEndpoint = networks[network].studioEndpoint;

  if(studioName && graphLabel){
    return deployStudio(graphLabel, studioName)
  }

  if(studioEndpoint && graphLabel){
    return deployStudio(graphLabel, studioEndpoint)
  }

  if(studioEndpoint){
    return deployStudio('v0.0.1', studioEndpoint)
  }

  if(hostedEndpoint){
    return deployHosted(hostedEndpoint)
  }

  throw new Error(
    `Invalid subgraph configuration for ${network} (${networks[network].studioEndpoint}) `
  )
}

/**
 * deploy only studio command
 * @param network 
 * @param graphLabel 
 * @returns 
 */
export const deployOnlyStudio = async (network, graphLabel) => {
  if (!network) {
    throw new Error('Missing network name')
  }

  if (!networks[network]?.studioEndpoint) {
    console.log(`Missing subgraph studioEndpoint for ${network}`)
    return;
  }

  const studioEndpoint = networks[network].studioEndpoint;

  if(studioEndpoint && graphLabel){
    return deployStudio(graphLabel, studioEndpoint)
  }

  throw new Error(
    `Invalid subgraph configuration for ${network} (${networks[network].studioEndpoint})`
  )
}



