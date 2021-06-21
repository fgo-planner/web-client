import { useEffect, useState } from 'react';
import { GameSoundtrackList, GameSoundtrackService } from '../../services/data/game/game-soundtrack.service';

export const useGameSoundtrackList = (): GameSoundtrackList | undefined => {

    const [gameSoundtrackList, setGameSoundtrackList] = useState<GameSoundtrackList>();

    useEffect(() => {
        GameSoundtrackService.getSoundtracks().then(setGameSoundtrackList);
    }, []);

    return gameSoundtrackList;

};
