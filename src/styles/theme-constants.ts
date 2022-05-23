export class ThemeConstants {

    /**
     * The spacing transformation value.
     */
    static Spacing = 4;

    //#region App bar

    /**
     * The height of the app bar as a factor of the spacing transformation value.
     */
    static AppBarHeightScale = 16;

    /**
     * Elevation (in dp) of the app bar when it's in the elevated state.
     * @see https://material.io/design/environment/elevation.html
     */
    static AppBarElevatedElevation = 4;

    static AppBarElevatedScrollThreshold = 15;

    //#endregion

    //#region Navigation drawer

    /**
     * The width of the navigation drawer in its condensed state as a factor of the
     * spacing transformation value.
     */
    static NavigationDrawerCondensedWidthScale = 16;
 
    /**
     * The width of the navigation drawer in its expanded state as a factor of the
     * spacing transformation value.
     */
    static NavigationDrawerExpandedWidthScale = 64;

    //#endregion


    //#region Other scaling values

    /**
     * The height of the bottom bar as a factor of the spacing transformation value.
     */
    static BottomBarHeightScale = 16;

    /**
     * The width of the custom scrollbars as a factor of the spacing transformation
     * value.
     */
    static ScrollbarWidthScale = 2;

    //#endregion


    //#region Style property value

    static FontFamilyGoogleSans = 'Google Sans, Roboto, sans-serif';

    static FontFamilyRoboto = 'Roboto, sans-serif';

    //#endregion


    //#region Style class names

    static ClassScrollbarTrackBorder = 'scrollbar-track-border';

    static ClassScrollbarHidden = 'scrollbar-hidden';

    //#endregion

    private constructor () {
        
    }

}
