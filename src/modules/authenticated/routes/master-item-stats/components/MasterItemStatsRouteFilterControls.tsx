import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import React, { ChangeEvent, useCallback } from 'react';
import { MasterItemStatsRouteTypes } from '../MasterItemStatsRouteTypes';

type Props = {
    filter: MasterItemStatsRouteTypes.FilterOptions;
    onFilterOptionChange: (property: keyof MasterItemStatsRouteTypes.FilterOptions, value: boolean) => void;
};

const StyleClassPrefix = 'MasterItemStatsRouteFilterControls';

export const MasterItemStatsRouteFilterControls = React.memo((props: Props) => {

    const {
        filter: {
            includeAppendSkills,
            includeCostumes,
            includeLores,
            includeSoundtracks,
            includeUnsummonedServants
        },
        onFilterOptionChange
    } = props;

    const handleFilterOptionChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const { name, checked: value } = event.target;
        const property = name as keyof MasterItemStatsRouteTypes.FilterOptions;
        onFilterOptionChange(property, value);
    }, [onFilterOptionChange]);

    return (
        <div className={`${StyleClassPrefix}-root`}>
            <FormGroup row>
                <FormControlLabel
                    control={
                        <Checkbox
                            name='includeUnsummonedServants'
                            checked={includeUnsummonedServants}
                            onChange={handleFilterOptionChange}
                        />
                    }
                    label='Un-summoned servants'
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            name='includeAppendSkills'
                            checked={includeAppendSkills}
                            onChange={handleFilterOptionChange}
                        />
                    }
                    label='Append skills'
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            name='includeLores'
                            checked={includeLores}
                            onChange={handleFilterOptionChange}
                        />
                    }
                    label='Include lores'
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            name='includeCostumes'
                            checked={includeCostumes}
                            onChange={handleFilterOptionChange}
                        />
                    }
                    label='Costumes'
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            name='includeSoundtracks'
                            checked={includeSoundtracks}
                            onChange={handleFilterOptionChange}
                        />
                    }
                    label='Soundtracks'
                />
            </FormGroup>
        </div>
    );
});
