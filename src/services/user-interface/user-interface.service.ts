import { MapUtils } from '@fgo-planner/common-core';
import { Subject } from 'rxjs';
import { Injectable } from '../../decorators/dependency-injection/injectable.decorator';
import { SubscribablesContainer } from '../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../utils/subscription/subscription-topics';

export enum LockableFeature {
    AppBarElevate,
    LoadingIndicator,
    NavigationDrawerNoAnimations
}

/**
 * Central hub for reading and writing the states of 'global' UI components,
 * such as loading indicator, navigation elements, and various dialog boxes.
 */
@Injectable
export class UserInterfaceService {

    private readonly _LockIdSets = new Map<LockableFeature, Set<string>>();

    private readonly _LockableFeaturesStates = new Map<LockableFeature, boolean>();

    private _navigationDrawerOpen = false;

    private _loginDialogOpen = false;

    private get _onLoadingIndicatorActiveChange() {
        return SubscribablesContainer.get(SubscriptionTopics.UserInterface.LoadingIndicatorActiveChange);
    }

    private get _onAppBarElevatedChange() {
        return SubscribablesContainer.get(SubscriptionTopics.UserInterface.AppBarElevatedChange);
    }

    private get _onNavigationDrawerOpenChange() {
        return SubscribablesContainer.get(SubscriptionTopics.UserInterface.NavigationDrawerOpenChange);
    }

    private get _onNavigationDrawerNoAnimationsChange() {
        return SubscribablesContainer.get(SubscriptionTopics.UserInterface.NavigationDrawerNoAnimationsChange);
    }

    private get _onLoginDialogOpenChange() {
        return SubscribablesContainer.get(SubscriptionTopics.UserInterface.LoginDialogOpenChange);
    }

    /**
     * @param async (optional) Whether to push the update to the subject
     * asynchronously. Set to true if encountering the following error:
     *
     * Cannot update a component while rendering a different component...
     *
     * Defaults to `false`.
     *
     * @returns A unique ID that can be used to release the lock.
     */
    requestLock(feature: LockableFeature, async = false): string {
        const lockId = this._generateLockId();
        const lockIdSet = MapUtils.getOrDefault(this._LockIdSets, feature, () => new Set());
        lockIdSet.add(lockId);
        if (!this._LockableFeaturesStates.get(feature)) {
            this._LockableFeaturesStates.set(feature, true);
            const subject = this._getSubjectForLockableFeature(feature);
            this._publishChange(subject, true, async);
        }
        return lockId;
    }

    /**
     * @param async (optional) Whether to push the update to the subject
     * asynchronously. Set to true if encountering the following error:
     *
     * Cannot update a component while rendering a different component...
     *
     * Defaults to `false`.
     */
    releaseLock(feature: LockableFeature, lockId: string, async = false): void {
        const lockIdSet = this._LockIdSets.get(feature);
        lockIdSet?.delete(lockId);
        if (!lockIdSet?.size) {
            this._LockableFeaturesStates.set(feature, false);
            const subject = this._getSubjectForLockableFeature(feature);
            this._publishChange(subject, false, async);
        }
    }

    setNavigationDrawerOpen(open: boolean): void {
        if (this._navigationDrawerOpen === open) {
            return;
        }
        this._navigationDrawerOpen = open;
        this._onNavigationDrawerOpenChange.next(open);
    }

    toggleNavigationDrawerOpen(): void {
        this._navigationDrawerOpen = !this._navigationDrawerOpen;
        this._onNavigationDrawerOpenChange.next(this._navigationDrawerOpen);
    }

    setLoginDialogOpen(open: boolean): void {
        if (this._loginDialogOpen === open) {
            return;
        }
        this._loginDialogOpen = open;
        this._onLoginDialogOpenChange.next(open);
    }

    private _getSubjectForLockableFeature(feature: LockableFeature): Subject<boolean> {
        switch(feature) {
            case LockableFeature.AppBarElevate:
                return this._onAppBarElevatedChange;
            case LockableFeature.LoadingIndicator:
                return this._onLoadingIndicatorActiveChange;
            case LockableFeature.NavigationDrawerNoAnimations:
                return this._onNavigationDrawerNoAnimationsChange;
        }
    }

    private _publishChange(subject: Subject<boolean>, value: boolean, async: boolean): void {
        if (async) {
            setTimeout(() => subject.next(value));
        } else {
            subject.next(value);
        }
    }

    private _generateLockId(): string {
        return String(new Date().getTime());
    }

}
