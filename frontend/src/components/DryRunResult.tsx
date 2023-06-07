import { useEffect, useRef } from "react";
import { PinkValues } from "../types";
import { usePinkContract } from "../hooks";
import { pickDecoded, pickTxInfo } from "useink/utils";
import { useWallet } from "useink";
import BN from "bn.js";
interface Props {
  values: PinkValues;
  isValid: boolean;
}

interface FeesProps {
  storage: any;
  gas: any;
  price: string;
}

function Fees({ storage, gas, price }: FeesProps) {
  console.log("storage, gas, price", storage, gas, price);
  const priceBN = new BN(price);
  const cost = gas
    .add(priceBN)
    .add(storage);

  console.log("cost", cost.toString());

  return (
    <>
      {/* <p>storage: {storage}</p>
      <p>gas: {gas}</p>
      <p>price: {price}</p> */}
      <p>price + gas: {cost.toString()}</p>
    </>
  );
}



export function DryRunResult({ values, isValid }: Props) {
  const { pinkMintDryRun } = usePinkContract();
  const { account } = useWallet();
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  let priceNoQuotes = values.price.toString().replace(/,/g, '');

  useEffect(() => {
    async function getOutcome() {
      pinkMintDryRun?.send([values.contractType, values.ipfs], { value: priceNoQuotes, defaultCaller: true });
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

  if (!pinkMintDryRun?.result) return null;
  const txInfo = pickTxInfo(pinkMintDryRun?.result);

  return (
    <>
      <Fees storage={txInfo ? txInfo.storageDeposit.asCharge : '--'}
        gas={txInfo ? txInfo.partialFee : '--'}
        price={priceNoQuotes} />
    </>
  );
}
