import { Box, fade, StyleRules, TextField, Theme, withStyles } from '@material-ui/core';
import { GameItem, MasterItem } from 'data';
import { WithStylesProps } from 'internal';
import React, { ChangeEvent, PureComponent, ReactNode } from 'react';
import { MasterItemsListViewRowLabel } from './master-items-list-view-row-label.component';

type ListViewDataItem = { item: GameItem; masterData: MasterItem };

type Props = {
    key: number;
    item: ListViewDataItem;
    editMode: boolean;
} & WithStylesProps;

type State = {

};

const style = (theme: Theme) => ({
    root: {
        display: 'flex',
        alignContent: 'center',
        alignItems: 'center',
        height: '64px',
        padding: theme.spacing(0, 4),
        '&:not(:last-child)': {
            borderBottom: `1px solid ${theme.palette.divider}`
        },
        '&:hover': {
            background: fade(theme.palette.text.primary, 0.07)
        }
    }
} as StyleRules);

export const MasterItemsListViewRow = withStyles(style)(class extends PureComponent<Props, State> {

    constructor(props: Props) {
        super(props);

        this._handleItemQuantityChange = this._handleItemQuantityChange.bind(this);
    }

    render(): ReactNode {
        const { classes, key, item, editMode } = this.props;
        return (
            <div className={classes.root} key={key}>
                <MasterItemsListViewRowLabel item={item.item} />
                <Box flex={1} />
                <div>
                    {editMode ? this._renderItemEditMode(item) : this._renderItemViewMode(item)}
                </div>
            </div>
        );
    }

    private _renderItemViewMode(item: ListViewDataItem): ReactNode {
        return item.masterData.quantity;
    }

    private _renderItemEditMode(item: ListViewDataItem): ReactNode {
        return (
            <TextField variant="outlined"
                       size="small"
                       type="number"
                       inputProps={{step: 1, min: 0}}
                       value={item.masterData.quantity}
                       onChange={event => this._handleItemQuantityChange(event, item)}
            />
        );
    }

    private _handleItemQuantityChange(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, item: ListViewDataItem): void {
        const value = event.target.value;
        const quantity = Math.max(0, ~~Number(value));

        // TODO Is it bad practice to modify an object in props?
        this.props.item.masterData.quantity = quantity;
        
        this.forceUpdate();
    }

});