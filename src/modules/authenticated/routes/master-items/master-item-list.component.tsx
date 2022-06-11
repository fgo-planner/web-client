import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { ReactNode } from 'react';
import { GameItemConstants } from '../../../../constants';
import { useGameItemMap } from '../../../../hooks/data/use-game-item-map.hook';
import { ImmutableArray, ReadonlyRecord } from '../../../../types/internal';
import { MasterItemListHeader } from './master-item-list-header.component';
import { StyleClassPrefix as MasterItemListRowLabelStyleClassPrefix } from './master-item-list-row-label.component';
import { MasterItemListRow, StyleClassPrefix as MasterItemListRowStyleClassPrefix } from './master-item-list-row.component';

type ItemCategory = {
    key: string;
    label: string;
    itemIds: ReadonlyArray<number>;
};

type Props = {
    editMode: boolean;
    itemQuantities: ReadonlyRecord<number, number>;
    onChange: (itemId: number, quantity: number) => void;
    qp: number;
};

const ItemCategories: ImmutableArray<ItemCategory> = [
    {
        key: 'skill-gems',
        label: 'Skill Gems',
        itemIds: GameItemConstants.SkillGems
    },
    {
        key: 'bronze-mats',
        label: 'Bronze Materials',
        itemIds: GameItemConstants.BronzeEnhancementMaterials
    },
    {
        key: 'silver-mats',
        label: 'Silver Materials',
        itemIds: GameItemConstants.SilverEnhancementMaterials
    },
    {
        key: 'gold-mats',
        label: 'Gold Materials',
        itemIds: GameItemConstants.GoldEnhancementMaterials
    },
    {
        key: 'statues',
        label: 'Ascension Statues',
        itemIds: GameItemConstants.AscensionStatues
    },
    {
        key: 'other',
        label: 'Other Materials',
        itemIds: [
            ...GameItemConstants.OtherEnhancementMaterials,
            GameItemConstants.QpItemId
        ]
    },
];

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

export const MasterItemList = React.memo((props: Props) => {

    const {
        editMode,
        itemQuantities,
        onChange,
        qp
    } = props;

    const gameItemMap = useGameItemMap();

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
                editMode={editMode}
                onChange={onChange}
            />
        );
    };

    const renderItemCategory = (category: ItemCategory, index: number): ReactNode => {
        return (
            <div key={category.key} className={`${StyleClassPrefix}-item-category`}>
                <MasterItemListHeader categoryLabel={category.label} showQuantityLabel={index === 0} />
                {category.itemIds.map(renderItemRow)}
            </div>
        );
    };

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            {ItemCategories.map(renderItemCategory)}
        </Box>
    );

});
