import { GameItemBackground, MasterServantBondLevel } from '../types';

export class AssetConstants {

    private static readonly _InternalAssetsBaseUrl = `${process.env.PUBLIC_URL}/assets`;

    private static readonly _InternalIconAssetsBaseUrl = `${AssetConstants._InternalAssetsBaseUrl}/icons`;

    private static readonly _InternalThumbnailAssetsBaseUrl = `${AssetConstants._InternalAssetsBaseUrl}/thumbnails`;

    private static readonly _InternalSoundAssetsBaseUrl = `${AssetConstants._InternalAssetsBaseUrl}/sounds`;

    private static readonly _AtlasAcademyAssetsBaseUrl = 'https://assets.atlasacademy.io/GameData/JP';

    static readonly ItemImageBaseUrl = `${AssetConstants._AtlasAcademyAssetsBaseUrl}/Items`;

    static readonly ItemBackgroundMap: { readonly [ key in GameItemBackground ]: string } = {
        [GameItemBackground.None]: `${AssetConstants._InternalThumbnailAssetsBaseUrl}/blank.png`,
        [GameItemBackground.Bronze]: `${AssetConstants._InternalThumbnailAssetsBaseUrl}/item_bg_bronze.png`,
        [GameItemBackground.Silver]: `${AssetConstants._InternalThumbnailAssetsBaseUrl}/item_bg_silver.png`,
        [GameItemBackground.Gold]: `${AssetConstants._InternalThumbnailAssetsBaseUrl}/item_bg_gold.png`,
        [GameItemBackground.QPReward]: `${AssetConstants._InternalThumbnailAssetsBaseUrl}/item_bg_qp.png`,
    };

    static readonly ServantAscensionOffIcon = `${AssetConstants._InternalIconAssetsBaseUrl}/ascension_off.png`;

    static readonly ServantAscensionOnIcon = `${AssetConstants._InternalIconAssetsBaseUrl}/ascension_on.png`;

    static readonly ServantBondIconMap: { readonly [key in MasterServantBondLevel]: string } = {
        0: `${AssetConstants._InternalIconAssetsBaseUrl}/bond_0.png`,
        1: `${AssetConstants._InternalIconAssetsBaseUrl}/bond_1.png`,
        2: `${AssetConstants._InternalIconAssetsBaseUrl}/bond_2.png`,
        3: `${AssetConstants._InternalIconAssetsBaseUrl}/bond_3.png`,
        4: `${AssetConstants._InternalIconAssetsBaseUrl}/bond_4.png`,
        5: `${AssetConstants._InternalIconAssetsBaseUrl}/bond_5.png`,
        6: `${AssetConstants._InternalIconAssetsBaseUrl}/bond_6.png`,
        7: `${AssetConstants._InternalIconAssetsBaseUrl}/bond_7.png`,
        8: `${AssetConstants._InternalIconAssetsBaseUrl}/bond_8.png`,
        9: `${AssetConstants._InternalIconAssetsBaseUrl}/bond_9.png`,
        10: `${AssetConstants._InternalIconAssetsBaseUrl}/bond_10.png`,
        11: `${AssetConstants._InternalIconAssetsBaseUrl}/bond_grailed.png`,
        12: `${AssetConstants._InternalIconAssetsBaseUrl}/bond_grailed.png`,
        13: `${AssetConstants._InternalIconAssetsBaseUrl}/bond_grailed.png`,
        14: `${AssetConstants._InternalIconAssetsBaseUrl}/bond_grailed.png`,
        15: `${AssetConstants._InternalIconAssetsBaseUrl}/bond_grailed.png`
    };

    static readonly ServantClassIconBaseUrl = `${AssetConstants._AtlasAcademyAssetsBaseUrl}/ClassIcons`;

    static readonly ServantNoblePhantasmIconLargeUrl = `${AssetConstants._InternalIconAssetsBaseUrl}/np_large.png`;

    static readonly ServantNoblePhantasmIconSmallUrl = `${AssetConstants._InternalIconAssetsBaseUrl}/np_small.png`;

    static readonly ServantThumbnailBaseUrl = `${AssetConstants._AtlasAcademyAssetsBaseUrl}/Faces`;

    static readonly BackgroundMusic = `${AssetConstants._InternalSoundAssetsBaseUrl}/background.mp3`;

}
