import { GameItemQuantity } from '@fgo-planner/types';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { ReactNode, useMemo } from 'react';
import { GameItemConstants } from '../../../../constants';
import { useGameItemMap } from '../../../../hooks/data/use-game-item-map.hook';
import { GameItemMap } from '../../../../types/data';
import { ImmutableArray } from '../../../../types/internal';
import { MasterItemListHeader } from './master-item-list-header.component';
import { StyleClassPrefix as MasterItemListRowLabelStyleClassPrefix } from './master-item-list-row-label.component';
import { MasterItemListRow, MasterItemRowData, StyleClassPrefix as MasterItemListRowStyleClassPrefix } from './master-item-list-row.component';

type ItemCategory = { label: string; itemIds: ReadonlyArray<number> };

type ListCategoryData = { label: string; rows: Array<MasterItemRowData> };

type ListData = Array<ListCategoryData>;

type Props = {
    editMode: boolean;
    viewLayout?: any; // TODO Make use of this
    masterItems: Array<GameItemQuantity>;
};

const ItemCategories: ImmutableArray<ItemCategory> = [
    {
        label: 'Skill Gems',
        itemIds: GameItemConstants.SkillGems
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
        label: 'Ascension Statues',
        itemIds: GameItemConstants.AscensionStatues
    },
    {
        label: 'Other Materials',
        itemIds: [
            ...GameItemConstants.OtherEnhancementMaterials,
            GameItemConstants.QpItemId
        ]
    },
];

const generateListData = (masterItems: Array<GameItemQuantity>, gameItemMap: GameItemMap): ListData => {
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
    const listViewData: ListData = [];
    for (const itemCategory of ItemCategories) {

        const rows = [];
        for (const itemId of itemCategory.itemIds) {
            /*
             * Retrieve item data from items map.
             */
            const gameItem = gameItemMap[itemId];
            if (!gameItem) {
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

            rows.push({ gameItem, quantity: masterItem });
        }
        listViewData.push({ label: itemCategory.label, rows });
    }

    return listViewData;
};

const StyleClassPrefix = 'MasterItemList';

const StyleProps = {
    pb: 12,
    [`& .${StyleClassPrefix}-item-category`]: {
        pb: 8
    },
    [`& .${MasterItemListRowStyleClassPrefix}-root`]: {
        display: 'flex',
        alignContent: 'center',
        alignItems: 'center',
        height: 52,
        pl: 4,
        pr: 8,
        py: 0,
        fontSize: '0.875rem',
        [`& .${MasterItemListRowLabelStyleClassPrefix}-item-name`]: {
            px: 4
        }
    }
} as SystemStyleObject<Theme>;

export const MasterItemList = React.memo(({ editMode, masterItems }: Props) => {

    const gameItemMap = useGameItemMap();

    const listViewData = useMemo(() => {
        if (!gameItemMap) {
            return [];
        }
        return generateListData(masterItems, gameItemMap);
    }, [masterItems, gameItemMap]);

    const renderItemRow = (data: MasterItemRowData, index: number): ReactNode => {
        return (
            <MasterItemListRow
                key={index}
                data={data}
                editMode={editMode}
            />
        );
    };

    const renderItemCategory = (category: ListCategoryData, key: number): ReactNode => {
        return (
            <div key={key} className={`${StyleClassPrefix}-item-category`}>
                <MasterItemListHeader categoryLabel={category.label} showQuantityLabel={key === 0} />
                {category.rows.map(renderItemRow)}
            </div>
        );
    };

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            {listViewData.map(renderItemCategory)}
        </Box>
    );

});
