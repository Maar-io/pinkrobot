export enum NetworkId {
  Shibuya = 0,
  Astar = 1,
  Local = 2,
}

export interface NetworkInfo {
  name: string;
  endpoint: string;
  contractAddress: string;
  tokenUnit: string;
}

export const networks: Array<NetworkInfo> = [
  {
    name: "Shibuya",
    endpoint: "wss://rpc.shibuya.astar.network",
    contractAddress: "",
    tokenUnit: "SBY",
  },
  {
    name: "Astar",
    endpoint: "wss://rpc.astar.network",
    contractAddress: 'XoywUxTTtNKPRrRN7V5KXCqz2QLMFeK7DxhpSniqZHps5Xq',
    tokenUnit: "ASTR",
  },
  {
    name: "Local",
    endpoint: "ws://localhost:9944",
    contractAddress: '',
    tokenUnit: "ASTR",
  }
];

export const contractAddress = networks[NetworkId.Astar].contractAddress;
export const tokenUnit = networks[NetworkId.Astar].tokenUnit;
export const endpoint = networks[NetworkId.Astar].endpoint;