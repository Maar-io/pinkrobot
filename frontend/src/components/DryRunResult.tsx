import { useEffect, useRef } from "react";
import { PinkValues } from "../types";
import { usePinkContract } from "../hooks";
import { pickDecoded, pickTxInfo } from "useink/utils";
import { useWallet } from "useink";
import { AbiMessage, ContractExecResult, Registry } from "useink/core";
import { useAbiMessage } from "useink";
interface Props {
  values: PinkValues;
  isValid: boolean;
}

// interface FeesProps {
//   storage: string;
//   gas: string;
// }

// function Fees({ storage, gas }: FeesProps) {
//   // const cost = gas
//   //   .add(price)
//     // .add(storageDeposit.asCharge);
//   // const total: Balance = contract.api.createType("Balance", cost.toString());


//   return (
//     <>
//       <p>storage: {storage}</p>
//       <p>gas: {gas}</p>
//       {/* <p>price: {estimation.price.toHuman()}</p> */}
//       {/* <p>price + gas: {cost.toHuman()}</p> */}
//     </>
//   );
// }



  export function DryRunResult({ values, isValid }: Props) {
    const { pinkMintDryRun, getPrice, pinkRobotContract } = usePinkContract();
    const { account } = useWallet();
    const timeoutId = useRef<NodeJS.Timeout | null>(null);
    const abi = useAbiMessage(pinkRobotContract?.contract, 'getPrice');

    async function fetchPrice() {
      // const price = getPrice?.call([], { defaultCaller: true });
      if (getPrice?.result?.ok && getPrice.result.value.raw && abi && pinkRobotContract?.contract) {
        if (getPrice.result.value.raw.result, abi, pinkRobotContract.contract.api.registry){
          values.price = getPrice.result.value.decoded;

          console.log("decoded price", getPrice.result.value.decoded)
        }
      }
    }

    useEffect(() => {
      console.log("DryRun effect", account?.address, values.ipfs)
      async function getOutcome() {
        pinkMintDryRun?.send([values.contractType, values.ipfs], { value: "1000000000000000", defaultCaller: true });
      }

      function debouncedDryRun() {
        if (timeoutId.current) clearTimeout(timeoutId.current);

        timeoutId.current = setTimeout(() => {
          getOutcome().catch(console.error);
          timeoutId.current = null;
        }, 300);
      }

      debouncedDryRun();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pinkMintDryRun?.send, account?.address, values.ipfs]);
    
    console.log("pinkMintDryRun", pinkMintDryRun?.result)
    if (!pinkMintDryRun?.result) return null;
    // fetchPrice().catch(console.error);
    const decoded = pickDecoded(pinkMintDryRun?.result);
    const txInfo = pickTxInfo(pinkMintDryRun?.result);

    console.log("decoded", decoded)
    console.log("txInfo", txInfo)
    return (
      <>
      <p>storage deposit: {txInfo ? txInfo.storageDeposit.asCharge.toHuman() : '--'}</p>
      <p>gas fee: {txInfo ? txInfo.partialFee.toHuman() : '--'}</p>
    </>
    );
  }
