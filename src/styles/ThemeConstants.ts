export namespace ThemeConstants {

    //#region Global spacing

    /**
     * The spacing transformation value.
     */
    export const Spacing = 4;

    /**
     * The spacing transformation function.
     */
    export const spacingFunction = (factor: number) => `${factor / Spacing}em`;

    //#endregion


    //#region App bar

    /**
     * The height of the app bar as a factor of the spacing transformation value.
     */
    export const AppBarHeightScale = 16;

    /**
     * The height of the app bar as a factor of the spacing transformation value.
     */
    export const AppBarHeightScaleCondensed = 14;

    /**
     * Elevation (in dp) of the app bar when it's in the elevated state.
     * @see https://material.io/design/environment/elevation.html
     */
    export const AppBarElevatedElevation = 4;

    export const AppBarElevatedScrollThreshold = 15;

    //#endregion


    //#region Navigation drawer

    /**
     * The width of the navigation drawer in its condensed state as a factor of the
     * spacing transformation value.
     */
    export const NavigationDrawerCondensedWidthScale = 16;

    /**
     * The width of the navigation drawer in its expanded state as a factor of the
     * spacing transformation value.
     */
    export const NavigationDrawerExpandedWidthScale = 64;

    //#endregion


    //#region Navigation rail

    /**
     * The width in column layout, or height in row layout, of the navigation rail
     * as a factor of the spacing transformation value.
     */
    export const NavigationRailSizeScale = 14;

    //#endregion


    //#region Other scaling values

    /**
     * The height of the bottom bar as a factor of the spacing transformation value.
     */
    export const BottomBarHeightScale = 16;

    /**
     * The width of the custom scrollbars as a factor of the spacing transformation
     * value.
     */
    export const ScrollbarWidthScale = 2.5;

    //#endregion


    //#region Alpha values

    export const ActiveAlpha = 0.07;

    export const ActiveHoverAlpha = 0.12;

    export const HoverAlpha = 0.07;

    //#endregion


    //#region Style property value

    export const FontFamilyGoogleSans = 'Google Sans, Roboto, sans-serif';

    export const FontFamilyRoboto = 'Roboto, sans-serif';

    //#endregion


    //#region Style class names

    export const ClassBackdropBlur = 'backdrop-blur';

    export const ClassFullHeight = 'full-height';

    export const ClassFullWidth = 'full-width';

    export const ClassScrollbarHidden = 'scrollbar-hidden';

    export const ClassScrollbarTrackBorder = 'scrollbar-track-border';

    //#endregion

}
