import { useWallet } from "useink";
import { PinkPsp34ContractProvider } from "../contexts/PinkPsp34Contract";
import { usePinkPsp34Contract } from "../hooks/usePinkPsp34Contract";
import { useEffect } from "react";

type Props = {};

export const Gallery: React.FC<Props> = ({}) => {
  const { totalBalance } = usePinkPsp34Contract();
  const { account } = useWallet();

  const getTotalBalance = async (): Promise<void> => {
    const result = await totalBalance?.send([account?.address], {
      defaultCaller: true,
    });
    console.log("totalBalance", result, account?.address);
  };

  useEffect(() => {
    getTotalBalance();
  }, [account?.address]);

  return <div>Gallery</div>;
};
