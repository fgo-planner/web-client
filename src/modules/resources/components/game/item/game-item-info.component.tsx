import { Box, StyleRules, Theme, withStyles } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { Fragment, PureComponent, ReactNode } from 'react';
import { Container as Injectables } from 'typedi';
import { LoadingIndicator } from '../../../../../components/loading-indicator.component';
import { GameItemService } from '../../../../../services/data/game/game-item.service';
import { GameServantService } from '../../../../../services/data/game/game-servant.service';
import { GameItem, GameServant, GameServantEnhancement, Nullable, WithStylesProps } from '../../../../../types';
import { GameItemNotFound } from './game-item-not-found.component';

type TotalUsage = {
    ascensions: number;
    skills: number;
    costumes: number;
};

type ServantUsage = {
    servant: Readonly<GameServant>;
} & TotalUsage;

type GameItemUsage = {
    servants: ServantUsage[];
    total: TotalUsage;
};

type Props = {
    itemId: number;
} & WithStylesProps;

type State = {
    itemLoading: boolean;
    item?: GameItem | null;
    itemUsage?: GameItemUsage | null;
};

const style = (theme: Theme) => ({
    root: {
        // TODO Implement this
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'GameItemInfo'
};

export const GameItemInfo = withStyles(style, styleOptions)(class extends PureComponent<Props, State> {

    private _gameItemService = Injectables.get(GameItemService);

    private _gameServantService = Injectables.get(GameServantService);

    constructor(props: Props) {
        super(props);

        this.state = {
            itemLoading: true
        };

        this._loadItem(props.itemId);
    }

    componentDidUpdate(prevProps: Props) {
        const { itemId } = this.props;
        if (itemId !== prevProps.itemId) {
            this._loadItem(itemId);
        }
    }

    render(): ReactNode {
        const { item, itemLoading } = this.state;
        if (itemLoading) {
            return <LoadingIndicator />;
        }
        if (!item) {
            return <GameItemNotFound itemId={this.props.itemId} />;
        }
        return (
            <Fragment>
                <div>{item._id}</div>
                <div>{item.name}</div>
                {this._renderUsage()}
            </Fragment>
        );
    }

    private _renderUsage(): ReactNode {
        const { itemUsage } = this.state;
        if (!itemUsage) {
            return null;
        }
        const { servants, total } = itemUsage;
        return (
            <Fragment>
                <Box p={2}>
                    <div>Ascensions: {total.ascensions}</div>
                    <div>Per Skill (Total): {total.skills} ({total.skills * 3})</div>
                    <div>Costumes: {total.costumes}</div>
                    <div>Total: {total.ascensions + total.skills * 3 + total.costumes}</div>
                </Box>
                <div>
                    {servants.map((servant, index) => (
                        <Box key={index} display="flex" px={2} py={1}>
                            <div>{servant.servant.name}</div>
                            <Box px={2} />
                            <div>{servant.ascensions}, {servant.skills}({servant.skills * 3}), {servant.costumes}</div>
                        </Box>
                    ))}
                </div>
            </Fragment>
        );
    }

    private _loadItem(itemId: number): void {
        this.setState({ 
            itemLoading: true
        });
        this._gameItemService.getItem(itemId).then(async item => {
            const itemUsage = await this._computeItemUsage(item);
            this.setState({
                itemLoading: false,
                item,
                itemUsage
            });
        });
    }

    private async _computeItemUsage(item: Nullable<GameItem>): Promise<Nullable<GameItemUsage>> {
        if (!item) {
            return null;
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const itemId = item._id!!;
        const servantUsage: ServantUsage[] = [];
        const totalUsage: TotalUsage = {
            ascensions: 0,
            skills: 0,
            costumes: 0
        };
        const servants = await this._gameServantService.getServants();
        for (const servant of servants) {
            const { skillMaterials, ascensionMaterials } = servant;

            const skills = this._computeEnhancementsUsage(skillMaterials, itemId);
            totalUsage.skills += skills;

            const ascensions = this._computeEnhancementsUsage(ascensionMaterials, itemId);
            totalUsage.ascensions += ascensions;

            if (skills || ascensions) {
                servantUsage.push({
                    servant,
                    skills,
                    ascensions,
                    costumes: 0
                });
            }
        }
        return { servants: servantUsage, total: totalUsage };
    }

    private _computeEnhancementsUsage(enhancements: Record<number, GameServantEnhancement> | undefined, itemId: number): number {
        if (!enhancements) {
            return 0;
        }
        let sum = 0;
        for (const level of Object.keys(enhancements)) {
            const enhancement: GameServantEnhancement = (enhancements as any)[level];
            sum += this._computeEnhancementUsage(enhancement, itemId);
        }
        return sum;
    }

    private _computeEnhancementUsage(enhancement: GameServantEnhancement, itemId: number): number {
        let sum = 0;
        for (const material of enhancement.materials) {
            if (material.itemId === itemId) {
                sum += material.quantity;
            }
        }
        return sum;
    }

});
