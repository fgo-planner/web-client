import { ReadonlyRecord } from '@fgo-planner/common-core';
import { GameItemConstants } from '@fgo-planner/data-core';
import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { ReactNode, SetStateAction, useMemo } from 'react';
import { useGameItemCategoryMap } from '../../../../hooks/data/use-game-item-category-map.hook';
import { useGameItemMap } from '../../../../hooks/data/use-game-item-map.hook';
import { GameItemCategory } from '../../../../types';
import { MasterItemListHeader } from './master-item-list-header.component';
import { StyleClassPrefix as MasterItemListRowLabelStyleClassPrefix } from './master-item-list-row-label.component';
import { MasterItemListRow, StyleClassPrefix as MasterItemListRowStyleClassPrefix } from './master-item-list-row.component';

type ItemCategory = {
    key: string;
    label: string;
    itemIds: ReadonlyArray<number>;
};

type Props = {
    itemQuantities: ReadonlyRecord<number, number>;
    qp: number;
    showQuantityHeaderLabel?: boolean;
    onChange: (itemId: number, quantity: SetStateAction<number>) => void;
};

const StyleClassPrefix = 'MasterItemList';

const StyleProps = (theme: SystemTheme) => {

    const { breakpoints } = theme as Theme;

    return {
        // backgroundColor: palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'auto',
        [`& .${StyleClassPrefix}-item-category`]: {
            pb: 8
        },
        [`& .${MasterItemListRowStyleClassPrefix}-root`]: {
            display: 'flex',
            alignContent: 'center',
            alignItems: 'center',
            height: 52,
            pl: 3,
            pr: 8,
            py: 0,
            fontSize: '0.875rem',
            [`& .${MasterItemListRowLabelStyleClassPrefix}-item-name`]: {
                px: 4,
                [breakpoints.down('sm')]: {
                    display: 'none'
                }
            },
            '& .MuiInputBase-input': {
                width: '8rem'
            },
            [breakpoints.down('sm')]: {
                pr: 6
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

export const MasterItemList = React.memo((props: Props) => {

    const gameItemMap = useGameItemMap();

    const gameItemCategoryMap = useGameItemCategoryMap();

    const {
        itemQuantities,
        qp,
        showQuantityHeaderLabel,
        onChange
    } = props;

    const itemCategories = useMemo((): Array<ItemCategory> => {
        if (!gameItemCategoryMap) {
            return [];
        }
        return [
            {
                key: 'skill-gems',
                label: 'Skill Gems',
                itemIds: [...gameItemCategoryMap[GameItemCategory.SkillGems]]
            },
            {
                key: 'bronze-mats',
                label: 'Bronze Materials',
                itemIds: [...gameItemCategoryMap[GameItemCategory.BronzeEnhancementMaterials]]
            },
            {
                key: 'silver-mats',
                label: 'Silver Materials',
                itemIds: [...gameItemCategoryMap[GameItemCategory.SilverEnhancementMaterials]]
            },
            {
                key: 'gold-mats',
                label: 'Gold Materials',
                itemIds: [...gameItemCategoryMap[GameItemCategory.GoldEnhancementMaterials]]
            },
            {
                key: 'statues',
                label: 'Ascension Statues',
                itemIds: [...gameItemCategoryMap[GameItemCategory.AscensionStatues]]
            },
            {
                key: 'other',
                label: 'Other Materials',
                itemIds: [
                    GameItemConstants.LoreItemId,
                    GameItemConstants.GrailItemId,
                    GameItemConstants.QpItemId
                ]
            },
        ];
    }, [gameItemCategoryMap]);

    if (!gameItemMap) {
        return null;
    }

    const renderItemRow = (itemId: number): ReactNode => {
        const gameItem = gameItemMap[itemId];
        if (!gameItem) {
            return;
        }
        const quantity = itemId === GameItemConstants.QpItemId ? qp : itemQuantities[itemId] || 0;
        return (
            <MasterItemListRow
                key={itemId}
                gameItem={gameItem}
                quantity={quantity}
                onChange={onChange}
            />
        );
    };

    const renderItemCategory = (category: ItemCategory, index: number): ReactNode => {
        return (
            <div key={category.key} className={`${StyleClassPrefix}-item-category`}>
                <MasterItemListHeader
                    categoryLabel={category.label}
                    showQuantityLabel={showQuantityHeaderLabel && index === 0}
                />
                {category.itemIds.map(renderItemRow)}
            </div>
        );
    };

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            {itemCategories.map(renderItemCategory)}
        </Box>
    );

});
