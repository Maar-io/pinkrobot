import { SetStateAction, useState } from "react";
import { AiStyle, AiStyles, PinkValues } from "../types";
import { aiStyles } from "../const";
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  RadioProps,
  styled,
} from "@mui/material";

const CustomRadio = styled(Radio)<RadioProps>(({ theme }) => ({
  color: "white",
  "&.Mui-checked": {
    color: "rgba(255, 105, 180, 0.9)",
  },
}));

export const StyleSelector = ({ values }: { values: PinkValues }) => {
  const [style, setStyle] = useState<AiStyle>(aiStyles.none);

  const styleChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStyle: AiStyle = aiStyles[e.target.value as keyof AiStyles];
    setStyle(newStyle);
    values.aiStyle = newStyle;
    console.log("modelChanged", newStyle);
  };

  return (
    <div className="Group">
      <FormControl component="fieldset">
        <RadioGroup
          name={"Style"}
          value={style}
          onChange={styleChanged}
          style={{ display: "block" }}
        >
          <FormControlLabel
            value={aiStyles.none}
            control={<CustomRadio />}
            label={aiStyles.none.name}
          />
          <FormControlLabel
            value={aiStyles.anime}
            control={<CustomRadio />}
            label={aiStyles.anime.name}
          />
          <FormControlLabel
            value={aiStyles.cartoon}
            control={<CustomRadio />}
            label={aiStyles.cartoon.name}
          />
          <FormControlLabel
            value={aiStyles.oil}
            control={<CustomRadio />}
            label={aiStyles.oil.name}
          />
          <FormControlLabel
            value={aiStyles.pixel}
            control={<CustomRadio />}
            label={aiStyles.pixel.name}
          />
          <FormControlLabel
            value={aiStyles.pop}
            control={<CustomRadio />}
            label={aiStyles.pop.name}
          />
          <FormControlLabel
            value={aiStyles.nouveau}
            control={<CustomRadio />}
            label={aiStyles.nouveau.name}
          />
          <FormControlLabel
            value={aiStyles.ink}
            control={<CustomRadio />}
            label={aiStyles.ink.name}
          />
          <FormControlLabel
            value={aiStyles.disney}
            control={<CustomRadio />}
            label={aiStyles.disney.name}
          />
          <FormControlLabel
            value={aiStyles.ghibli}
            control={<CustomRadio />}
            label={aiStyles.ghibli.name}
          />
          <FormControlLabel
            value={aiStyles.pixar}
            control={<CustomRadio />}
            label={aiStyles.pixar.name}
          />
          <FormControlLabel
            value={aiStyles.best}
            control={<CustomRadio />}
            label={aiStyles.best.name}
          />
          <FormControlLabel
            value={aiStyles.deviant}
            control={<CustomRadio />}
            label={aiStyles.deviant.name}
          />
          <FormControlLabel
            value={aiStyles.watercolor}
            control={<CustomRadio />}
            label={aiStyles.watercolor.name}
          />
          <FormControlLabel
            value={aiStyles.paper}
            control={<CustomRadio />}
            label={aiStyles.paper.name}
          />
        </RadioGroup>
      </FormControl>
    </div>
  );
};
