import { ImmutableArray } from '@fgo-planner/common-core';
import { GameServant } from '@fgo-planner/data-core';
import { Theme } from '@mui/material';
import { alpha, Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { ReactNode, useEffect } from 'react';
import { useGameServantCostumeList } from '../../../../hooks/data/use-game-servant-costume-list.hook';
import { useMultiSelectHelperForMouseEvent } from '../../../../hooks/user-interface/list-select-helper/use-multi-select-helper-for-mouse-event.hook';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { GameServantCostumeListData } from '../../../../types/data';
import { ServantCostumeSelectListRow, StyleClassPrefix as ServantCostumeSelectListRowStyleClassPrefix } from './servant-costume-select-list-row.component';

type Props = {
    disabledCostumeIds?: ReadonlySet<number>;
    gameServants: ImmutableArray<GameServant>;
    onSelectionChange: (selectedCostumeIds: ReadonlySet<number>) => void;
    selectedCostumeIds: ReadonlySet<number>;
};

const NoCostumesMessage = 'No costumes available for the selected servant(s).';

const getCostumeId = ({ costumeId }: GameServantCostumeListData): number => {
    return costumeId;
};

export const StyleClassPrefix = 'ServantCostumeSelectList';

const StyleProps = (theme: SystemTheme) => {

    const { palette } = theme as Theme;

    return {
        cursor: 'pointer',
        [`& .${StyleClassPrefix}-not-available-message`]: {
            textAlign: 'center',
            color: palette.text.disabled,
            // fontStyle: 'italic',
            pt: 8
        },
        [`& .${ServantCostumeSelectListRowStyleClassPrefix}-root`]: {
            display: 'flex',
            alignItems: 'center',
            pl: 1,
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: palette.divider,
            [`& .${ServantCostumeSelectListRowStyleClassPrefix}-thumbnail`]: {
                ml: 1
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
                },
            },
            '&>.MuiButton-root:not(:last-of-type)': {
                mr: 4
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

export const ServantCostumeSelectList = React.memo((props: Props) => {

    const {
        disabledCostumeIds,
        gameServants,
        onSelectionChange,
        selectedCostumeIds
    } = props;

    const costumeList = useGameServantCostumeList(gameServants);

    const {
        selectionResult,
        handleItemClick
    } = useMultiSelectHelperForMouseEvent(
        costumeList,
        selectedCostumeIds,
        getCostumeId,
        {
            rightClickAction: 'none',
            preventOverride: true
        }
    );

    useEffect(() => {
        onSelectionChange?.(selectionResult);
    }, [onSelectionChange, selectionResult]);

    const renderRow = (costumeData: GameServantCostumeListData, index: number): ReactNode => {
        const { costumeId } = costumeData;
        return (
            <ServantCostumeSelectListRow
                key={costumeId}
                index={index}
                costumeData={costumeData}
                onClick={handleItemClick}
                selected={selectedCostumeIds.has(costumeId)}
                disabled={disabledCostumeIds?.has(costumeId) || false}
            />
        );
    };

    let contentNode: ReactNode;
    if (costumeList.length) {
        contentNode = <>{costumeList.map(renderRow)}</>;
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
