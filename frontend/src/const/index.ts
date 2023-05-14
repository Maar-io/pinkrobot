import * as Yup from "yup";
import { PinkValues } from "../types";
import robot_bestia from "../assets/robot-bestia.jpeg";
import BN from "bn.js";


export const PinkFormSchema = Yup.object().shape({
  prompt: Yup.string()
    .min(3, "Description is too short")
    .required(),
});

export const endpoint = "wss://rpc.shibuya.astar.network";

export const BN_ZERO = new BN(0);

enum dNetworks {
  Shibuya = "Shibuya",
  Astar = "Astar",
}

enum Endpoints {
  Shibuya = "wss://rpc.shibuya.astar.network",
  Astar = "wss://rpc.astar.network",
}

enum ContractType{
  PinkPsp34 = 0,
  CustomUpload34 = 1,
  PinkRmrk = 2,
}

export const contractAddress =
  "ZCtoYmcJ2wwkZoFyejydTLrZj12roZzXHh5St7BTuJ78fRa";

export const dryRunCallerAddress =
  "5DPDFJi6rcooALEpR5gSbR8jgUU6YerEHRkAv3Sk8MDoRTke";

export const DEFAULT_MODEL = `https://api-inference.huggingface.co/models/Joeythemonster/anything-midjourney-v-4-1`;

export const PINK_DESCRIPTION = "The collection of Pink Robots generated by AI";
export const initialPinkValues: PinkValues = {
  prompt: "", 
  contractType: ContractType.PinkPsp34,
  ipfs: "ipfs://dummyeidmni6viczb4w6c5knhfoqd26wkuvgn7fz6i4eurz7vo4svhb5lze/metadata.json", 
  aimodel: DEFAULT_MODEL, 
  imageData: new Uint8Array(),
  aiImage: robot_bestia
  // network: Networks.Shibuya,
};