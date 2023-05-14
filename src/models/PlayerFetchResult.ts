import {Player} from "@prisma/client";

export interface PlayerFetchResult {
    highPrioPlayers: Player[]
    lowPrioPlayers: Player[]
}
