import * as Yup from "yup";
import { PinkValues, NetworkInfo, NetworkId, ContractType, Meta } from "../types";
import default_pink_robot from "../assets/default_pink_robot.jpeg";
import default_upload_image from "../assets/default_upload_image.jpeg";
import BN from "bn.js";

export const PinkFormSchema = Yup.object().shape({
  prompt: Yup.string().min(3, "Description is too short").required(),
  // fileUpload: Yup.mixed()
  //   .required("A file is required")
  //   .test(
  //     "fileSize",
  //     "File too large",
  //     (value) => value && value.size <= 100
  //   ),
});

export const endpoint = "wss://rpc.shibuya.astar.network";

export const BN_ZERO = new BN(0);

export const networks: Array<NetworkInfo> = [
  {
    name: "Shibuya",
    endpoint: "wss://rpc.shibuya.astar.network",
    pinkContractAddress: "ZQgRzVGamwEvpkU1LzkT4b7EdtHq6PtH7GmEfyTv1HzQJvv"
  },
  {
    name: "Astar",
    endpoint: "wss://rpc.astar.network",
    pinkContractAddress: "0"
  }
];

export const pinkMeta: Array<Meta> = [
  {
    name: "PinkRobot#",
    description: "The collection of Pink Robots generated by AI",
  },
  {
    name: "PinkCustom#",
    description: "The collection of custom user-generated NFTs",
  }
];
export const DEFAULT_MODEL = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2';
export const PINK_PREFIX = "pink robot, sharp edge, vector art, 2d, "
export const PINK_DESCRIPTION = "The collection of Pink Robots generated by AI";
export const CUSTOM_DESCRIPTION = "The collection of custom user-generated NFTs";
export const PINK_MARKETPLACE = "https://launchpad.paras.id/project/64649a1dd2d90f590843d0ab";
export const CUSTOM_MARKETPLACE = "https://launchpad.paras.id/";
export const initialPinkValues: PinkValues = {
  prompt: "", 
  contractType: ContractType.PinkPsp34,
  ipfs: "ipfs://dummyeidmni6viczb4w6c5knhfoqd26wkuvgn7fz6i4eurz7vo4svhb5lze/metadata.json", 
  aiModel: DEFAULT_MODEL, 
  aiStyle: "",
  imageData: [new Uint8Array(), new Uint8Array()],
  displayImage: [default_pink_robot, default_upload_image],
  tokenId: [0, 0],
  networkId: NetworkId.Shibuya,
  price: BN_ZERO,
  total: BN_ZERO,
};

export const contractAddress = networks[initialPinkValues.networkId].pinkContractAddress;
export const connectedNetwork = networks[initialPinkValues.networkId].name;

export const PINK_MINT_TEXT = `Your Pink Robot is now on ${connectedNetwork}! Keep it or flip it on `
export const CUSTOM_MINT_TEXT = `Your NFT is now on ${connectedNetwork}! Keep it or flip it on `
