import React from 'react';
import { DataTableListStaticRow } from '../../../../components/data-table-list/DataTableListStaticRow';
import { ServantThumbnail } from '../../../../components/servant/ServantThumbnail';
import { LayoutContentSection } from '../../../../components/layout/LayoutContentSection';
import { AppBarElevateOnScroll } from '../../../../components/navigation/app-bar/AppBarElevateOnScroll';
import { PageTitle } from '../../../../components/text/PageTitle';
import { useGameServantList } from '../../../../hooks/data/useGameServantList';

const StyleClassPrefix = 'GameServantsRoute';

export const GameServantsRoute = React.memo(() => {

    const gameServants = useGameServantList();

    return (
        <AppBarElevateOnScroll className={`${StyleClassPrefix}-root`}>
            <PageTitle>Servant List</PageTitle>
            <LayoutContentSection className='m-4'>
                {gameServants?.map((servant, index) => (
                    <DataTableListStaticRow key={index} borderTop={!!index}>
                        <div className='flex align-center'>
                            <ServantThumbnail
                                gameServant={servant}
                                size={52}
                                enableLink
                            />
                            <div className='px-4' style={{ fontSize: '0.875rem' }}>
                                {servant.name}
                            </div>
                        </div>
                    </DataTableListStaticRow>
                ))}
            </LayoutContentSection>
        </AppBarElevateOnScroll>
    );

});
