import { RustResult } from "useink/utils";

export interface PinkValues {
  prompt: string;
  contractType: number;
  ipfs: string;
  aiModel: NameText;
  artist: NameText;
  aiStyle: NameText;
  imageData: Array<Uint8Array>;
  displayImage: Array<any>;
  tokenId: Array<number>;
  networkId: NetworkId;
  price: any;
  limitMint: any;
  total: any;
  tokenUnit: string;
}

export interface NameText {
  name: string;
  text: string;
}

export interface NameTextMap {
  [key: string]: NameText;
}

export enum ContractType {
  PinkPsp34 = 0,
  CustomUpload34 = 1,
  PinkRmrk = 2,
}

// export type InjectedAccount = Flatten<Awaited<ReturnType<typeof web3Accounts>>>;
// export type InjectedExtension = Flatten<Awaited<ReturnType<typeof web3Enable>>>;

export type MintingResult = { Ok: number } | { Err: string };


export interface NetworkInfo {
  name: string;
  endpoint: string;
  pinkContractAddress: string;
  pinkPsp34ContractAddress: string;
  marketplaceTokenUrl: string;
  tokenUnit: string;
}
export interface Meta {
  name: string;
  description: string;
}

export enum NetworkId {
  Shibuya = 0,
  Astar = 1,
}

export interface Id {
  U64: string;
}

export type SupplyResult = RustResult<{ value: number }, { err: { e: string } }>;