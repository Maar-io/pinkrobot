import { PinkValues, SupplyResult, TransferredBalanceEvent } from "../types";
import { FormikHelpers } from "formik";
import { usePinkContract } from "../hooks";
import { useWallet } from "useink";
import { pinkMeta } from "../const";
import { NFTStorage } from "nft.storage";
import { pickDecoded } from "useink/utils";
import { decodeError } from "useink/core";


export const useSubmitHandler = () => {
  const { getSupply, pinkMint, pinkRobotContract } = usePinkContract();
  const { account } = useWallet();

  return async (
    values: PinkValues,
    { setSubmitting, setStatus }: FormikHelpers<PinkValues>
  ) => {

    const getTokenId = async (values: PinkValues) => {
      // get tokenId from the contract's total_supply
      const supply = await getSupply?.send([values.contractType], { defaultCaller: true });
      console.log('getSupply response', supply);
      console.log('getSupply getSupply?.result', getSupply?.result);
      if (getSupply?.result && getSupply.result.ok) {
        const { decoded } = getSupply?.result?.value;
        console.log("getSupply decoded", decoded);
      }
      
      
      const decoded = pickDecoded<SupplyResult>(getSupply?.result?.ok && getSupply.result.value);
      console.log("getSupply decoded2", decoded);
      // if (supply?.ok && supply.value.decoded) {


      // values.tokenId[values.contractType] = decoded;
      // }
    };

    const uploadImage = async (values: PinkValues) => {
      if (!values!.imageData[values!.contractType]) {
        console.log("ImageData not set values.contractType,", values!.contractType);
        return;
      }
      console.log(
        "uploading Image to nft.storage,", values.contractType, "byteLength=",
        values!.imageData[values!.contractType].byteLength
      );
      const tokenIdString: string = String(values.tokenId[values!.contractType]);
      const name: string = pinkMeta[values!.contractType].name + tokenIdString;
      console.log("storing token name", name);
      const description: string = pinkMeta[values!.contractType].description;
      console.log("storing token description", description);
      const fileName: string = tokenIdString + ".jpeg";
      console.log("storing file name", fileName);
      const imageFile: Uint8Array = values!.imageData[values!.contractType];

      // Create instance to NFT.Storage
      const client = new NFTStorage({ token: process.env.REACT_APP_NFT_STORAGE_API_KEY! })

      // Send request to store image
      const metadata = await client.store({
        name,
        description,
        image: new File([imageFile], fileName, { type: "image/jpeg" }),
        // properties: {
        //   external_url: "https://pinkrobot.me",
        //   attributes:
        //     [
        //       {
        //         trait_type: "Prompt",
        //         value: "pink robot, " + values!.prompt
        //       },
        //       {
        //         trait_type: "AI Model",
        //         value: values!.aimodel
        //       },
        //     ]
        // }
      })

      // Save the URL
      console.log("Generated IPFS url:", metadata.url);
      values!.ipfs = metadata.url;
    };

    if (!account) return;

    console.log("Minting Image... ");
    console.log("PinkValues", values);

    // get tokenId from the contract's total_supply
    await getTokenId(values);

    // upload image to nft.storage
    await uploadImage(values);

    const mintArgs = [values.contractType, values.ipfs];
    const options = { value: values.price };
    pinkMint?.signAndSend(mintArgs, options, (result, _api, error) => {
      if (error) {
        console.error(JSON.stringify(error));
        setSubmitting(false);
      }
      console.log("Tx", result?.status);

      if (!result?.status.isInBlock) return;

      const events: UIEvent[] = [];

      // Collect Contract emitted events
      result?.contractEvents?.forEach(({ event, args }) => {
        events.push({
          name: event.identifier,
          message: `${event.docs.join()}`,
        });
      });

      // Collect pallet emitted events
      result?.events.forEach(({ event }) => {
        if ('ContractEmitted' !== event.method) {
          let message = '';

          if ('balances' === event.section) {
            const data = typeof event.data.toHuman() as any as TransferredBalanceEvent;
            message = `Amount: ${data.amount}`;
          }

          events.push({
            name: `${event.section}:${event.method}`,
            message,
          });
        }
      });

      const dispatchError = pinkMint.result?.dispatchError;

      if (dispatchError && pinkRobotContract?.contract) {
        const errorMessage = decodeError(dispatchError, pinkRobotContract, undefined, 'Something went wrong') ;
        setStatus({ finalized: true, events, errorMessage })
      }

      setSubmitting(false);
    });
  };
};

