import { Inject } from '../../decorators/dependency-injection/Inject.decorator';
import { LockableUIFeature } from '../../types/dto/LockableUIFeature.enum';
import { UserInterfaceService } from '../user-interface/UserInterfaceService';

export abstract class DataService {

    @Inject(UserInterfaceService)
    protected readonly _userInterfaceService!: UserInterfaceService;

    constructor(protected readonly _BaseUrl: string) {
        
    }

    protected async _fetchWithLoadingIndicator<T>(promise: Promise<T>): Promise<T> {
        const lockId = this._userInterfaceService.requestLock(LockableUIFeature.LoadingIndicator);
        try {
            return await promise;
        } finally {
            this._userInterfaceService.releaseLock(LockableUIFeature.LoadingIndicator, lockId);
        }
    }

}
