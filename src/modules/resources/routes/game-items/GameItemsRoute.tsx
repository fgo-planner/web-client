import React from 'react';
import { DataTableListRow } from '../../../../components/data-table-list/DataTableListRow';
import { ItemThumbnail } from '../../../../components/item/ItemThumbnail';
import { LayoutContentSection } from '../../../../components/layout/LayoutContentSection';
import { AppBarElevateOnScroll } from '../../../../components/navigation/app-bar/AppBarElevateOnScroll';
import { PageTitle } from '../../../../components/text/PageTitle';
import { useGameItemList } from '../../../../hooks/data/useGameItemList';

const StyleClassPrefix = 'GameItemsRoute';

export const GameItemsRoute = React.memo(() => {

    const gameItems = useGameItemList();

    return (
        <AppBarElevateOnScroll className={`${StyleClassPrefix}-root`}>
            <PageTitle>Item List</PageTitle>
            <LayoutContentSection className='m-4'>
                {gameItems?.map((gameItem, index) => (
                    <DataTableListRow key={index} borderTop={!!index}>
                        <div className='flex align-center'>
                            <ItemThumbnail
                                gameItem={gameItem}
                                size={52}
                                showBackground
                                enableLink
                            />
                            <div className='px-4' style={{ fontSize: '0.875rem' }}>
                                {gameItem.name}
                            </div>
                        </div>
                    </DataTableListRow>
                ))}
            </LayoutContentSection>
        </AppBarElevateOnScroll>
    );

});
