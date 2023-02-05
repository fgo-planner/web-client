import React, { Suspense } from 'react';
import { Navigate, useRoutes } from 'react-router';
import { LazyLoadFallback } from '../../components/route-fallback/LazyLoadFallback';
import { MasterAccountHomeRoute } from './routes/master-account-home/MasterAccountHomeRoute';
import { MasterAccountsRoute } from './routes/master-accounts/MasterAccountsRoute';
import { MasterItemStatsRoute } from './routes/master-item-stats/MasterItemStatsRoute';
import { MasterItemsRoute } from './routes/master-items/MasterItemsRoute';
import { MasterServantCostumesRoute } from './routes/master-servant-costumes/MasterServantCostumesRoute';
import { MasterServantStatsRoute } from './routes/master-servant-stats/MasterServantStatsRoute';
import { MasterServantsRoute } from './routes/master-servants/MasterServantsRoute';
import { MasterSettingsRoute } from './routes/master-settings/MasterSettingsRoute';
import { MasterSoundtracksRoute } from './routes/master-soundtracks/MasterSoundtracksRoute';
import { PlanRoute } from './routes/plan/PlanRoute';
import { PlansRoute } from './routes/plans/PlansRoute';
import { UserProfileRoute } from './routes/user-profile/UserProfileRoute';
import { UserSettingsRoute } from './routes/user-settings/UserSettingsRoute';
import { UserThemesEditRoute } from './routes/user-themes-edit/UserThemesEditRoute';

console.log('AuthenticatedModule loaded');

const MasterServantImportRoute = React.lazy(() => import('./routes/master-servant-import/MasterServantImportRoute'));

const ModuleRoutes = [
    {
        path: '/',
        element: <Navigate to='./master/dashboard' />
    },
    {
        path: '/profile',
        element: <UserProfileRoute />
    },
    {
        path: '/settings',
        element: <UserSettingsRoute />
    },
    {
        path: '/settings/theme',
        element: <UserThemesEditRoute />
    },
    {
        path: '/master-accounts',
        element: <MasterAccountsRoute />
    },
    {
        path: '/master',
        element: <Navigate to='./dashboard' />
    },
    {
        path: '/master/settings',
        element: <MasterSettingsRoute />
    },
    {
        path: '/master/dashboard',
        element: <MasterAccountHomeRoute />
    },
    {
        path: '/master/planner',
        element: <PlansRoute />
    },
    {
        path: '/master/planner/:id',
        element: <PlanRoute />
    },
    {
        path: '/master/servants',
        element: <MasterServantsRoute />
    },
    {
        path: '/master/servants/stats',
        element: <MasterServantStatsRoute />
    },
    {
        path: '/master/items',
        element: <MasterItemsRoute />
    },
    {
        path: '/master/items/stats',
        element: <MasterItemStatsRoute />
    },
    {
        path: '/master/costumes',
        element: <MasterServantCostumesRoute />
    },
    {
        path: '/master/soundtracks',
        element: <MasterSoundtracksRoute />
    },
    {
        path: '/master/data/import/servants',
        element: (
            <Suspense fallback={<LazyLoadFallback />}>
                <MasterServantImportRoute />
            </Suspense>
        )
    },
];

const AuthenticatedModule = React.memo(() => {

    const moduleRoutes = useRoutes(ModuleRoutes);

    return <>{moduleRoutes}</>;

});

export default AuthenticatedModule;
