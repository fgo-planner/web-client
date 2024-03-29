import { CollectionUtils } from '@fgo-planner/common-core';
import { GameServantCostumeAggregatedData } from '@fgo-planner/data-core';
import { Theme } from '@mui/material';
import { alpha, Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { ReactNode, useEffect, useMemo } from 'react';
import { useMultiSelectHelperForMouseEvent } from '../../../../hooks/user-interface/list-select-helper/useMultiSelectHelperForMouseEvent';
import { ThemeConstants } from '../../../../styles/ThemeConstants';
import { ServantCostumeSelectListRow, StyleClassPrefix as ServantCostumeSelectListRowStyleClassPrefix } from './ServantCostumeSelectListRow';

type Props = {
    costumesData?: ReadonlyArray<GameServantCostumeAggregatedData>;
    disabledCostumeIds?: ReadonlySet<number>;
    selectedCostumeIds: ReadonlySet<number>;
    /**
     * Any costumes in the `disabledCostumeIds` will show as selected despite being
     * disabled.
     */
    showDisabledAsSelected?: boolean;
    onSelectionChange: (selectedCostumeIds: ReadonlySet<number>) => void;
};

const NoCostumesMessage = 'No costumes available for the selected servant(s).';

const getCostumeId = ({ costumeId }: GameServantCostumeAggregatedData): number => {
    return costumeId;
};

export const StyleClassPrefix = 'ServantCostumeSelectList';

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
        [`& .${ServantCostumeSelectListRowStyleClassPrefix}-root`]: {
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: palette.divider,
            [`& .${ServantCostumeSelectListRowStyleClassPrefix}-checkbox`]: {
                px: 1
            },
            [`& .${ServantCostumeSelectListRowStyleClassPrefix}-name`]: {
                fontSize: '0.875rem',
                px: 4
            },
            '&:hover': {
                backgroundColor: alpha(palette.text.primary, ThemeConstants.HoverAlpha)
            },
            [`&.${ServantCostumeSelectListRowStyleClassPrefix}-active`]: {
                backgroundColor: alpha(palette.primary.main, ThemeConstants.ActiveAlpha),
                '&:hover': {
                    backgroundColor: alpha(palette.primary.main, ThemeConstants.ActiveHoverAlpha)
                }
            },
            [`&.${ServantCostumeSelectListRowStyleClassPrefix}-disabled`]: {
                cursor: 'default',
                backgroundColor: 'unset'
            },
            '&>.MuiButton-root:not(:last-of-type)': {
                mr: 4
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

export const ServantCostumeSelectList = React.memo((props: Props) => {

    const {
        costumesData = CollectionUtils.emptyArray(),
        disabledCostumeIds,
        selectedCostumeIds,
        showDisabledAsSelected,
        onSelectionChange
    } = props;

    const disabledIds = useMemo((): ReadonlySet<number> => {
        const result = new Set<number>();
        for (const costumeData of costumesData) {
            if (costumeData.alwaysUnlocked) {
                result.add(costumeData.costumeId);
            }
        }
        return result;
    }, [costumesData]);

    const {
        selectionResult,
        handleItemClick
    } = useMultiSelectHelperForMouseEvent(
        costumesData,
        selectedCostumeIds,
        getCostumeId,
        {
            disabledIds,
            rightClickAction: 'none',
            preventOverride: true
        }
    );

    useEffect(() => {
        onSelectionChange?.(selectionResult);
    }, [onSelectionChange, selectionResult]);

    const renderRow = (costumeData: GameServantCostumeAggregatedData, index: number): ReactNode => {
        const { costumeId } = costumeData;
        const disabled = disabledCostumeIds?.has(costumeId);
        const selected = selectedCostumeIds.has(costumeId) || (disabled && showDisabledAsSelected);
        return (
            <ServantCostumeSelectListRow
                key={costumeId}
                index={index}
                costumeData={costumeData}
                onClick={handleItemClick}
                selected={!!selected}
                disabled={!!disabled}
            />
        );
    };

    let contentNode: ReactNode;
    if (costumesData.length) {
        contentNode = <>{costumesData.map(renderRow)}</>;
    } else {
        contentNode = (
            <div className={`${StyleClassPrefix}-not-available-message`}>
                {NoCostumesMessage}
            </div>
        );
    }

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            {contentNode}
        </Box>
    );

});
