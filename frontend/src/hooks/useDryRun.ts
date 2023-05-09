import { useCallback, useEffect, useState } from "react";
import type {
  DispatchError,
  ContractExecResult,
  Balance,
} from "@polkadot/types/interfaces";
import { dryRunCallerAddress } from "../const";
import { Estimation } from "../types";
import { ApiPromise } from "@polkadot/api";
import { BN } from "@polkadot/util";
import { getDecodedOutput, getDecodedPrice } from "../helpers";
import { useApi, useExtension } from "useink";
import { useLinkContract } from "../contexts";

function decodeError(error: DispatchError, api: ApiPromise) {
  let message = "Unknown dispacth error";
  if (error.isModule) {
    const decoded = api?.registry.findMetaError(error.asModule);
    if (
      decoded.method === "StorageDepositLimitExhausted" ||
      decoded.method === "StorageDepositNotEnoughFunds"
    ) {
      message = "Not enough funds in the selected account.";
    } else {
      message = `${decoded?.section.toUpperCase()}.${decoded?.method}: ${decoded?.docs
        }`;
    }
  }
  return message;
}

function useDryRun() {
  const { account } = useExtension();
  const { api } = useApi();
  const { contract } = useLinkContract();
  const [balance, setBalance] = useState<BN>();

  useEffect(() => {
    const getBalance = async () => {
      if (!api || !account) return;
      const { freeBalance } = await api.derive.balances.account(
        account.address
      );
      setBalance(freeBalance?.div(new BN(10).pow(new BN(18))));
      console.log("connected account", account.address);
      console.log("balance", freeBalance.div(new BN(10).pow(new BN(18))));
    };
    getBalance().catch((e) => console.error(e));
  }, [api, account]);

  const estimate = useCallback(
    async function estimate(
      params: unknown[]
    ): Promise<Estimation | undefined> {
      try {
        if (!api || !contract) return;

        // get price
        const priceMessage = contract.abi.findMessage("getPrice");
        const { result: priceResult } = await api.call.contractsApi.call<ContractExecResult>(
          account?.address,
          contract.address,
          0,
          null,
          null,
          priceMessage.toU8a([]),
        );
        const decodedPrice = getDecodedPrice(
          priceResult,
          priceMessage.returnType,
          contract.abi.registry
        );
        // const price: Balance = contract.api.createType("Balance", decodedPrice);
        const price: Balance = contract.api.createType("Balance", "1000000000000000000");
        console.log("price", price);

        // dry run pink_mint to get gasRequired and storageDeposit
        const message = contract.abi.findMessage("pinkMint");
        console.log("minting params", params);
        // console.log("message", message);
        const inputData = message.toU8a(params);
        // console.log("inputData", inputData);

        const { storageDeposit, gasRequired, result, debugMessage } =
          await api.call.contractsApi.call<ContractExecResult>(
            account?.address,
            contract.address,
            0,
            null,
            null,
            inputData
          );
        console.log("debugMessage", debugMessage.toString());
        console.log("gasRequired", gasRequired.toString());


        const decodedOutput = getDecodedOutput(
          result,
          message.returnType,
          contract.abi.registry
        );
        console.log("decodedOutput for pink_mint dry-run", decodedOutput);

        const tx = contract.tx["pinkMint"](
          {
            gasLimit: gasRequired,
            storageDepositLimit: storageDeposit.asCharge,
            value: price,
          },
          ...params
        );

        const { partialFee } = await tx.paymentInfo(dryRunCallerAddress);

        // calculate total cost for minting
        const cost = partialFee
          .add(price)
          .add(storageDeposit.asCharge);
        const total: Balance = contract.api.createType("Balance", cost.toString());


        if (result.isErr) {
          return {
            gasRequired,
            storageDeposit,
            partialFee,
            result: decodedOutput!,
            error: { message: decodeError(result.asErr, api) },
            price,
            total,
          };
        }

        return {
          gasRequired,
          storageDeposit,
          partialFee,
          result: decodedOutput!,
          error: balance?.lt(storageDeposit.asCharge)
            ? { message: "Insufficient funds!" }
            : undefined,
          price,
          total
        };
      } catch (e) {
        console.error(e);
      }
    },
    [api, balance, account?.address, contract]
  );

  return estimate;
}
export { useDryRun };
