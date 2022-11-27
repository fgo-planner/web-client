import { GameItemBackground, InstantiatedServantBondLevel } from '@fgo-planner/data-core';

const _InternalAssetsBaseUrl = `${process.env.PUBLIC_URL}/assets`;

const _InternalIconAssetsBaseUrl = `${_InternalAssetsBaseUrl}/icons`;

const _InternalThumbnailAssetsBaseUrl = `${_InternalAssetsBaseUrl}/thumbnails`;

const _InternalBackgroundAssetsBaseUrl = `${_InternalAssetsBaseUrl}/backgrounds`;

const _InternalSoundAssetsBaseUrl = `${_InternalAssetsBaseUrl}/sounds`;

const _AtlasAcademyAssetsBaseUrl = 'https://assets.atlasacademy.io/GameData/JP';

export const ItemImageBaseUrl = `${_AtlasAcademyAssetsBaseUrl}/Items`;

export const ItemBackgroundMap: { readonly [ key in GameItemBackground ]: string } = {
    [GameItemBackground.None]: `${_InternalThumbnailAssetsBaseUrl}/blank.png`,
    [GameItemBackground.Bronze]: `${_InternalThumbnailAssetsBaseUrl}/item_bg_bronze.png`,
    [GameItemBackground.Silver]: `${_InternalThumbnailAssetsBaseUrl}/item_bg_silver.png`,
    [GameItemBackground.Gold]: `${_InternalThumbnailAssetsBaseUrl}/item_bg_gold.png`,
    [GameItemBackground.QPReward]: `${_InternalThumbnailAssetsBaseUrl}/item_bg_qp.png`,
};

export const ServantAscensionOffIcon = `${_InternalIconAssetsBaseUrl}/ascension_off.png`;

export const ServantAscensionOnIcon = `${_InternalIconAssetsBaseUrl}/ascension_on.png`;

export const ServantBondIconMap: { readonly [key in InstantiatedServantBondLevel]: string } = {
    0: `${_InternalIconAssetsBaseUrl}/bond_0.png`,
    1: `${_InternalIconAssetsBaseUrl}/bond_1.png`,
    2: `${_InternalIconAssetsBaseUrl}/bond_2.png`,
    3: `${_InternalIconAssetsBaseUrl}/bond_3.png`,
    4: `${_InternalIconAssetsBaseUrl}/bond_4.png`,
    5: `${_InternalIconAssetsBaseUrl}/bond_5.png`,
    6: `${_InternalIconAssetsBaseUrl}/bond_6.png`,
    7: `${_InternalIconAssetsBaseUrl}/bond_7.png`,
    8: `${_InternalIconAssetsBaseUrl}/bond_8.png`,
    9: `${_InternalIconAssetsBaseUrl}/bond_9.png`,
    10: `${_InternalIconAssetsBaseUrl}/bond_10.png`,
    11: `${_InternalIconAssetsBaseUrl}/bond_grailed.png`,
    12: `${_InternalIconAssetsBaseUrl}/bond_grailed.png`,
    13: `${_InternalIconAssetsBaseUrl}/bond_grailed.png`,
    14: `${_InternalIconAssetsBaseUrl}/bond_grailed.png`,
    15: `${_InternalIconAssetsBaseUrl}/bond_grailed.png`
};

export const ServantClassIconBaseUrl = `${_AtlasAcademyAssetsBaseUrl}/ClassIcons`;

export const ServantNoblePhantasmIconLargeUrl = `${_InternalIconAssetsBaseUrl}/np_large.png`;

export const ServantNoblePhantasmIconSmallUrl = `${_InternalIconAssetsBaseUrl}/np_small.png`;

export const ServantThumbnailBaseUrl = `${_AtlasAcademyAssetsBaseUrl}/Faces`;

export const DefaultLightThemeBackground = `${_InternalBackgroundAssetsBaseUrl}/light_default.jpg`;

export const DefaultDarkThemeBackground = `${_InternalBackgroundAssetsBaseUrl}/dark_default2.jpg`;

export const BackgroundMusic = `${_InternalSoundAssetsBaseUrl}/background.mp3`;
