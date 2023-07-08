import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import { Abi, ContractPromise } from '@polkadot/api-contract';
import { WeightV2, DispatchError } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import { ApiBase } from '@polkadot/api/base';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import pinkpsp34 from './pinkpsp34.json';
import { endpoint } from './consts';

export interface WeightInfo {
  proofSize: bigint;
  refTime: bigint;
}

let api: ApiPromise;

export const getApi = async (): Promise<ApiPromise> => {
  if (!api) {
    const provider = new WsProvider(endpoint);
    const apiPromise = new ApiPromise({ provider });
    await apiPromise.isReady;

    api = apiPromise;
  }

  return api;
};

export const getContract = async (
  address: string
): Promise<ContractPromise> => {
  const api = await getApi();
  const abi = new Abi(pinkpsp34, api.registry.getChainProperties());

  return new ContractPromise(api, abi, address);
};

let gasLimit: WeightV2;
export const getGasLimit = (api: ApiPromise | ApiBase<'promise'>): WeightV2 => {
  if (!gasLimit) {
    gasLimit = api.registry.createType(
      'WeightV2',
      api.consts.system.blockWeights['maxBlock']
    ) as WeightV2;
  }

  return gasLimit;
};

export const doubleGasLimit = (
  api: ApiPromise | ApiBase<'promise'>,
  weight: WeightV2
): WeightV2 => {
  return api.registry.createType('WeightV2', {
    refTime: weight.refTime.toBn().muln(1.1),
    proofSize: weight.proofSize.toBn().muln(1.1),
  }) as WeightV2;
};

export const getSigner = (uri: string): KeyringPair => {
  const keyring = new Keyring({ type: 'sr25519' });

  if (uri.startsWith('//')) {
    return keyring.addFromUri(uri);
  } else {
    return keyring.addFromMnemonic(uri);
  }
};

export const queryUser = async (
  api: ApiPromise,
  contract: ContractPromise,
  address: string,
  tokenId: number,
  signer: KeyringPair,
) => {
  console.log(`Querying contract ${address}`);
  const gasLimit = getGasLimit(contract.api);
  const id = api.registry.createType('u64', tokenId);

  const txResult = await contract.query['psp34::ownerOf'](
    signer.address,
    {
      gasLimit,
      storageDepositLimit: null,
    }
  )
  if (txResult.result.isErr) {
    throw getErrorMessage(txResult.result.asErr);
  } else if (txResult.result.toString().includes('Revert')) {
    throw 'Reverted';
  }
  console.log(`Call: ownerOf, result: ${JSON.stringify(txResult.result.toHuman())}`);
}

export const queryTotalSupply = async (
  api: ApiPromise,
  contract: ContractPromise,
  signer: KeyringPair,
) => {
  console.log(`Querying contract ${contract.address}`);
  console.log(`Signer address ${signer.address}`);
  const gasLimit = getGasLimit(contract.api);

  const { gasRequired, storageDeposit, result } = await contract.query['psp34::totalSupply'](
    signer.address,
    {
      gasLimit,
      storageDepositLimit: null,
    }
  )
  console.log("result", result.toHuman())
  console.log(`Call: totalSupply, result: ${JSON.stringify(result.toHuman())}`);
  return result?.asOk.data.toString();
}

export const executeCallWithValue = async (
  contract: ContractPromise,
  call: string,
  signer: KeyringPair,
  value = null,
  ...params: unknown[]
): Promise<boolean> => {
  // Try run
  const txResult = await contract.query[call](
    signer.address,
    {
      gasLimit: getGasLimit(contract.api),
      storageDepositLimit: null,
      value: value ?? 0,
    },
    ...params
  );

  console.log(
    `Call: ${call}, result: ${JSON.stringify(txResult.result.toHuman())}`
  );

  if (txResult.result.isErr || txResult.result.toString().includes('Revert')) {
    throw txResult.result.value;
  }

  console.log(
    `Call: ${call}, output: ${JSON.stringify(txResult.output?.toHuman())}`
  );

  return new Promise((resolve) => {
    contract.tx[call](
      {
        //gasLimit: getGasLimit(contract.api, true),
        gasLimit: txResult.gasRequired, // doubleGasLimit(contract.api, txResult.gasRequired),
        storageDepositLimit: txResult.storageDeposit.asCharge,
        value: value ?? 0,
      },
      ...params
    ).signAndSend(signer, (result: ISubmittableResult) => {
      if (result.isFinalized && !result.dispatchError) {
        resolve(true);
      } else if (result.isFinalized && result.dispatchError) {
        console.error(getErrorMessage(result.dispatchError));
        resolve(false);
      } else if (result.isError) {
        resolve(false);
      }
    });
  });
};

export const executeCall = async (
  contract: ContractPromise,
  call: string,
  signer: KeyringPair,
  ...params: unknown[]
): Promise<boolean> => {
  return await executeCallWithValue(contract, call, signer, null, ...params);
};

export const getCall = async (
  contract: ContractPromise,
  call: string,
  signer: KeyringPair,
  value = null,
  ...params: unknown[]
): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>> => {
  const gasLimit = getGasLimit(contract.api);
  const txResult = await contract.query[call](
    signer.address,
    {
      gasLimit,
      storageDepositLimit: null,
      value: value ?? 0,
    },
    ...params
  );

  if (txResult.result.isErr) {
    throw getErrorMessage(txResult.result.asErr);
  } else if (txResult.result.toString().includes('Revert')) {
    throw 'Reverted';
  }

  const extrinsic = contract.tx[call](
    {
      gasLimit: doubleGasLimit(contract.api, txResult.gasRequired),
      storageDepositLimit: txResult.storageDeposit.asCharge,
      value: value ?? 0,
    },
    ...params
  );

  return extrinsic;
};

export const executeCalls = async (
  calls: SubmittableExtrinsic<'promise', ISubmittableResult>[],
  signer: KeyringPair
): Promise<boolean> => {
  const api = await getApi();
  const batches: SubmittableExtrinsic<'promise', ISubmittableResult>[][] = [];
  // Create batch of batches, each batch to use about a half of max block weight.
  const refTime = gasLimit.refTime.toBigInt() / BigInt(2);
  const proofSize = gasLimit.proofSize.toBigInt() / BigInt(2);
  let currentRefTime = BigInt(0);
  let currentProofSize = BigInt(0);
  let currentBatch: SubmittableExtrinsic<'promise', ISubmittableResult>[] = [];

  for (const call of calls) {
    if (currentRefTime > refTime || currentProofSize > proofSize) {
      batches.push(currentBatch);
      currentBatch = [];
      currentProofSize = BigInt(0);
      currentRefTime = BigInt(0);
    }

    const paymentInfo = await call.paymentInfo(signer.address);
    currentProofSize += paymentInfo.weight.proofSize.toBigInt();
    currentRefTime += paymentInfo.weight.refTime.toBigInt();
    currentBatch.push(call);
  }

  batches.push(currentBatch);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`Executing batch ${i + 1} / ${batches.length}`);
    await new Promise((resolve, reject) => {
      api.tx.utility
        .batchAll(batch)
        .signAndSend(signer, (result: ISubmittableResult) => {
          if (result.isFinalized && !result.dispatchError) {
            resolve(true);
          } else if (result.isFinalized && result.dispatchError) {
            console.error(getErrorMessage(result.dispatchError));
            reject(false);
          } else if (result.isError) {
            reject(false);
          }
        });
    });
  }

  return true;
};

export const getBatchWeight = async (
  api: ApiPromise | ApiBase<'promise'>,
  calls: SubmittableExtrinsic<'promise', ISubmittableResult>[],
  callerAddress: string
): Promise<WeightInfo> => {
  let result = { refTime: BigInt(0), proofSize: BigInt(0) } as WeightInfo;
  for (const call of calls) {
    const info = await call.paymentInfo(callerAddress);
    result.proofSize += info.weight.proofSize.toBigInt();
    result.refTime += info.weight.refTime.toBigInt();
    // console.log(info.weight.toHuman());
  }

  return result;
};

export const getErrorMessage = (dispatchError: DispatchError): string => {
  let message = '';
  if (dispatchError.isModule) {
    try {
      const mod = dispatchError.asModule;
      const error = dispatchError.registry.findMetaError(mod);

      message = `${error.section}.${error.name}`;
    } catch (error) {
      // swallow
      console.error(error);
    }
  } else if (dispatchError.isToken) {
    message = `${dispatchError.type}.${dispatchError.asToken.type}`;
  }

  return message;
};
