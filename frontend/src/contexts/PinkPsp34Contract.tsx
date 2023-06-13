import { PropsWithChildren, createContext } from "react";
import { Call, ChainContract, useCall, useContract } from "useink";
import { psp34ContractAddress } from "../const";
import metadata from "../metadata_psp34.json";

interface PinkPsp34ContractState {
  pinkPsp34Contract?: ChainContract;
  totalBalance?: Call<[]>;
}

export const PinkPsp34ContractContext = createContext<PinkPsp34ContractState>(
  {}
);

export function PinkPsp34ContractProvider({ children }: PropsWithChildren) {
  const pinkPsp34Contract = useContract(psp34ContractAddress, metadata);
  const totalBalance = useCall<[]>(pinkPsp34Contract, "totalBalance");

  return (
    <PinkPsp34ContractContext.Provider
      value={{ pinkPsp34Contract, totalBalance }}
    >
      {children}
    </PinkPsp34ContractContext.Provider>
  );
}
