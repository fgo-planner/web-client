import { useEffect, useState } from 'react';
import { GameSoundtrackList, GameSoundtrackService } from '../../services/data/game/game-soundtrack.service';
import { useInjectable } from '../dependency-injection/use-injectable.hook';

export const useGameSoundtrackList = (): GameSoundtrackList | undefined => {

    const gameSoundtrackService = useInjectable(GameSoundtrackService);
    
    const [gameSoundtrackList, setGameSoundtrackList] = useState<GameSoundtrackList>();

    useEffect(() => {
        gameSoundtrackService.getSoundtracks().then(setGameSoundtrackList);
    }, [gameSoundtrackService]);

    return gameSoundtrackList;

};
