import { GameItemConstants } from '@fgo-planner/data-core';
import { alpha, DialogContent } from '@mui/material';
import { SystemStyleObject, Theme as SystemTheme, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { SetStateAction, useCallback } from 'react';
import { useForceUpdate } from '../../../../../hooks/utils/useForceUpdate';
import { ThemeConstants } from '../../../../../styles/ThemeConstants';
import { MasterItemList } from '../../../components/master/item/list/MasterItemList';
import { PlanRouteMasterItemsEditDialogData } from './PlanRouteMasterItemsEditDialogData.type';

export type PlanServantEditTab = 'enhancements' | 'costumes';

type Props = {
    /**
     * DTO containing the dialog data that will be returned to the parent component
     * on dialog close. This object will be modified directly.
     */
    dialogData: PlanRouteMasterItemsEditDialogData;
};

export const StyleClassPrefix = 'PlanRoutePlanMasterItemsEditDialogContent';

const StyleProps = (theme: Theme) => {

    const { palette } = theme as Theme;

    return {
        p: 0,
        mx: 6,
        mb: 5,
        height: 640,
        borderRadius: 1,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: alpha(palette.text.primary, 0.23)
    } as SystemStyleObject<SystemTheme>;
};


/**
 * React.memo is not needed for this component because in most cases a re-render
 * of the parent component (`PlanMasterItemsEditDialog`) will also trigger a
 * re-render of this component.
 */
/** */
export const PlanRoutePlanMasterItemsEditDialogContent: React.FC<Props> = (props: Props): JSX.Element => {

    const forceUpdate = useForceUpdate();

    const dialogData = props.dialogData;

    //#region Input event handlers

    const handleChange = useCallback((itemId: number, quantity: SetStateAction<number>): void => {
        const isQp = itemId === GameItemConstants.QpItemId;
        const currentQuantity = isQp ? dialogData.qp : (dialogData.items[itemId] || 0);
        let updatedQuantity: number;
        if (typeof quantity === 'function') {
            updatedQuantity = quantity(currentQuantity);
        } else {
            updatedQuantity = quantity;
        }
        if (updatedQuantity === currentQuantity) {
            return;
        }
        if (isQp) {
            dialogData.qp = updatedQuantity;
        } else {
            dialogData.items = {
                ...dialogData.items,
                [itemId]: updatedQuantity
            };
        }
        forceUpdate();
    }, [dialogData, forceUpdate]);

    //#endregion


    //#region Component rendering

    const className = clsx(
        `${StyleClassPrefix}-root`,
        ThemeConstants.ClassScrollbarTrackBorder
    );

    return (
        <DialogContent className={className} sx={StyleProps}>
            <MasterItemList
                itemQuantities={dialogData.items}
                qp={dialogData.qp}
                onChange={handleChange}
            />
        </DialogContent>
    );

    //#endregion

};
