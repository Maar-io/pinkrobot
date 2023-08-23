import { useEffect, useRef } from "react";
import { PinkValues } from "../types";
import { usePinkContract } from "../hooks";
import { pickTxInfo, formatBalance } from "useink/utils";
import { useBalance, useWallet } from "useink";
import BN from "bn.js";
interface Props {
  values: PinkValues;
  isValid: boolean;
}

interface FeesProps {
  storage: any;
  gas: any;
  price: string;
  unit: string;
}

function Fees({ storage, gas, price, unit }: FeesProps) {
  const priceBN = new BN(price);
  const cost = gas.add(priceBN).add(storage);
  formatBalance.setDefaults({ unit });
  return (
    <div className="text-xs text-right mb-2 text-gray-200">
      {/* <p>storage: {storage}</p>
      <p>gas: {gas}</p>
      <p>price: {price}</p> */}
      <p>
        price + gas:{" "}
        {formatBalance(cost.toString(), { decimals: 18, withSi: true })}
      </p>
    </div>
  );
}

export function DryRunResult({ values, isValid }: Props) {
  const { pinkMintDryRun } = usePinkContract();
  const { account } = useWallet();
  const balance = useBalance(account);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function getOutcome() {
      pinkMintDryRun?.send([values.contractType, values.ipfs], {
        value: values.price,
        defaultCaller: true,
      });
    }

    function debouncedDryRun() {
      if (timeoutId.current) clearTimeout(timeoutId.current);

      timeoutId.current = setTimeout(() => {
        getOutcome().catch(console.error);
        timeoutId.current = null;
      }, 1000);
    }

    debouncedDryRun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinkMintDryRun?.send, account?.address, values.ipfs]);

  formatBalance.setDefaults({ unit: values.tokenUnit });
  // const freeBalance = balance?.freeBalance.sub(balance.frozenFee);
  const freeBalance = undefined; // TOTO quick fix for removed frozenFee after the latest runtime update
  let txInfo;
  // if (!pinkMintDryRun?.result) return null;
  if (pinkMintDryRun?.result) {
    txInfo = pickTxInfo(pinkMintDryRun?.result);
  }

  return (
    <>
      {txInfo && (
        <Fees
          storage={txInfo ? txInfo.storageDeposit.asCharge : "--"}
          gas={txInfo ? txInfo.partialFee : "--"}
          price={values.price}
          unit={values.tokenUnit}
        />
      )}
      {freeBalance && (
        <div className="text-xs text-right mb-2 text-gray-200">
          your transferable balance:{" "}
          {formatBalance(freeBalance?.toString(), {
            decimals: 18,
            withSi: true,
          })}
        </div>
      )}
    </>
  );
}
