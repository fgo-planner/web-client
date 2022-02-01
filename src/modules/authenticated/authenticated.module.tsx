import React, { Suspense } from 'react';
import { Navigate, useRoutes } from 'react-router';
import { LazyLoadFallback } from '../../components/route-fallback/lazy-load-fallback.component';
import { MasterAccountHomeRoute } from './routes/master-account-home.route';
import { MasterAccountsRoute } from './routes/master-accounts/master-accounts.route';
import { MasterItemStatsRoute } from './routes/master-item-stats/master-item-stats.route';
import { MasterItemsRoute } from './routes/master-items/master-items.route';
import { MasterServantCostumesRoute } from './routes/master-servant-costumes/master-servant-costumes.route';
import { MasterServantStatsRoute } from './routes/master-servant-stats/master-servant-stats.route';
import { MasterServantsRoute } from './routes/master-servants/master-servants.route';
import { MasterSoundtracksRoute } from './routes/master-soundtracks/master-soundtracks.route';
import { PlanRoute } from './routes/plan/plan.route';
import { PlansRoute } from './routes/plans/plans.route';
import { UserProfileRoute } from './routes/user-profile.route';
import { UserSettingsRoute } from './routes/user-settings.route';
import { UserThemesEditRoute } from './routes/user-themes-edit/user-themes-edit.route';

console.log('AuthenticatedModule loaded');

const MasterServantImportRoute = React.lazy(() => import('./routes/master-servant-import/master-servant-import.route'));

const ModuleRoutes = [
    {
        path: '/',
        element: <Navigate to='./master' />
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
        element: <MasterAccountHomeRoute />
    },
    {
        path: '/master/servants',
        element: <MasterServantsRoute />
    },
    {
        path: '/master/servants/costumes',
        element: <MasterServantCostumesRoute />
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
        path: '/master/soundtracks',
        element: <MasterSoundtracksRoute />
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
        path: '/master/data/import/servants',
        element: (
            <Suspense fallback={<LazyLoadFallback />}>
                <MasterServantImportRoute />
            </Suspense>
        )
    },
];

const AuthenticatedModule = React.memo(() => {
    return useRoutes(ModuleRoutes);
});

export default AuthenticatedModule;
