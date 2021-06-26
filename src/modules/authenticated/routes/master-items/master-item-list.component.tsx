import { makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { ReactNode, useMemo } from 'react';
import { GameItemConstants } from '../../../../constants';
import { useGameItemMap } from '../../../../hooks/data/use-game-item-map.hook';
import { GameItemMap } from '../../../../services/data/game/game-item.service';
import { GameItem, GameItemQuantity } from '../../../../types';
import { MasterItemListHeader } from './master-item-list-header.component';
import { MasterItemListRow } from './master-item-list-row.component';

type ItemCategory = { label: string; itemIds: ReadonlyArray<number> };

type ListViewDataItem = { item: GameItem; masterData: GameItemQuantity };

type ListViewDataCategory = { label: string; items: Array<ListViewDataItem> };

type ListViewData = Array<ListViewDataCategory>;

type Props = {
    editMode: boolean;
    viewLayout?: any; // TODO Make use of this
    masterItems: Array<GameItemQuantity>;
};

const ItemCategories: ReadonlyArray<ItemCategory> = [
    {
        label: 'Skill Gems',
        itemIds: GameItemConstants.SkillGems
    },
    {
        label: 'Ascension Statues',
        itemIds: GameItemConstants.AscensionStatues
    },
    {
        label: 'Bronze Materials',
        itemIds: GameItemConstants.BronzeEnhancementMaterials
    },
    {
        label: 'Silver Materials',
        itemIds: GameItemConstants.SilverEnhancementMaterials
    },
    {
        label: 'Gold Materials',
        itemIds: GameItemConstants.GoldEnhancementMaterials
    },
    {
        label: 'Other Materials',
        itemIds: [
            ...GameItemConstants.OtherEnhancementMaterials,
            GameItemConstants.QpItemId
        ]
    },
];

const generateListViewData = (masterItems: Array<GameItemQuantity>, gameItemMap: GameItemMap): ListViewData => {
    /*
     * Convert the user account items into a map for faster lookup.
     */
    const masterItemsMap: { [key: number]: GameItemQuantity } = {};
    for (const masterItem of masterItems) {
        masterItemsMap[masterItem.itemId] = masterItem;
    }

    /*
     * Generate the view data array.
     */
    const listViewData: ListViewData = [];
    for (const itemCategory of ItemCategories) {

        const items: ListViewDataItem[] = [];
        for (const itemId of itemCategory.itemIds) {

            /*
             * Retrieve item data from items map.
             */
            const item = gameItemMap[itemId];
            if (!item) {
                console.warn(`Item ID ${itemId} could not be retrieved from the map.`);
            }

            /*
             * Retrieve user data for the item from the user items map. If the item is not
             * present in the user data, then backfill it. The only exception is QP, which
             * is displayed on the screen but not stored as a master item.
             */
            let masterItem = masterItemsMap[itemId];
            if (!masterItem) {
                masterItem = { itemId, quantity: 0 };
                // TODO Is it bad practice to modify an object in props?
                masterItems.push(masterItem);
            }

            items.push({ item, masterData: masterItem });
        }
        listViewData.push({ label: itemCategory.label, items });
    }

    return listViewData;
};

const style = (theme: Theme) => ({
    root: {
        paddingBottom: theme.spacing(12)
    },
    itemCategory: {
        paddingBottom: theme.spacing(8),
        '& .section-subheader': {
            paddingTop: theme.spacing(2)
        }
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterItemList'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterItemList = React.memo(({ editMode, masterItems }: Props) => {

    const classes = useStyles();

    const gameItemMap = useGameItemMap();

    const listViewData = useMemo(() => {
        if (!gameItemMap) {
            return [];
        }
        return generateListViewData(masterItems, gameItemMap);
    }, [masterItems, gameItemMap]);

    const renderItemRow = (item: ListViewDataItem, key: number): ReactNode => {
        return (
            <MasterItemListRow key={key} item={item} editMode={editMode} />
        );
    };

    const renderItemCategory = (category: ListViewDataCategory, key: number): ReactNode => {
        return (
            <div className={classes.itemCategory} key={key}>
                <MasterItemListHeader categoryLabel={category.label} showQuantityLabel={key === 0} />
                {category.items.map(renderItemRow)}
            </div>
        );
    };

    return (
        <div className={classes.root}>
            {listViewData.map(renderItemCategory)}
        </div>
    );

});
