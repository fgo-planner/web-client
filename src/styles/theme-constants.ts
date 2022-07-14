export class ThemeConstants {

    //#region Global spacing

    /**
     * The spacing transformation value.
     */
    static readonly Spacing = 4;

    /**
     * The spacing transformation function.
     */
    static readonly SpacingFunction = (factor: number) => `${factor / this.Spacing}rem`;

    //#endregion


    //#region App bar

    /**
     * The height of the app bar as a factor of the spacing transformation value.
     */
    static readonly AppBarHeightScale = 16;

    /**
     * The height of the app bar as a factor of the spacing transformation value.
     */
    static readonly AppBarHeightScaleCondensed = 14;

    /**
     * Elevation (in dp) of the app bar when it's in the elevated state.
     * @see https://material.io/design/environment/elevation.html
     */
    static readonly AppBarElevatedElevation = 4;

    static readonly AppBarElevatedScrollThreshold = 15;

    //#endregion


    //#region Navigation drawer

    /**
     * The width of the navigation drawer in its condensed state as a factor of the
     * spacing transformation value.
     */
    static readonly NavigationDrawerCondensedWidthScale = 16;

    /**
     * The width of the navigation drawer in its expanded state as a factor of the
     * spacing transformation value.
     */
    static readonly NavigationDrawerExpandedWidthScale = 64;

    //#endregion


    //#region Other scaling values

    /**
     * The height of the bottom bar as a factor of the spacing transformation value.
     */
    static readonly BottomBarHeightScale = 16;

    /**
     * The width of the custom scrollbars as a factor of the spacing transformation
     * value.
     */
    static readonly ScrollbarWidthScale = 2.5;

    //#endregion


    //#region Style property value

    static readonly FontFamilyGoogleSans = 'Google Sans, Roboto, sans-serif';

    static readonly FontFamilyRoboto = 'Roboto, sans-serif';

    //#endregion


    //#region Style class names

    static readonly ClassScrollbarTrackBorder = 'scrollbar-track-border';

    static readonly ClassScrollbarHidden = 'scrollbar-hidden';

    //#endregion

    private constructor() {

    }

}
