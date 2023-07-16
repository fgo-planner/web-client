import { CollectionUtils, Immutable } from '@fgo-planner/common-core';
import { GameServant } from '@fgo-planner/data-core';
import { Theme } from '@mui/material';
import { alpha, Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { ReactNode, useEffect } from 'react';
import { useMultiSelectHelperForMouseEvent } from '../../../../hooks/user-interface/list-select-helper/useMultiSelectHelperForMouseEvent';
import { ThemeConstants } from '../../../../styles/ThemeConstants';
import { ServantSelectListRow, StyleClassPrefix as ServantSelectListRowStyleClassPrefix } from './ServantSelectListRow';

type Props<T> = {
    disabledIds?: ReadonlySet<number>;
    getGameServantFunction: (value: T) => Immutable<GameServant>;
    getIdFunction: (value: T) => number;
    onSelectionChange: (selectedIds: ReadonlySet<number>) => void;
    selectedIds: ReadonlySet<number>;
    servantsData?: ReadonlyArray<T>;
    showThumbnail?: boolean;
};

const NoServantsAvailable = 'No servants available.';

export const StyleClassPrefix = 'ServantSelectList';

const StyleProps = (theme: SystemTheme) => {

    const { palette } = theme as Theme;

    return {
        [`& .${StyleClassPrefix}-not-available-message`]: {
            textAlign: 'center',
            color: palette.text.disabled,
            // fontStyle: 'italic',
            pt: 8,
            px: 4
        },
        [`& .${ServantSelectListRowStyleClassPrefix}-root`]: {
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: palette.divider,
            [`& .${ServantSelectListRowStyleClassPrefix}-checkbox`]: {
                px: 1
            },
            [`& .${ServantSelectListRowStyleClassPrefix}-name`]: {
                fontSize: '0.875rem',
                px: 4
            },
            '&:hover': {
                backgroundColor: alpha(palette.text.primary, ThemeConstants.HoverAlpha)
            },
            [`&.${ServantSelectListRowStyleClassPrefix}-active`]: {
                backgroundColor: alpha(palette.primary.main, ThemeConstants.ActiveAlpha),
                '&:hover': {
                    backgroundColor: alpha(palette.primary.main, ThemeConstants.ActiveHoverAlpha)
                }
            },
            [`&.${ServantSelectListRowStyleClassPrefix}-disabled`]: {
                cursor: 'default',
                backgroundColor: 'unset'
            },
            '&>.MuiButton-root:not(:last-of-type)': {
                mr: 4
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

export const ServantSelectList = React.memo(<T,>(props: Props<T>) => {

    const {
        disabledIds,
        getGameServantFunction,
        getIdFunction,
        onSelectionChange,
        selectedIds,
        servantsData = CollectionUtils.emptyArray(),
        showThumbnail
    } = props;

    const {
        selectionResult,
        handleItemClick
    } = useMultiSelectHelperForMouseEvent(
        servantsData,
        selectedIds,
        getIdFunction,
        {
            disabledIds,
            rightClickAction: 'none',
            preventOverride: true
        }
    );

    useEffect(() => {
        onSelectionChange?.(selectionResult);
    }, [onSelectionChange, selectionResult]);

    const renderRow = (servantData: T, index: number): ReactNode => {
        const servantId = getIdFunction(servantData);
        const gameServant = getGameServantFunction(servantData);
        const selected = selectedIds.has(servantId);
        const disabled = !!disabledIds?.has(servantId);
        return (
            <ServantSelectListRow
                key={servantId}
                disabled={disabled}
                gameServant={gameServant}
                index={index}
                onClick={handleItemClick}
                selected={selected}
                showThumbnail={showThumbnail}
            />
        );
    };

    let contentNode: ReactNode;
    if (servantsData.length) {
        contentNode = <>{servantsData.map(renderRow)}</>;
    } else {
        contentNode = (
            <div className={`${StyleClassPrefix}-not-available-message`}>
                {NoServantsAvailable}
            </div>
        );
    }

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            {contentNode}
        </Box>
    );

}) as <T> (props: Props<T>) => JSX.Element;
