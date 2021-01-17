import { StyleRules, TextField, Theme, withStyles } from '@material-ui/core';
import { GameItemConstants } from 'app-constants';
import { GameItem, UserGameAccountItem } from 'data';
import { WithStylesProps } from 'internal';
import React, { ChangeEvent, PureComponent, ReactNode } from 'react';
import { GameItemService } from 'services';
import { Container as Injectables } from 'typedi';
import { GameAccountItemsListViewRow } from './game-account-items-list-view-row.component';

type ItemCategory = { label: string; itemIds: ReadonlyArray<number> };

type ListViewDataItem = { item: GameItem; userData: UserGameAccountItem };

type ListViewDataCategory = { label: string; items: Array<ListViewDataItem> };

type ListViewData = Array<ListViewDataCategory>;

type Props = {
    editMode: boolean;
    viewLayout?: any; // TODO Make use of this
    userItems: UserGameAccountItem[];
} & WithStylesProps;

type State = {
    listViewData: ListViewData;
};

const style = (theme: Theme) => ({
    root: {
        maxWidth: `${theme.breakpoints.width('md')}px`,
        padding: theme.spacing(0, 4),
        margin: 'auto'
    },
    itemCategory: {
        paddingBottom: theme.spacing(2),
        '& .section-subheader': {
            paddingTop: theme.spacing(2)
        }
    }
} as StyleRules);

export const GameAccountItemsListView = withStyles(style)(class extends PureComponent<Props, State> {

    private readonly ItemCategories: ReadonlyArray<ItemCategory> = [
        {
            label: 'Skill Gems',
            itemIds: GameItemConstants.SkillGems
        },
        {
            label: 'Ascension Statues',
            itemIds: GameItemConstants.AscensionStatues
        },
        {
            label: 'Bronze Materials',
            itemIds: GameItemConstants.BronzeEnhancementMaterials
        },
        {
            label: 'Silver Materials',
            itemIds: GameItemConstants.SilverEnhancementMaterials
        },
        {
            label: 'Gold Materials',
            itemIds: GameItemConstants.GoldEnhancementMaterials
        },
        {
            label: 'Other Materials',
            itemIds: GameItemConstants.OtherEnhancementMaterials
        },
    ];

    private _gameItemService = Injectables.get(GameItemService);

    constructor(props: Props) {
        super(props);
        this.state = {
            listViewData: []
        };

        this._renderItemCategory = this._renderItemCategory.bind(this);
        this._renderItemRow = this._renderItemRow.bind(this);
    }

    componentDidMount() {
        this._generateListViewData();
    }
    
    componentDidUpdate(prevProps: Props) {
        if (this.props.userItems !== prevProps.userItems) {
            this._generateListViewData();
        }
    }

    render(): ReactNode {
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                {this.state.listViewData.map(this._renderItemCategory)}
            </div>
        );
    }

    private _renderItemCategory(category: ListViewDataCategory, key: number): ReactNode {
        const { classes } = this.props;
        return (
            <div className={classes.itemCategory} key={key}>
                <div className="section-subheader">
                    {category.label}
                </div>
                {category.items.map(this._renderItemRow)}
            </div>
        );
    }

    private _renderItemRow(item: ListViewDataItem, key: number): ReactNode {
        const { editMode } = this.props;
        return (
            <GameAccountItemsListViewRow key={key} item={item} editMode={editMode} />
        );
    }

    private async _generateListViewData(): Promise<void> {

        try {
            const itemsMap = await this._gameItemService.getItemsMap();

            /*
             * Convert the user account items into a map for faster lookup.
             */
            const userItemsMap: { [key: number]: UserGameAccountItem } = {};
            for (const userItem of this.props.userItems) {
                userItemsMap[userItem.itemId] = userItem;
            }

            /*
             * Generate the view data array.
             */
            const listViewData: ListViewData = [];
            for (const itemCategory of this.ItemCategories) {

                const items: ListViewDataItem[] = [];
                for (const itemId of itemCategory.itemIds) {

                    /*
                     * Retrieve item data from items map.
                     */
                    const item = itemsMap[itemId];
                    if (!item) {
                        console.warn(`Item ID ${itemId} could not be retrieved from the map.`);
                    }

                    /*
                     * Retrieve user data for the item from the user items map. If the item is not
                     * present in the user data, then backfill it.
                     */
                    let userItem = userItemsMap[itemId];
                    if (!userItem) {
                        userItem = { itemId, quantity: 0 };
                        // TODO Is it bad practice to modify an object in props?
                        this.props.userItems.push(userItem);
                    }
                    
                    items.push({ item, userData: userItem });
                }
                listViewData.push({ label: itemCategory.label, items });
            }

            this.setState({ listViewData });
            
        } catch (e) {
            console.error(e);
            // TODO Display error message.
        }
    }

});
