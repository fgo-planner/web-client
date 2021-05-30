import { StyleRules, TextField, Theme, withStyles } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { ChangeEvent, PureComponent, ReactNode } from 'react';
import NumberFormat from 'react-number-format';
import { StaticListRowContainer } from '../../../../../../components/list/static-list-row-container.component';
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
        height: 52,
        padding: theme.spacing(0, 8, 0, 4),
        fontSize: '0.875rem'
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
            <StaticListRowContainer borderTop>
                <div className={classes.root} key={key}>
                    <MasterItemListRowLabel item={item.item} editMode={editMode} />
                    <div className="flex-fill" />
                    <div>
                        {editMode ? this._renderItemEditMode(item) : this._renderItemViewMode(item)}
                    </div>
                </div>
            </StaticListRowContainer>
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
