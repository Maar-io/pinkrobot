import { DryRunResult } from "./DryRunResult";
import { Form, Field, ErrorMessage, useFormikContext } from "formik";
import { PinkValues, ContractType } from "../types";
import { ChangeEvent, useState, useEffect } from "react";
import { NewUserGuide } from "./NewUserGuide";
import { useBalance, useWallet } from "useink";
import axios from "axios";
import { Buffer } from "buffer";
import { ModelSelector } from "./ModelSelector";
import { StyleSelector } from "./StyleSelector";
import { usePinkContract } from "../hooks";
import {
  PINK_PREFIX,
  NEGATIVE_PROMPT,
  PROMPT_DEEMPHASIS,
  MINTING_ALLOWED,
  BLACK_HOLE_IMAGE_MAX_SIZE,
  BLACK_HOLE_IMAGE_URL,
} from "../const";
import { ArtistSelector } from "./ArtistSelector";
import { usePinkPsp34Contract } from "../hooks/usePinkPsp34Contract";
import { TopInfo } from "./TopInfo";

export const GenerateForm = ({
  setIsBusy,
  handleError,
}: {
  setIsBusy: Function;
  handleError: Function;
}) => {
  const { isSubmitting, isValid, values, setFieldTouched, handleChange } =
    useFormikContext<PinkValues>();
  const { account, accounts } = useWallet();
  const [waitingHuggingFace, setWaitingHuggingFace] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const balance = useBalance(account);
  const { getPrice } = usePinkContract();
  const {
    totalSupply,
    limitPerAccount,
    balanceOf,
    isWhitelistEnabled,
    isWhitelisted,
  } = usePinkPsp34Contract();
  const [limit, setLimit] = useState(false);
  const [whitelistEnabled, setWhitelistEnabled] = useState<boolean>(false);
  const [whitelisted, setWhitelisted] = useState<boolean>(false);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const hasFunds =
    !balance?.freeBalance.isEmpty && !balance?.freeBalance.isZero();
  values.contractType = ContractType.PinkPsp34;
  const { pinkMintDryRun } = usePinkContract();

  useEffect(() => {
    fetchPrice();
    getTokenId(values);
    getLimitPerAccount(values);
    getHolderBalance();
    getIsWhitelistEnabled();
    getIsWhitelisted();
  }, [account, values.contractType, values]);

  const getTokenId = async (values: PinkValues) => {
    // get tokenId from the contract's total_supply
    const s = await totalSupply?.send([], { defaultCaller: true });
    if (s?.ok && s.value.decoded) {
      const cnt = s.value.decoded.toString().replace(/,/g, "");
      values.tokenId[values!.contractType] = Number(cnt) + 1;
      console.log("Next tokenId probing", values.tokenId[values!.contractType]);
    }
  };

  const getHolderBalance = async () => {
    const s = await balanceOf?.send([account?.address], {
      defaultCaller: true,
    });
    if (s?.ok && s.value.decoded) {
      setTokenBalance(Number(s.value.decoded));
      console.log("Token balance", Number(s.value.decoded));
    }
  };

  const getLimitPerAccount = async (values: PinkValues) => {
    const s = await limitPerAccount?.send([], { defaultCaller: true });
    if (s?.ok && s.value.decoded) {
      values.limitMint = Number(s.value.decoded);
      if (tokenBalance >= values.limitMint) {
        setLimit(true);
      } else {
        setLimit(false);
      }
      console.log("mint limited to ", values.limitMint);
    }
  };

  const getIsWhitelistEnabled = async () => {
    const s = await isWhitelistEnabled?.send([], { defaultCaller: true });
    if (s?.ok && s.value.decoded) {
      setWhitelistEnabled(Boolean(s.value.decoded));
      console.log("getIsWhitelistEnabled", s.value.decoded);
    }
  };

  const getIsWhitelisted = async () => {
    const s = await isWhitelisted?.send([account?.address], {
      defaultCaller: true,
    });
    if (s?.ok && s.value.decoded) {
      setWhitelisted(Boolean(s.value.decoded));
      console.log("is account whitelisted", s.value.decoded);
    }
  };

  const fetchPrice = async () => {
    const price = await getPrice?.send([], { defaultCaller: true });
    console.log("fetched price", price?.ok && price.value.decoded);
    if (price?.ok && price.value.decoded) {
      let priceNoQuotes = price.value.decoded.toString().replace(/,/g, "");
      values.price = priceNoQuotes;
    }
  };

  const cleanHuman = (words: string[], str: string) => {
    return words.reduce((result, word) => result.replace(word, ''), str)
  }

  const composePrompt = () => {
    const cleanPrompt = cleanHuman(PROMPT_DEEMPHASIS, values.prompt.toLowerCase());
    console.log("cleanPrompt", cleanPrompt);
    const prompt =
      PINK_PREFIX + values.aiStyle.text + values.artist.text + cleanPrompt
    return prompt;
  };

  const setBlackHoleImage = (values: PinkValues): void => {
    values.displayImage[values.contractType] = BLACK_HOLE_IMAGE_URL;
    values.imageData[values.contractType] = new Uint8Array();
  };

  const fetchImage = async () => {
    console.log("Create image using model:", values.aiModel);
    console.log(
      "ENV",
      process.env.REACT_APP_HUGGING_FACE_API_KEY ? "ok" : "not found"
    );
    const prompt = composePrompt();
    console.log("prompt:", prompt);

    try {
      setIsBusy("Imagining your pink robot. This might take up to 30s");
      setWaitingHuggingFace(true);
      setIsGenerated(false);
      const response = await axios({
        url: values.aiModel.text,
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_HUGGING_FACE_API_KEY}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          inputs: prompt + " " + Math.round(Math.random() * 100),
          options: { wait_for_model: true },
          parameters: {
            negative_prompt: NEGATIVE_PROMPT,
          }
        }),
        responseType: "arraybuffer",
        timeout: 30000,
      });

      const contentType = response.headers["content-type"];
      console.log("------- response.data", response.data);
      const isValidImage =
        response.data.byteLength > BLACK_HOLE_IMAGE_MAX_SIZE;
      if (isValidImage) {
        const base64data = Buffer.from(response.data).toString("base64");
        const aiImage = `data:${contentType};base64,` + base64data;
        values.displayImage[values.contractType] = aiImage;
        console.log("aiImage", aiImage ? "generated" : "empty");
        values.imageData[values.contractType] = response.data;
      } else {
        setBlackHoleImage(values);
      }

      setIsGenerated(isValidImage);
    } catch (error: any) {
      setIsGenerated(false);
      //handleError(error.toString());
      setBlackHoleImage(values);
      console.error(error);
    } finally {
      setWaitingHuggingFace(false);
      setIsBusy("");
    }
  };

  return (
    <Form style={{ marginBottom: "auto" }}>
      {!MINTING_ALLOWED && <TopInfo />}
      <img
        src={values.displayImage[values.contractType]}
        className="pink-example rounded-lg"
        alt="example"
        title="Here you can see the generated image. If you like it click 'Mint' to make your own NFT with it. Or click 'Imagine New' to generate a new image. If you would like to invoke previous image, you need to enter the same prompt, same style, same artist and same model. In case it is just a black square, try again"
      />

      <div className="group">
        <Field
          type="text"
          name="prompt"
          disabled={isSubmitting}
          placeholder="Pink robot as a..."
          title="Enter a prompt to generate your pink robot. All prompts have predefined 'Pink Robot, ' prefix. For example, if you enter 'Smiling owl' the AI will generate an image for prompt 'Pink robot, smiling owl'. The style and artist will enhance the image but they are optional. The AI model is mandatory and by default is the latest Stable Diffusion version."
          onChange={(e: ChangeEvent) => {
            setFieldTouched("prompt");
            handleChange(e);
          }}
        />
        <ErrorMessage name="prompt" component="div" className="error-message" />
      </div>
      <div className="group">
        <StyleSelector values={values} />
      </div>
      <div className="group">
        <ArtistSelector values={values} />
      </div>
      <div className="group">
        <ModelSelector values={values} />
      </div>
      <div className="buttons-container">
        <div className="group">
          <button
            type="button"
            onClick={fetchImage}
            disabled={
              !MINTING_ALLOWED ||
              waitingHuggingFace ||
              isSubmitting ||
              !isValid ||
              !accounts ||
              !hasFunds ||
              limit
            }
          >
            Imagine New
          </button>
        </div>
        <div className="group">
          <button
            type="submit"
            disabled={
              !MINTING_ALLOWED ||
              !isGenerated ||
              waitingHuggingFace ||
              isSubmitting ||
              !isValid ||
              !accounts ||
              !hasFunds ||
              limit ||
              !pinkMintDryRun?.result
            }
            name="submit"
          >
            Mint
          </button>
        </div>
      </div>

      <div className="group">
        {isGenerated && isValid && values.prompt && !isSubmitting && !limit && (
          <DryRunResult values={values} isValid={isValid} />
        )}
        {limit && (
          <div className="text-xs text-left mb-2 text-red-500">
            You have reached the limit of {values.limitMint} pink robots per
            account.
          </div>
        )}
        {whitelistEnabled && !whitelisted && !limit && (
          <div className="text-xs text-left mb-2 text-red-500">
            Your account is not whitelisted.
          </div>
        )}
      </div>

      <div className="group">
        <NewUserGuide
          hasAccounts={!!accounts && accounts.length > 0}
          hasFunds={hasFunds}
          walletConnected={!!account}
        />
      </div>
    </Form>
  );
};
