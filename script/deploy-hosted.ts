import {networks} from "./utils/networks";
import {deployHosted, build} from "./utils/deploy-utils";

const choices = Object.keys(networks);

async function main() {
  let studioChoices = choices.filter((c) => networks[c].hostedEndpoint != null);
  // check config
  console.log(
    `Deploying subgraphs to studio for:\n${studioChoices.map((c) => ` - ${c}\n`).join('')}`
  )
  // build and deploy each network
  for (const network of studioChoices) {
    await build(network)
    await deployHosted(networks[network].hostedEndpoint)
  }

  console.log('Subgraph studio deployments done.')
}

main()