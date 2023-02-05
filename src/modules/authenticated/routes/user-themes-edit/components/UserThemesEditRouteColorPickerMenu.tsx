import { Nullable } from '@fgo-planner/common-core';
import { RgbaColor } from '@fgo-planner/data-core';
import { Menu, PopoverOrigin } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import React from 'react';
import { RgbaColorPicker, RgbColor, RgbColorPicker } from 'react-colorful';
import { ThemeConstants } from '../../../../../styles/ThemeConstants';
import { ModalOnCloseHandler } from '../../../../../types';

type Props = {
    color: RgbaColor,
    title?: string,
    allowEditAlpha?: boolean,
    anchorEl: Nullable<Element>;
    onChange?: (color:RgbaColor | RgbColor) => void;
    onClose?: ModalOnCloseHandler;
};

const MenuAnchorOrigin: PopoverOrigin = {
    vertical: 'bottom',
    horizontal: 'right'
};

const MenuTransformOrigin: PopoverOrigin = {
    vertical: -1 * ThemeConstants.Spacing,
    horizontal: 'right'
};

const StyleClassPrefix = 'UserThemesEditRouteColorPickerMenu';

const StyleProps = {
    [`& .${StyleClassPrefix}-title`]: {
        fontFamily: ThemeConstants.FontFamilyGoogleSans
    },
    [`& .${StyleClassPrefix}-picker-container`]: {
        '& .react-colorful__saturation': {
            borderRadius: 0
        },
        '& .react-colorful__last-control': {
            borderRadius: 0
        }
    }
} as SystemStyleObject<Theme>;

// TODO Make this a generic component
export const UserThemesEditRouteColorPickerMenu = React.memo((props: Props) => {

    const {
        color,
        title,
        allowEditAlpha,
        anchorEl,
        onChange,
        onClose
    } = props;

    const pickerColor = { ...color }; // Forces color picker to update.

    return (
        <Menu
            // PaperProps={{ className }}
            sx={StyleProps}
            anchorEl={anchorEl}
            // getContentAnchorEl={null}
            anchorOrigin={MenuAnchorOrigin}
            transformOrigin={MenuTransformOrigin}
            open={!!anchorEl}
            onClose={onClose}
            keepMounted
        >
            <div>
                <div className={`${StyleClassPrefix}-title`}>
                    {title}
                </div>
                <div className={`${StyleClassPrefix}-picker-container`}>
                    {allowEditAlpha ?
                        <RgbaColorPicker color={pickerColor} onChange={onChange} /> :
                        <RgbColorPicker color={pickerColor} onChange={onChange} />
                    }
                </div>
                {/* TODO Add real time color info */}
            </div>
        </Menu>
    );

});
