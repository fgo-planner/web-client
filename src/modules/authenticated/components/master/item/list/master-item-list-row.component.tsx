import { fade, StyleRules, TextField, Theme, withStyles } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { ChangeEvent, PureComponent, ReactNode } from 'react';
import NumberFormat from 'react-number-format';
import { GameItem, MasterItem, WithStylesProps } from '../../../../../../types';
import { MasterItemListRowLabel } from './master-item-list-row-label.component';

type ListViewDataItem = { item: GameItem; masterData: MasterItem };

type Props = {
    key: number;
    item: ListViewDataItem;
    editMode: boolean;
} & WithStylesProps;

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

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterItemListRow'
};

export const MasterItemListRow = withStyles(style, styleOptions)(class extends PureComponent<Props> {

    constructor(props: Props) {
        super(props);

        this._handleItemQuantityChange = this._handleItemQuantityChange.bind(this);
    }

    render(): ReactNode {
        const { classes, key, item, editMode } = this.props;
        return (
            <div className={classes.root} key={key}>
                <MasterItemListRowLabel item={item.item} editMode={editMode} />
                <div className="flex-fill" />
                <div>
                    {editMode ? this._renderItemEditMode(item) : this._renderItemViewMode(item)}
                </div>
            </div>
        );
    }

    private _renderItemViewMode(item: ListViewDataItem): ReactNode {
        return (
            <NumberFormat
                value={item.masterData.quantity}
                displayType="text"
                thousandSeparator={true}
            />
        );
    }

    private _renderItemEditMode(item: ListViewDataItem): ReactNode {
        return (
            <TextField
                variant="outlined"
                size="small"
                type="number"
                inputProps={{ step: 1, min: 0 }}
                value={item.masterData.quantity}
                onChange={this._handleItemQuantityChange}
            />
        );
    }

    private _handleItemQuantityChange(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void {
        const value = event.target.value;
        const quantity = Math.max(0, ~~Number(value));

        // TODO Is it bad practice to modify an object in props?
        this.props.item.masterData.quantity = quantity;
        
        this.forceUpdate();
    }

});
