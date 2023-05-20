import { SetStateAction, useState } from "react";
import { PinkValues } from "../types";

export const ModelSelector = ({values }: { values: PinkValues }) => {
    const [model, setModel] = useState<string>(values.aiModel);

    const modelChanged = (e: { target: { value: SetStateAction<string> } }) => {
        console.log("modelChanged", e.target.value);
        values.aiModel = e.target.value.toString();
        setModel(values.aiModel);
      };

    return (
<div className="group">
        <label htmlFor="aimodel">A.I. Model</label>
        <select
          name="aimodel"
          value={model}
          onChange={modelChanged}
          style={{ display: "block" }}
        >
          <option
            value="https://api-inference.huggingface.co/models/Joeythemonster/anything-midjourney-v-4-1"
            label="Anything MidJourney"
          ></option>
          <option
            value="https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4"
            label="Stable Diffusion v1.4"
          ></option>
          <option
            value="https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2"
            label="Stable Diffusion v2.0"
          ></option>
        </select>
      </div>
    );
};