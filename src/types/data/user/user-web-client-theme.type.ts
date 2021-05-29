import { RgbColor } from '../rgb-color.type';
import { RgbaColor } from '../rgba-color.type';

export type UserWebClientTheme = {

    backgroundImageUrl?: string;

    backgroundColor: RgbaColor;

    foregroundColor: RgbaColor;

    primaryColor: RgbColor;

    secondaryColor: RgbColor;

    dividerColor: RgbaColor;

    // TODO Add warning and error colors.

};
