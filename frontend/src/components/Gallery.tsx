import { useWallet } from "useink";
import { usePinkPsp34Contract } from "../hooks/usePinkPsp34Contract";
import { useEffect, useState } from "react";
import { pickDecoded, pickResultOk } from "useink/utils";
import { Id } from "../types";
import { Error } from "./Error";
import axios from "axios";
import { wrap } from "module";

type Props = {};

export const Gallery: React.FC<Props> = ({}) => {
  const [tokensUrls, setTokensUrls] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const { totalBalance, tokenUri } = usePinkPsp34Contract();
  const { account } = useWallet();

  const handleCloseError = () => setError("");

  const getTotalBalance = async (): Promise<Id[] | undefined> => {
    const result = await totalBalance?.send([account?.address], {
      defaultCaller: true,
    });
    const ownedTokens = pickDecoded<Id[]>(result);

    return ownedTokens;
  };

  const getProxiedUri = (ipfsUri: string | undefined): string | undefined => {
    const ipfsGateway = "https://ipfs.io/ipfs/";
    return ipfsUri ? ipfsUri.replace("ipfs://", ipfsGateway) : undefined;
  };

  const getTokensMetadata = async (
    tokens: Id[]
  ): Promise<(string | unknown)[]> => {
    const metadataUrls = await Promise.all(
      tokens.map(async (token) => {
        const result = await tokenUri?.send([token], {
          defaultCaller: true,
        });
        return getProxiedUri(pickResultOk<string, string>(result));
      })
    );

    return await Promise.all(
      metadataUrls.map(async (url) => {
        if (url) {
          const result = await axios.get(url);
          return result.data;
        } else {
          return undefined;
        }
      })
    );
  };

  const list = tokensUrls.map((url) => {
    return (
      <img
        src={url}
        key={url}
        alt="Token"
        style={{
          width: "120px",
          borderRadius: "12px",
          marginBottom: "8px",
          marginLeft: "16px",
        }}
      />
    );
  });

  const getNftImagesUrls = async (): Promise<void> => {
    try {
      const ownedTokens = await getTotalBalance();
      if (ownedTokens) {
        const metadata = (await getTokensMetadata(ownedTokens));

        const nftUrls = metadata.map((data: any) => {
          return getProxiedUri(data.image);
        });

        setTokensUrls(nftUrls as string[]);
      }
    } catch (err: any) {
      setError(`Can't load minted tokens preview: ${err.toString()}`);
    }
  };

  useEffect(() => {
    getNftImagesUrls();
  }, [account?.address]);

  return (
    <div>
      <div style={{display: 'flex', flexWrap: 'wrap', maxWidth: '420px'}}>{list}</div>
      <Error open={!!error} onClose={handleCloseError} message={error} />
    </div>
  );
};
