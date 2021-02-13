import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import React, { ChangeEvent, PureComponent, ReactNode } from 'react';
import { GameServant, Nullable } from '../../../../../../types';

type Props = {
    selectedServant: GameServant;
    servantList: ReadonlyArray<Readonly<GameServant>>;
    onChange?: (event: ChangeEvent<{}>, value: GameServant) => void;
};

export class MasterServantEditDialogAutocomplete extends PureComponent<Props> {

    constructor(props: Props) {
        super(props);
        this._handleChange = this._handleChange.bind(this);
    }

    render(): ReactNode {
        const { selectedServant, servantList } = this.props;
        return (
            <Autocomplete autoHighlight
                          autoSelect
                          fullWidth
                          options={servantList as Array<Readonly<GameServant>>}
                          noOptionsText="No results"
                          getOptionLabel={this._getOptionLabel}
                          getOptionSelected={this._isOptionSelected}
                          renderOption={this._renderSelectOption}
                          renderInput={this._renderInput}
                          onChange={this._handleChange}
                          value={selectedServant}
            />
        );
    }

    private _getOptionLabel(option: Readonly<GameServant>): string {
        return option.name || option.metadata?.displayName || String(option._id);
    }

    private _isOptionSelected(option: Readonly<GameServant>, value: Readonly<GameServant>): boolean {
        return option._id === value._id;
    }

    private _renderSelectOption(servant: Readonly<GameServant>): ReactNode {
        return (
            <div>
                {servant.name}
            </div>
        );
    }

    private _renderInput(params: any): ReactNode {
        return <TextField {...params} label="Servant" variant="outlined" />;
    }

    private _handleChange(event: ChangeEvent<{}>, servant: Nullable<Readonly<GameServant>>): void {
        if (servant == null) {
            // Is this case possible?
            return;
        }
        const { onChange } = this.props;
        onChange && onChange(event, servant);
    }

}
