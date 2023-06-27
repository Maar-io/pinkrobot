import * as Yup from "yup";
import { PinkValues, NetworkInfo, NetworkId, ContractType, Meta, NameTextMap } from "../types";
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

export const MINTING_ALLOWED = true;
export const BLACK_HOLE_IMAGE_MAX_SIZE = 6000;
export const BLACK_HOLE_IMAGE_URL = 'assets/blackhole.jpg';
export const story =
    `In a distant galaxy, at the very edge of time and space, a remarkable planet thrives with sentient robots on the brink of a perilous destiny—the impending Cosmic Convergence. This cosmic event threatens to unleash cataclysmic forces, casting a shadow over their existence.

    In their desperate bid for survival, the robots have constructed a portal, a gateway to the sanctuary of the Astar Networks. But they cannot traverse this path alone. They need your unwavering guidance and assistance.
    
    Our mission is to shepherd these resilient beings through the portal during the momentous Minting Event, ensuring their escape from the planet's impending doom. However, the portal has a limited capacity, allowing only 10,000 PinkRobots to find solace within the sheltered realm of the Astar Network.
    
    With each successful passage through the portal, these extraordinary robots undergo a breathtaking metamorphosis, emerging as enchanting and unique beings—the PinkRobots.`;

export const networks: Array<NetworkInfo> = [
  {
    name: "Shibuya",
    endpoint: "wss://rpc.shibuya.astar.network",
    pinkContractAddress: "b8rxouhDFMy7qogMHjcAhBmEGtCJ8HgnWo8YnC3o33bPW94",
    pinkPsp34ContractAddress: "aU8xXzMoNM6szsFcPVxtWK1JMgPy8euf1AuunpUsg4zZpJ5",
    marketplaceTokenUrl: 'https://marketplace-astar-testnet.paras.id/token/astar/aU8xXzMoNM6szsFcPVxtWK1JMgPy8euf1AuunpUsg4zZpJ5',
    tokenUnit: "SBY",
  },
  {
    name: "Astar",
    endpoint: "wss://rpc.astar.network",
    pinkContractAddress: "ZohEUuLZWgreMDqTNpjGM3HSBJttAjfxETdPDFRSSguxGKo",
    pinkPsp34ContractAddress: "XoywUxTTtNKPRrRN7V5KXCqz2QLMFeK7DxhpSniqZHps5Xq",
    marketplaceTokenUrl: 'https://astar.paras.id/token/astar/XoywUxTTtNKPRrRN7V5KXCqz2QLMFeK7DxhpSniqZHps5Xq',
    tokenUnit: "ASTR",
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
export const DEFAULT_MODEL = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1';
export const DEFAULT_ARTIST = 'None';
export const PINK_PREFIX = "pink robot, ";
export const PINK_DESCRIPTION = "The collection of Pink Robots generated by AI";
export const CUSTOM_DESCRIPTION = "The collection of custom user-generated NFTs";
export const CUSTOM_MARKETPLACE = "https://launchpad.paras.id/";

// Make sure the name and property name are the same (case insensitive)
export const aiStyles: NameTextMap = {
  none: {
    name: "None",
    text: "",
  },
  anime: {
    name: "Anime",
    text: "in anime style, ",
  },
  cartoon: {
    name: "Cartoon",
    text: "in cartoon style, ",
  },
  oil: {
    name: "Oil",
    text: "in oil painting style, ",
  },
  pixel: {
    name: "Pixel",
    text: "in pixel art style, ",
  },
  pop: {
    name: "Pop",
    text: "in pop art style, ",
  },
  nouveau: {
    name: "Nouveau",
    text: "in Art Nouveau style, ",
  },
  paper: {
    name: "Paper",
    text: "made with messy paper collage and paper-cuts, ",
  },
  whimsical: {
    name: "Whimsical",
    text: "in whimsical style, ",
  },
  best: {
    name: "Best",
    text: "masterpiece, best quality, clean edges, sharp edges, detailed, ",
  },
  ink: {
    name: "Ink",
    text: "in ink splash, ",
  },
  pixiv: {
    name: "Pixiv",
    text: "in Pixiv website style, ",
  },
  watercolor: {
    name: "Watercolor",
    text: "in watercolor style with splashes, ",
  },
  linocut: {
    name: "Linocut",
    text: "in Linocut or woodcut style, ",
  },
  ghibli: {
    name: "Ghibli",
    text: "in Ghibli studio style, ",
  },
  pixar: {
    name: "Pixar",
    text: "in Pixar studio style, ",
  },
};


export const artistStyles: NameTextMap = {
  none: { name: "None", text: "" },
  kusama: { name: "Kusama", text: "like painting by Yayoi Kusama, " },
  amano: { name: "Amano", text: "like painting by Yoshitaka Amano, " },
  takashi: { name: "Takashi", text: "like painting by Takashi Murakami, " },
  hokusai: { name: "Hokusai", text: "like painting by Katsushika Hokusai, " },
  picasso: { name: "Picasso", text: "like painting by Pablo Picasso, " },
  gogh: { name: "Gogh", text: "like painting by Vincent van Gogh, " },
  dali: { name: "Dali", text: "like painting by Salvador Dali, " },
  pollock: { name: "Pollock", text: "like painting by Jackson Pollock, " },
  warhol: { name: "Warhol", text: "like painting by Andy Warhol, " },
  matisse: { name: "Matisse", text: "like painting by Henri Matisse, " },
  kandinsky: { name: "Kandinsky", text: "like painting by Wassily Kandinsky, " },
  munch: { name: "Munch", text: "like painting by Edvard Munch, " },
  banksy: { name: "Banksy", text: "like painting by Banksy, " },
  haring: { name: "Haring", text: "like painting by Keith Haring, " },
  basquiat: { name: "Basquiat", text: "like painting by Jean-Michel Basquiat, " },
};

export const aiModels = {
  stablediffusion: {
    name: "StableDiffusion",
    text: "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1-base",
  },
  anything: {
    name: "Anything",
    text: "https://api-inference.huggingface.co/models/Linaqruf/anything-v3.0",
  },
  openjourney: {
    name: "OpenJourney",
    text: "https://api-inference.huggingface.co/models/prompthero/openjourney",
  },
  anythingmidjourney: {
    name: "AnythingMidJourney",
    text: "https://api-inference.huggingface.co/models/Joeythemonster/anything-midjourney-v-4-1",
  },
  pokemondiffusers: {
    name: "PokemonDiffusers",
    text: "https://api-inference.huggingface.co/models/lambdalabs/sd-pokemon-diffusers",
  },
  arcanediffusion: {
    name: "ArcaneDiffusion",
    text: "https://api-inference.huggingface.co/models/nitrosocke/Arcane-Diffusion",
  },
  eimisanime: {
    name: "EimisAnime",
    text: "https://api-inference.huggingface.co/models/eimiss/EimisAnimeDiffusion_1.0v",
  },
  waifu: {
    name: "Waifu",
    text: "https://api-inference.huggingface.co/models/hakurei/waifu-diffusion",
  },
};

export const initialPinkValues: PinkValues = {
  prompt: "",
  contractType: ContractType.PinkPsp34,
  ipfs: "ipfs://dummyeidmni6viczb4w6c5knhfoqd26wkuvgn7fz6i4eurz7vo4svhb5lze/metadata.json",
  aiModel: aiModels.stablediffusion,
  aiStyle: aiStyles.none,
  artist: artistStyles.none,
  imageData: [new Uint8Array(), new Uint8Array()],
  displayImage: [default_pink_robot, default_upload_image],
  tokenId: [0, 0],
  limitMint: 0,
  networkId: NetworkId.Astar,
  price: BN_ZERO,
  total: BN_ZERO,
  tokenUnit: networks[NetworkId.Astar].tokenUnit,
};

export const contractAddress = networks[initialPinkValues.networkId].pinkContractAddress;
export const psp34ContractAddress = networks[initialPinkValues.networkId].pinkPsp34ContractAddress;
export const connectedNetwork = networks[initialPinkValues.networkId].name;
export const marketplaceTokenUrl = networks[initialPinkValues.networkId].marketplaceTokenUrl;
export const PINK_MINT_TEXT = `Your Pink Robot is now on ${connectedNetwork}! Keep it or flip it on `
export const CUSTOM_MINT_TEXT = `Your NFT is now on ${connectedNetwork}! Keep it or flip it on `