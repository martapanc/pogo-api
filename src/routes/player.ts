import express from "express";
import {PlayerFetchingError} from "../models/PlayerFetchingError";
import {PlayerFetchResult} from "../models/PlayerFetchResult";
import {
    getAllPlayers,
    getPlayer,
    getPlayersFromRegion, getPlayersFromRegionWithWantedHighPrioRegion, getPlayersFromRegionWithWantedLowPrioRegion,
    getPlayersWithWantedHighPrioRegion,
    getPlayersWithWantedLowPrioRegion,
    getRegionFromName
} from "../service/matchingService";
import {fr} from "@faker-js/faker";
import region from "./region";

const router = express.Router();

router.get('/players', async (req, res) => {
    const {search, orderBy} = req.query

    const players = await getAllPlayers(search, orderBy);

    res.json(players.sort(p => p.id));
});

router.get('/players/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const player = await getPlayer(id);

        res.status(404).json(player ? player : {error: `Player with id ${id} not found.`});

    } catch (error) {
        res.status(400).json({error: `Error parsing id: '${req.params.id}'`});
    }
});

router.get('/players/from/:regionName', async (req, res) => {
    const regionName = req.params.regionName.toLowerCase();

    const region = await getRegionFromName(regionName)

    if (!region) {
        res.status(400).json({error: `Region '${regionName}' could not be found.`})
    } else {
        getPlayersFromRegion(region)
            .then((players) => {
                res.json(players);
            })
            .catch((err) => {
                res.status(404).json({error: `Error finding matching players: ${err}`} as PlayerFetchingError);
            });
    }
});

router.get('/players/looking-for/:regionName', async (req, res) => {
    const regionName = req.params.regionName.toLowerCase();

    const region = await getRegionFromName(regionName);

    if (!region) {
        res.status(400).json({error: `Region '${regionName}' could not be found.`})
    } else {
        const highPrioPlayers = getPlayersWithWantedHighPrioRegion(region);
        const lowPrioPlayers = getPlayersWithWantedLowPrioRegion(region);

        Promise.all([highPrioPlayers, lowPrioPlayers]).then(([highPrioPlayers, lowPrioPlayers]) => {
            res.json(
                {
                    highPrioPlayers,
                    lowPrioPlayers
                } as PlayerFetchResult
            );
        }).catch((err) => {
            res.status(404).json({error: `Error finding matching players: ${err}`} as PlayerFetchingError);
        })
    }
});

router.get('/players/from/:fromRegion/looking-for/:wantedRegion', async (req, res) => {
    const fromRegionName = req.params.fromRegion.toLowerCase();
    const wantedRegionName = req.params.wantedRegion.toLowerCase();

    const fromRegion = await getRegionFromName(fromRegionName);
    const wantedRegion = await getRegionFromName(wantedRegionName);

    if (!fromRegion || !wantedRegion) {
        const regionNotFound = !fromRegion ? fromRegion : wantedRegion;

        res.status(400).json({error: `Region '${regionNotFound}' could not be found.`})
    } else {
        const highPrioPlayersFromRegion = getPlayersFromRegionWithWantedHighPrioRegion(fromRegion, wantedRegion);
        const lowPrioPlayersFromRegion = getPlayersFromRegionWithWantedLowPrioRegion(fromRegion, wantedRegion);

        Promise.all([highPrioPlayersFromRegion, lowPrioPlayersFromRegion]).then(([highPrioPlayers, lowPrioPlayers]) => {
            res.json(
                {
                    highPrioPlayers,
                    lowPrioPlayers
                } as PlayerFetchResult
            );
        }).catch((err) => {
            res.status(404).json({error: `Error finding matching players: ${err}`} as PlayerFetchingError);
        })
    }
});

export default router;
