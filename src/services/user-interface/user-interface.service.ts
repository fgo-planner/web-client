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
     * @returns A unique ID that can be used to release the lock.
     */
    requestLock(feature: LockableFeature): string {
        const lockId = this._generateLockId();
        const lockIdSet = MapUtils.getOrDefault(this._LockIdSets, feature, () => new Set());
        lockIdSet.add(lockId);
        if (!this._LockableFeaturesStates.get(feature)) {
            this._LockableFeaturesStates.set(feature, true);
            const subject = this._getSubjectForLockableFeature(feature);
            this._pushChange(subject, true);
        }
        return lockId;
    }

    /**
     * Defaults to `false`.
     */
    releaseLock(feature: LockableFeature, lockId: string): void {
        const lockIdSet = this._LockIdSets.get(feature);
        lockIdSet?.delete(lockId);
        if (!lockIdSet?.size) {
            this._LockableFeaturesStates.set(feature, false);
            const subject = this._getSubjectForLockableFeature(feature);
            this._pushChange(subject, false);
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

    /**
     * Push a value to a subject asynchronously.
     * 
     * @param subject The subject to push to.
     * @param value The value to push
     */
    private _pushChange(subject: Subject<boolean>, value: boolean): void {
        setTimeout(() => subject.next(value));
    }

    private _generateLockId(): string {
        return String(new Date().getTime());
    }

}
