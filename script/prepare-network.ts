import * as path from 'path'
import * as fsExtra from 'fs-extra'
import {prepare} from './utils/prepareNetwork'
const process = require('process')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

async function main() {
  const network = process.argv[2]
  if (!network) {
    console.error('no network parameter passed')
    process.exit(-1)
  }

  await prepare(network)
}

main()
