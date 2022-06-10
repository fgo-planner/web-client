import { MasterAccount, MasterServant, MasterServantBondLevel } from '@fgo-planner/types';
import React, { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { GameItemConstants } from '../../../../constants';
import { useInjectable } from '../../../../hooks/dependency-injection/use-injectable.hook';
import { useLoadingIndicator } from '../../../../hooks/user-interface/use-loading-indicator.hook';
import { useForceUpdate } from '../../../../hooks/utils/use-force-update.hook';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { Immutable, MasterServantUpdate, Nullable, ReadonlyRecord } from '../../../../types/internal';
import { ArrayUtils } from '../../../../utils/array.utils';
import { MasterServantUpdateUtils } from '../../../../utils/master/master-servant-update.utils';
import { MasterServantUtils } from '../../../../utils/master/master-servant.utils';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';
import { getDefaultMasterAccountEditData, MasterAccountDataContext, MasterAccountDataContextProps } from '../../contexts/master-account-data.context';

type Props = PropsWithChildren<{}>;

type MasterAccountEditDataInternal = {
    bondLevels: Record<number, MasterServantBondLevel>;
    costumes: Set<number>;
    items: ReadonlyRecord<number, number>;
    qp: number;
    /**
     * Any edits to a servant (including bond levels and unlocked costumes) will
     * result in a new array to be instantiated for this field. In addition, the
     * servants that were edited (tracked by `instanceId`) will also be
     * reconstructed.
     */
    servants: ReadonlyArray<MasterServant>;
    soundtracks: Set<number>;
};

const cloneMasterAccountDataForEdit = (masterAccount: Nullable<Immutable<MasterAccount>>): MasterAccountEditDataInternal => {
    if (!masterAccount) {
        return getDefaultMasterAccountEditData();
    }

    const {
        bondLevels,
        costumes,
        resources: {
            items,
            qp
        },
        servants,
        soundtracks
    } = masterAccount;

    return {
        bondLevels: { ...bondLevels },
        costumes: new Set(costumes),
        items: ArrayUtils.mapArrayToObject(items, item => item.itemId, item => item.quantity),
        qp,
        servants: servants.map(MasterServantUtils.clone),
        soundtracks: new Set(soundtracks)
    };
};

export const MasterAccountDataProviderWrapper = React.memo(({ children }: Props) => {

    const forceUpdate = useForceUpdate();

    const { invokeLoadingIndicator, resetLoadingIndicator } = useLoadingIndicator();

    const masterAccountService = useInjectable(MasterAccountService);

    const [masterAccount, setMasterAccount] = useState<Nullable<Immutable<MasterAccount>>>();
    const [editData, setEditData] = useState<MasterAccountEditDataInternal>(getDefaultMasterAccountEditData);

    /*
     * Master account change subscription.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentMasterAccountChange)
            .subscribe(masterAccount => {
                const editData = cloneMasterAccountDataForEdit(masterAccount);
                setEditData(editData);
                setMasterAccount(masterAccount);
                // setIsMasterAccountDirty(false);
            });

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, []);


    //#region Local create, update, delete functions

    const updateQp = useCallback((amount: number): void => {
        editData.qp = amount;
        forceUpdate();
    }, [editData, forceUpdate]);

    const updateItem = useCallback((itemId: number, quantity: number): void => {
        if (itemId === GameItemConstants.QpItemId) {
            updateQp(quantity);
        } else {
            editData.items = {
                ...editData.items,
                [itemId]: quantity
            };
            forceUpdate();
        }
    }, [editData, forceUpdate, updateQp]);

    const addServant = useCallback((update: MasterServantUpdate): void => {

        const {
            servants,
            bondLevels,
            // unlockedCostumes
        } = editData;

        /**
         * Computed instance ID for the new servant.
         */
        const instanceId = MasterServantUtils.getLastInstanceId(servants) + 1;
        /**
         * New instance of a `MasterServant` object. This will be populated with the
         * data returned by the dialog.
         */
        const newServant = MasterServantUtils.instantiate(instanceId);
        MasterServantUpdateUtils.applyFromUpdatePayload(newServant, update, bondLevels);
        /*
         * Rebuild the array with the new servant included to conform with the context
         * specifications.
         */
        editData.servants = [...servants, newServant];
        // TODO Also update the unlocked costumes.
        forceUpdate();
    }, [editData, forceUpdate]);

    const updateServants = useCallback((instanceIds: Set<number>, update: MasterServantUpdate): void => {

        const {
            servants,
            bondLevels,
            // unlockedCostumes
        } = editData;

        /**
         * Updated servants array. A new array is constructed for this to conform with
         * the context specifications.
         */
        const updatedServants = [];

        for (const servant of servants) {
            /*
             * If the servant is not an update target, then just add it to the new array and
             * continue.
             */
            if (!instanceIds.has(servant.instanceId)) {
                updatedServants.push(servant);
                continue;
            }
            /*
             * Apply the edit to the target servant. The target servant object is
             * re-constructed to conform with the context specifications.
             */
            const targetServant = { ...servant };
            MasterServantUpdateUtils.applyFromUpdatePayload(targetServant, update, bondLevels);
            // TODO Set dirty...
            updatedServants.push(targetServant);
        }
        // TODO Set dirty...
        editData.servants = updatedServants;
        // TODO Also update the unlocked costumes.
        forceUpdate();
    }, [editData, forceUpdate]);

    const deleteServants = useCallback((instanceIds: Set<number>): void => {

        const { servants } = editData;

        /**
         * Updated servants array. A new array is constructed for this to conform with
         * the context specifications.
         */
        const updatedServants = servants.filter(({ instanceId }) => !instanceIds.has(instanceId));
        // TODO Set dirty...
        editData.servants = updatedServants;
        // TODO Also remove bond/costume data if the last instance of the servant is removed.
        forceUpdate();
    }, [editData, forceUpdate]);

    const revertChanges = useCallback((): void => {
        const editData = cloneMasterAccountDataForEdit(masterAccount);
        setEditData(editData);
    }, [masterAccount]);

    //#endregion


    //#region Back-end API functions

    const persistChanges = useCallback(async (): Promise<void> => {
        if (!masterAccount) {
            return;
        }
        invokeLoadingIndicator();
        // TODO Only update dirty data types
        const update: Partial<MasterAccount> = {
            _id: masterAccount._id,
            resources: {
                ...masterAccount.resources,
                items: Object.entries(editData.items).map(([itemId, quantity]) => ({ itemId: Number(itemId), quantity })),
                qp: editData.qp
            },
            servants: [...editData.servants],
            costumes: [...editData.costumes],
            bondLevels: {...editData.bondLevels},
            soundtracks: [...editData.soundtracks]
        };
        try {
            await masterAccountService.updateAccount(update);
            resetLoadingIndicator();
        } catch (error: any) {
            resetLoadingIndicator();
            /*
             * Re-throw the error here. It is up to the component that calls the function to
             * determine how to handle the error.
             */
            throw error;
        }
    }, [editData, invokeLoadingIndicator, masterAccount, masterAccountService, resetLoadingIndicator]);

    //#endregion


    const contextValue: MasterAccountDataContextProps = {
        masterAccountOriginalData: masterAccount,
        masterAccountEditData: editData,
        updateItem,
        addServant,
        updateServants,
        deleteServants,
        revertChanges,
        persistChanges
    };

    console.log('MasterAccountDataContext VALUE UPDATED');

    return (
        <MasterAccountDataContext.Provider value={contextValue}>
            {children}
        </MasterAccountDataContext.Provider>
    );

});
