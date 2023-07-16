declare module '@mui/material/styles' {
    interface Palette {
        drawer?: Palette['primary'];
    }
    interface PaletteOptions {
        drawer?: PaletteOptions['primary'];
    }
}

export {};
