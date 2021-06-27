import { Checkbox, FormControlLabel, FormGroup } from '@material-ui/core';
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { MasterItemStatsFilterOptions } from './master-item-stats.utils';

type Props = {
    onFilterChange: (filter: MasterItemStatsFilterOptions) => void;
};

export const MasterItemStatsFilter = React.memo(({ onFilterChange }: Props) => {

    const [includeUnownedServants, setIncludeUnownedServants] = useState<boolean>(false);
    const [includeCostumes, setIncludeCostumes] = useState<boolean>(true);
    const [includeSoundtracks, setIncludeSoundtracks] = useState<boolean>(false);

    useEffect(() => {
        onFilterChange({
            includeUnownedServants,
            includeCostumes,
            includeSoundtracks
        });
    }, [includeCostumes, includeSoundtracks, includeUnownedServants, onFilterChange]);

    const handleIncludeUnownedServantsChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setIncludeUnownedServants(event.target.checked);
    }, []);

    const handleIncludeCostumesChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setIncludeCostumes(event.target.checked);
    }, []);

    const handleIncludeSoundtracksChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setIncludeSoundtracks(event.target.checked);
    }, []);

    return (
        <div className="px-4 pt-4">
            <FormGroup row>
                <FormControlLabel
                    control={
                        <Checkbox
                            name="includeUnownedServants"
                            checked={includeUnownedServants}
                            onChange={handleIncludeUnownedServantsChange}
                        />
                    }
                    label="Un-summoned servants"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            name="includeCostumes"
                            checked={includeCostumes}
                            onChange={handleIncludeCostumesChange}
                        />
                    }
                    label="Costumes"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            name="includeSoundtracks"
                            checked={includeSoundtracks}
                            onChange={handleIncludeSoundtracksChange}
                        />
                    }
                    label="Soundtracks"
                />
            </FormGroup>
        </div>
    );
});
