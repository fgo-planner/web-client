import { GameServant, GameServantCostume } from '@fgo-planner/types';
import { Checkbox, makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { Done } from '@material-ui/icons';
import clsx from 'clsx';
import React, { ChangeEvent, ReactNode, useCallback, useMemo } from 'react';
import { GameItemQuantity } from '../../../../components/game/item/game-item-quantity.component';
import { GameServantThumbnail } from '../../../../components/game/servant/game-servant-thumbnail.component';
import { StaticListRowContainer } from '../../../../components/list/static-list-row-container.component';
import { useGameItemMap } from '../../../../hooks/data/use-game-item-map.hook';

export type MasterServantCostumeRowData = GameServantCostume & {
    costumeId: number;
    servant: Readonly<GameServant>;
};

type Props = {
    costume: Readonly<MasterServantCostumeRowData>;
    unlocked?: boolean;
    editMode?: boolean;
    openLinksInNewTab?: boolean;
    onUnlockToggle?: (id: number, value: boolean) => void;
};

const ServantThumbnailSize = 48;

const style = (theme: Theme) => ({
    root: {
        height: 52,
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.875rem',
        '&:not(:hover) .play-icon': {
            opacity: 0
        }
    },
    unlockedStatus: {
        width: 42,
        padding: theme.spacing(0, 2),
        textAlign: 'center',
    },
    collectionNo: {
        width: 64,
        textAlign: 'center'
    },
    name: {
        flex: '1 1',
        minWidth: 0
    },
    unlockedIcon: {
        color: 'limegreen'
    },
    unlockMaterials: {
        display: 'flex',
        justifyContent: 'flex-end',
        paddingRight: theme.spacing(24)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterCostumesListRow'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterServantCostumesListRow = React.memo((props: Props) => {

    const {
        costume,
        unlocked,
        editMode,
        openLinksInNewTab,
        onUnlockToggle
    } = props;

    const {
        costumeId,
        servant,
        collectionNo,
        name,
        materials
    } = costume;

    const classes = useStyles();

    const gameItemMap = useGameItemMap();

    const handleUnlockCheckboxChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        onUnlockToggle && onUnlockToggle(costumeId, event.target.checked);
    }, [costumeId, onUnlockToggle]);

    const unlockedStatusNode: ReactNode = useMemo(() => {
        if (!editMode) {
            return (
                <div className={classes.unlockedStatus}>
                    {unlocked && <Done className={classes.unlockedIcon} />}
                </div>
            );
        }
        const defaultUnlocked = !materials.materials.length;
        return (
            <div className={classes.unlockedStatus}>
                {!defaultUnlocked && <Checkbox
                    checked={unlocked}
                    onChange={handleUnlockCheckboxChange}
                />}
            </div>
        );
    }, [classes, editMode, handleUnlockCheckboxChange, materials, unlocked]);

    const unlockMaterialNodes: ReactNode = useMemo(() => {
        if (!gameItemMap || !materials.materials.length) {
            return null;
        }
        const nodes: ReactNode[] = [];
        for (const material of materials.materials) {
            const { itemId, quantity } = material;
            const unlockMaterial = gameItemMap[itemId];
            if (!unlockMaterial) {
                continue;
            }
            nodes.push(
                <GameItemQuantity key={itemId} item={unlockMaterial} quantity={quantity} />
            );
        }
        return nodes;
    }, [gameItemMap, materials]);

    return (
        <StaticListRowContainer key={costumeId} borderBottom>
            <div className={classes.root}>
                {unlockedStatusNode}
                <GameServantThumbnail
                    variant="rounded"
                    size={ServantThumbnailSize}
                    servant={servant}
                    costumeId={costumeId}
                    enableLink
                    openLinkInNewTab={openLinksInNewTab}
                />
                <div className={classes.collectionNo}>
                    {collectionNo}
                </div>
                <div className={clsx(classes.name, 'truncate')}>
                    {name}
                </div>
                <div className={classes.unlockMaterials}>
                    {unlockMaterialNodes}
                </div>
            </div>
        </StaticListRowContainer>
    );

});
