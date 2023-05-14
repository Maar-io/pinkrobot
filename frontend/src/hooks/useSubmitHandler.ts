import { web3FromAddress } from "@polkadot/extension-dapp";
import { PinkValues, UIEvent } from "../types";
import { FormikHelpers, useFormikContext } from "formik";
import { ApiBase, SubmittableExtrinsic } from "@polkadot/api/types";
import { ContractSubmittableResult } from "@polkadot/api-contract/base/Contract";
import { useEstimationContext, useLinkContract } from "../contexts";
import { useApi, useExtension } from "useink";
import { ApiPromise } from "@polkadot/api";
import { WeightV2 } from "@polkadot/types/interfaces";
import { PINK_DESCRIPTION } from "../const";
import { NFTStorage, File } from 'nft.storage'

const doubleGasLimit = (
  api: ApiPromise | ApiBase<'promise'>,
  weight: WeightV2
): WeightV2 => {
  return api.registry.createType('WeightV2', {
    refTime: weight.refTime.toBn().muln(2),
    proofSize: weight.proofSize.toBn().muln(2),
  }) as WeightV2;
};

export const useSubmitHandler = () => {
  const { api } = useApi();
  const { account } = useExtension();
  const { contract } = useLinkContract();
  const { estimation } = useEstimationContext();

  const uploadImage = async (values: PinkValues) => {
    console.log("uploading Image to nft.storage, byteLength=", values!.imageData.byteLength);
    // Create instance to NFT.Storage
    const nftstorage = new NFTStorage({ token: process.env.REACT_APP_NFT_STORAGE_API_KEY! })

    // Send request to store image
    const { ipnft } = await nftstorage.store({
      name: "PinkRobot#",
      description: PINK_DESCRIPTION,
      external_url: "https://pinkrobot.xwz",
      image: new File([values!.imageData], "image.jpeg", { type: "image/jpeg" }),
      attributes:
        [
          {
            "trait_type": "Prompt",
            "value": "pink robot, " + values!.prompt
          },
          {
            "trait_type": "AI Model",
            "value": values!.aimodel
          },
        ]
    })

    // Save the URL
    const url = `ipfs://${ipnft}/metadata.json`
    console.log("Generated IPFS url:", url);
    values!.ipfs = url;

    return url
  }

  return async (
    values: PinkValues,
    { setSubmitting, setStatus }: FormikHelpers<PinkValues>
  ) => {
    if (!api || !contract || !estimation || !account) return;

    const injector = await web3FromAddress(account.address);
    console.log("Minting Image... ");
    console.log("PinkValues", values);
    console.log("Estimations", estimation);
    console.log("Estimations.storageDeposit", estimation.storageDeposit.asCharge.toNumber());
    console.log("Estimations.price", estimation.price);
    console.log("Estimation.gasRequired", estimation.gasRequired);

    // upload image to nft.storage
    await uploadImage(values);

    const newLimit = doubleGasLimit(api, estimation.gasRequired);

    try {
      const tx: SubmittableExtrinsic<"promise", ContractSubmittableResult> =
        contract.tx["pinkMint"](
          {
            gasLimit: newLimit,
            storageDepositLimit: estimation.storageDeposit.asCharge,
            value: estimation.price,
          },
          values.contractType,
          values.ipfs
        );
      const unsub = await tx.signAndSend(
        account.address,
        { signer: injector.signer },
        (result) => {
          const events: UIEvent[] = [];
          let slug = "";
          setSubmitting(true);

          if (result.isInBlock) {
            result.contractEvents?.forEach(({ event, args }) => {
              slug = args[0].toHuman()?.toString() || "";
              events.push({
                name: event.identifier,
                message: `${event.docs.join()}`,
              });
            });
            result.events.forEach(({ event }) => {
              let message = "";
              if (event.section === "balances") {
                const data = event.data.toHuman() as {
                  who: string;
                  amount: string;
                };

                message = `Amount: ${data.amount}`;
              }
              event.method !== "ContractEmitted" &&
                events.push({
                  name: `${event.section}:${event.method}`,
                  message,
                });
            });
            if (!result.dispatchError) {
              setStatus({ finalized: true, events, errorMessage: "", slug });
            } else {
              let message = "Unknown Error";
              if (result.dispatchError.isModule) {
                const decoded = api.registry.findMetaError(
                  result.dispatchError.asModule
                );
                message = `${decoded.section.toUpperCase()}.${decoded.method
                  }: ${decoded.docs}`;
              }
              setStatus({
                finalized: true,
                events,
                errorMessage: message,
              });
            }
            setSubmitting(false);
            unsub && unsub();
          }
        }
      );
    } catch (error) {
      // TODO: show error message
      console.error(error);
      throw error;
    }
  };

};
