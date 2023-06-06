// import { useEffect, useRef } from "react";
// import { useEstimationContext } from "../contexts";
// // import { useDryRun } from "../hooks";
// import { Estimation, PinkValues } from "../types";
// import { usePinkContract } from "../hooks";

// interface Props {
//   values: PinkValues;
//   isValid: boolean;
// }

// function Fees({ estimation }: { estimation: Estimation }) {
//   return (
//     <>
//       {/* <p>storage: {estimation.storageDeposit.asCharge.toHuman()}</p>
//       <p>gas: {estimation.partialFee.toHuman()}</p>
//       <p>price: {estimation.price.toHuman()}</p> */}
//       <p>price + gas: {estimation.total.toHuman()}</p>
//     </>
//   );
// }

// export function DryRunResult({ values, isValid }: Props) {
//   const estimate = useDryRun();
//   const { estimation, setEstimation, setIsEstimating } = useEstimationContext();
//   const timeoutId = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     setIsEstimating(true);

//     async function getOutcome() {
//       if (!isValid) return;
//       const params = [values.contractType, values.ipfs];
//       const e = await estimate(params);
//       setEstimation(e);
//       setIsEstimating(false);
//     }
//     function debouncedDryRun() {
//       if (timeoutId.current) clearTimeout(timeoutId.current);
//       timeoutId.current = setTimeout(() => {
//         getOutcome().catch((err) => console.error(err));
//         timeoutId.current = null;
//       }, 300);
//     }

//     debouncedDryRun();
//   }, [
//     estimate,
//     isValid,
//     setEstimation,
//     setIsEstimating,
//     values.prompt,
//     values.ipfs,
//     values.contractType,
//   ]);

//   return estimation ? (
//     <div className="estimations">
//       <div>
//         {estimation.result && "Ok" in estimation.result 
//           // && typeof estimation.result.Ok === "object" 
//           ? (
//           <Fees estimation={estimation} />
//           ) : (
//           <p>Error in estimation</p>
//         )}
//       </div>
//     </div>
//   ) : null;
// }


import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { PinkValues } from "../types";
import { usePinkContract } from "../hooks";
import { pickDecoded, pickTxInfo } from "useink/utils";
import { useWallet } from "useink";

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
    const { pinkMintDryRun, getPrice } = usePinkContract();
    const { account } = useWallet();
    const timeoutId = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      async function price() {
        const price = getPrice?.send([values.contractType, values.ipfs], { defaultCaller: true });
        console.log("fetched price", price)
        values.price = price;
      }
      async function getOutcome() {
        pinkMintDryRun?.send([account?.address], { defaultCaller: true });
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
    }, [pinkMintDryRun?.send]);

    if (!pinkMintDryRun?.result) return null;
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
