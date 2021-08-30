import { RgbaColor } from '@fgo-planner/types';
import { makeStyles, Menu, PopoverOrigin, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React from 'react';
import { RgbaColorPicker, RgbColor, RgbColorPicker } from 'react-colorful';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { ModalOnCloseHandler, Nullable } from '../../../../types/internal';

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

const style = () => ({
    title: {
        fontFamily: ThemeConstants.FontFamilyGoogleSans
    },
    pickerContainer: {
        '& .react-colorful__saturation': {
            borderRadius: 0
        },
        '& .react-colorful__last-control': {
            borderRadius: 0
        }
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'UserThemeColorPickerMenu'
};

const useStyles = makeStyles(style, styleOptions);

export const UserThemeColorPickerMenu = React.memo((props: Props) => {

    const classes = useStyles();

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
            anchorEl={anchorEl}
            getContentAnchorEl={null}
            anchorOrigin={MenuAnchorOrigin}
            transformOrigin={MenuTransformOrigin}
            open={!!anchorEl}
            onClose={onClose}
            keepMounted
        >
            <div>
                <div className={classes.title}>
                    {title}
                </div>
                <div className={classes.pickerContainer}>
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
