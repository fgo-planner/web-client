import { ThemeOptions } from '@mui/material';

export type ThemeMode = 'light' | 'dark';

export type ThemeInfo = {
    themeOptions: ThemeOptions;
    themeMode: ThemeMode;
    backgroundImageUrl?: string;
};
