import { fade, StyleRules, TextField, Theme, withStyles } from '@material-ui/core';
import { GameItemConstants } from 'app-constants';
import { GameItem, UserGameAccountItem } from 'data';
import { WithStylesProps } from 'internal';
import React, { ChangeEvent, PureComponent, ReactNode } from 'react';
import { ThemeConstants } from 'styles';

type ListViewDataItem = { item: GameItem; userData: UserGameAccountItem };

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
    },
    itemIcon: {
        width: '48px',
        height: '48px'
    },
    itemName: {
        flex: 1,
        padding: theme.spacing(0, 4),
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontSize: '14px',
        fontWeight: 500
    }
} as StyleRules);

export const GameAccountItemsListViewRow = withStyles(style)(class extends PureComponent<Props, State> {

    constructor(props: Props) {
        super(props);

        this._handleItemQuantityChange = this._handleItemQuantityChange.bind(this);
    }

    render(): ReactNode {
        const { classes, key, item, editMode } = this.props;
        return (
            <div className={classes.root} key={key}>
                <img className={classes.itemIcon}
                     src={`${GameItemConstants.ImageBaseUrl}${item.item._id}${GameItemConstants.ImageExtension}`}
                     alt={item.item.name}
                />
                <div className={classes.itemName}>
                    {item.item.name}
                </div>
                <div>
                    {editMode ? this._renderItemEditMode(item) : this._renderItemViewMode(item)}
                </div>
            </div>
        );
    }

    private _renderItemViewMode(item: ListViewDataItem): ReactNode {
        return this.props.item.userData.quantity;
    }

    private _renderItemEditMode(item: ListViewDataItem): ReactNode {
        return (
            <TextField variant="outlined"
                       size="small"
                       type="number"
                       inputProps={{step: 1, min: 0}}
                       value={this.props.item.userData.quantity}
                       onChange={event => this._handleItemQuantityChange(event, item)}
            />
        );
    }

    private _handleItemQuantityChange(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, item: ListViewDataItem): void {
        const value = event.target.value;
        const quantity = Math.max(0, ~~Number(value));
        this.props.item.userData.quantity = quantity;
        // TODO Is it bad practice to modify an object in props?
        this.forceUpdate();
    }

});