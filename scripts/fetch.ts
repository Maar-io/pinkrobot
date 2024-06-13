import { cryptoWaitReady } from '@polkadot/util-crypto';
import { getApi, queryUser, getContract, queryTotalSupply, getSigner } from './common_api';
import { contractAddress } from './consts';
import dotenv from 'dotenv';
const fs = require('fs').promises;


export const fetch = async(): Promise<void> => {
  dotenv.config();
  await cryptoWaitReady();
  const api = await getApi();
  const contract = await getContract(contractAddress);
  const signer = getSigner(process.env.MNEMONICS || '//Alice');

  const supplyStr = await queryTotalSupply(api, contract, signer);
  const supplyBn = BigInt(supplyStr);
  console.log(`Total supplyBn: ${supplyBn}`);

  for (let i = 1; i <= supplyBn; i++) {
    console.log(`Fetch user ${i}`);
    const owner =  await queryUser(api, contract, signer, i);
  }

  process.exit(0);
};

fetch();