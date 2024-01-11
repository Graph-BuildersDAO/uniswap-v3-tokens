const util = require('util')
const exec = util.promisify(require('child_process').exec)
import {networks} from "./utils/networks";
import {build, deployHosted} from "./utils/deploy-utils";


const choices = Object.keys(networks);

async function main() {
  const network = process.argv[2]
  if (!network) {
    console.error('no network parameter passed')
    process.exit(-1)
  }
  await build(network)
  await deployHosted(networks[network].hostedEndpoint)
}

main()