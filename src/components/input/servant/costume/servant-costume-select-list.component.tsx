import { ImmutableArray } from '@fgo-planner/common-core';
import { GameServant } from '@fgo-planner/data-core';
import { Theme } from '@mui/material';
import { alpha, Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { ReactNode } from 'react';
import { useGameServantCostumeList } from '../../../../hooks/data/use-game-servant-costume-list.hook';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { GameServantCostumeListData } from '../../../../types/data';
import { ServantCostumeSelectListRow, StyleClassPrefix as ServantCostumeSelectListRowStyleClassPrefix } from './servant-costume-select-list-row.component';

type Props = {
    disabledCostumeIds?: ReadonlySet<number>;
    gameServants: ImmutableArray<GameServant>;
    onChange: (costumeId: number, selected: boolean) => void;
    selectedCostumeIds: ReadonlySet<number>;
};

const NoCostumesMessage = 'No costumes available for the selected servant(s).';

export const StyleClassPrefix = 'ServantCostumeSelectList';

const StyleProps = (theme: SystemTheme) => {

    const { palette } = theme as Theme;

    return {
        cursor: 'default',
        [`& .${StyleClassPrefix}-not-available-message`]: {
            textAlign: 'center',
            color: palette.text.disabled,
            // fontStyle: 'italic',
            pt: 8
        },
        [`& .${ServantCostumeSelectListRowStyleClassPrefix}-root`]: {
            display: 'flex',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: palette.divider,
            [`& .${ServantCostumeSelectListRowStyleClassPrefix}-name`]: {
                fontSize: '0.875rem',
                px: 4
            },
            '&:hover': {
                backgroundColor: alpha(palette.text.primary, ThemeConstants.HoverAlpha)
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
        onChange,
        selectedCostumeIds
    } = props;

    const costumeList = useGameServantCostumeList(gameServants);

    const renderRow = (costumeData: GameServantCostumeListData): ReactNode => {
        const { costumeId } = costumeData;
        return (
            <ServantCostumeSelectListRow
                key={costumeId}
                costumeData={costumeData}
                onChange={onChange}
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
