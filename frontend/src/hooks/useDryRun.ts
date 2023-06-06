// import { useCallback, useEffect, useState } from "react";
// import type {
//   DispatchError,
//   ContractExecResult,
//   Balance,
// } from "@polkadot/types/interfaces";
// import { Estimation } from "../types";
// import { ApiPromise } from "@polkadot/api";
// import { BN } from "@polkadot/util";
// import { checkDecodedOk, getDecodedOutput, getDecodedPrice } from "../helpers";
// import { useApi, useExtension } from "useink";
// import { usePinkContract } from "../contexts";

// function decodeError(error: DispatchError, api: ApiPromise) {
//   let message = "Unknown dispacth error";
//   if (error.isModule) {
//     const decoded = api?.registry.findMetaError(error.asModule);
//     if (
//       decoded.method === "StorageDepositLimitExhausted" ||
//       decoded.method === "StorageDepositNotEnoughFunds"
//     ) {
//       message = "Not enough funds in the selected account.";
//     } else {
//       message = `${decoded?.section.toUpperCase()}.${decoded?.method}: ${decoded?.docs
//         }`;
//     }
//   }
//   return message;
// }

// function useDryRun() {
//   const { account } = useExtension();
//   const { api } = useApi();
//   const { contract } = usePinkContract();
//   const [balance, setBalance] = useState<BN>();

//   useEffect(() => {
//     const getBalance = async () => {
//       if (!api || !account) return;
//       const { freeBalance } = await api.derive.balances.account(
//         account.address
//       );
//       setBalance(freeBalance);
//       console.log("dry: connected account", account.address);
//       console.log("dry: balance", freeBalance.toHuman());
//     };
//     getBalance().catch((e) => console.error(e));
//   }, [api, account]);

//   const estimate = useCallback(
//     async function estimate(
//       params: unknown[]
//     ): Promise<Estimation | undefined> {
//       try {
//         if (!api || !contract) return;

//         // get price
//         const priceMessage = contract.abi.findMessage("getPrice");
//         const { result: priceResult } = await api.call.contractsApi.call<ContractExecResult>(
//           account?.address,
//           contract.address,
//           0,
//           null,
//           null,
//           priceMessage.toU8a([]),
//         );
//         const decodedPrice = getDecodedPrice(
//           priceResult,
//           priceMessage.returnType,
//           contract.abi.registry
//         );
//         const price: Balance = contract.api.createType("Balance", decodedPrice);
//         // const price: Balance = contract.api.createType("Balance", "100000000000000");
//         console.log("dry: price", price.toHuman());

//         // dry run pink_mint to get gasRequired and storageDeposit
//         const message = contract.abi.findMessage("pinkMint");
//         console.log("dry: minting params", params);
//         const inputData = message.toU8a(params);

//         const { storageDeposit, gasRequired, result, debugMessage } =
//           await api.call.contractsApi.call<ContractExecResult>(
//             account?.address,
//             contract.address,
//             price,
//             // message?.isPayable
//             //   ? price
//             //   : api.registry.createType('Balance', BN_ZERO),
//             null,
//             null,
//             inputData
//           );
//         console.log("dry: debugMessage", debugMessage.toString());
//         console.log("dry: gasRequired", gasRequired.toString());


//         const decodedOutput = getDecodedOutput(
//           result,
//           message.returnType,
//           contract.abi.registry
//         );

//         if (decodedOutput && "Ok" in decodedOutput
//           //  && typeof decodedOutput.Ok === "object"
//         ) {
//           console.log("dry: decodedOutput ok", decodedOutput.Ok);
//         }
//         if (decodedOutput && "Err" in decodedOutput
//           // && typeof decodedOutput.Err === "object"
//         ) {
//           console.log("dry: decodedOutput Err", decodedOutput.Err);
//         }

//         const tx = contract.tx["pinkMint"](
//           {
//             gasLimit: gasRequired,
//             storageDepositLimit: storageDeposit.asCharge,
//             value: price,
//           },
//           ...params
//         );

//         const { partialFee } = await tx.paymentInfo(account?.address!);
//         // calculate total cost for minting
//         const cost = partialFee
//           .add(price)
//           .add(storageDeposit.asCharge);
//         const total: Balance = contract.api.createType("Balance", cost.toString());

//         console.log("dry: return pass 1")
//         if (result.isErr) {
//           return {
//             gasRequired,
//             storageDeposit,
//             partialFee,
//             result: decodedOutput!,
//             error: { message: decodeError(result.asErr, api) },
//             price,
//             total,
//           };
//         }
        
//         const ErrFoundInDecodedOk = checkDecodedOk(
//           result,
//           message.returnType,
//           contract.abi.registry
//           );
          
//           console.log("dry: return pass 2")
//           if (result.isOk && ErrFoundInDecodedOk) {
//             return {
//               gasRequired,
//               storageDeposit,
//               partialFee,
//               result: decodedOutput!,
//               error: {
//                 message: "Dry-run error (" + ErrFoundInDecodedOk + "). Cost estimation might be wrong"
//               },
//               price,
//               total,
//             };
//           }
          
//           console.log("dry: return pass 3")
//         return {
//           gasRequired,
//           storageDeposit,
//           partialFee,
//           result: decodedOutput!,
//           error: balance?.lt(storageDeposit.asCharge)
//             ? { message: "Insufficient funds!" }
//             : undefined,
//           price,
//           total
//         };
//       } catch (e) {
//         console.error(e);
//       }
//     },
//     [api, balance, account?.address, contract]
//   );

//   return estimate;
// }
// export { useDryRun };
