import express, {Request, Response} from "express";
import {PlayerFetchingError} from "../models/PlayerFetchingError";
import {PlayerFetchResult} from "../models/PlayerFetchResult";
import {
    createNewPlayer,
    fetchAllPlayers,
    fetchPlayer,
    fetchPlayersFromRegion,
    fetchPlayersFromRegionWithWantedHighPrioRegion,
    fetchPlayersFromRegionWithWantedLowPrioRegion,
    fetchPlayersWithWantedHighPrioRegion,
    fetchPlayersWithWantedLowPrioRegion,
    setPlayerWantedRegions
} from "../services/PlayerService";
import {getRegionFromName} from "../services/RegionService";
import {checkIfAuthenticated, checkIfPlayer} from "../middleware/Auth";
import {matchUserWithPlayer} from "../services/UserService";
import {Player} from "@prisma/client";

const router = express.Router();

router.get('/players', checkIfAuthenticated, async function getPlayers(req, res) {
    const {search, orderBy} = req.query;

    const players = await fetchAllPlayers(search, orderBy);

    res.json(players.sort((p) => p.id));
});

router.get('/players/:id', checkIfAuthenticated, checkIfPlayer, async function getPlayer(req, res) {
    const playerId = parseInt(req.params.id);

    if (!isNaN(playerId)) {
        await fetchPlayer(
            playerId
        ).then((player) => {
            if (player) {
                res.json(player);
            } else {
                res.status(404).json({error: `Player with id ${playerId} not found.`})
            }
        }).catch((err: any) => {
            res.status(400).json({error: `Error fetching Player info: ${err}`})
        });
    } else {
        res.status(400).json({error: `Error parsing id: '${req.params.id}'`});
    }
});

router.get('/players/from/:regionName', checkIfAuthenticated, async function getPlayersFromRegion(req, res) {
    const regionName = req.params.regionName.toLowerCase();

    const region = await getRegionFromName(regionName)

    if (!region) {
        res.status(400).json({error: `Region '${regionName}' could not be found.`})
    } else {
        fetchPlayersFromRegion(region)
            .then((players) => {
                res.json(players);
            })
            .catch((err) => {
                res.status(404).json({error: `Error finding matching players: ${err}`} as PlayerFetchingError);
            });
    }
});

router.get('/players/looking-for/:regionName', checkIfAuthenticated, async function getPlayersLookingForRegion(req, res) {
    const regionName = req.params.regionName.toLowerCase();

    const region = await getRegionFromName(regionName);

    if (!region) {
        res.status(400).json({error: `Region '${regionName}' could not be found.`})
    } else {
        const highPrioPlayers = fetchPlayersWithWantedHighPrioRegion(region);
        const lowPrioPlayers = fetchPlayersWithWantedLowPrioRegion(region);

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

router.get('/players/from/:fromRegion/looking-for/:wantedRegion', checkIfAuthenticated,
    async function getPlayersFromRegionLookingForRegion(req, res) {
        const fromRegionName = req.params.fromRegion.toLowerCase();
        const wantedRegionName = req.params.wantedRegion.toLowerCase();

        const fromRegion = await getRegionFromName(fromRegionName);
        const wantedRegion = await getRegionFromName(wantedRegionName);

        if (!fromRegion || !wantedRegion) {
            const regionNotFound = !fromRegion ? fromRegion : wantedRegion;

            res.status(400).json({error: `Region '${regionNotFound}' could not be found.`})
        } else {
            const highPrioPlayersFromRegion = fetchPlayersFromRegionWithWantedHighPrioRegion(fromRegion, wantedRegion);
            const lowPrioPlayersFromRegion = fetchPlayersFromRegionWithWantedLowPrioRegion(fromRegion, wantedRegion);

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

router.post('/players/create', checkIfAuthenticated, async function newPlayer(req, res) {
    const newPlayer: Player = req.body;

    await createNewPlayer(
        newPlayer
    ).then(async (playerCreated) => {
        const currentUid = req.authId;
        if (currentUid) {
            await matchUserWithPlayer(
                currentUid,
                playerCreated.id
            ).then((resp: any) => {
                res.send({
                    userId: resp.id,
                    player: playerCreated
                });
            }).catch((err: any) => {
                console.error(err);
                res.status(400).json({error: `Couldn't match user with playerId: ${err}`});
            });

        } else {
            const error = "Problem authenticating the user while creating Player data";
            console.error(error)
            res.send(500).send(error);
        }
    }).catch((err: any) => {
        console.error("Error creating new Player: ", err);
        res.sendStatus(400).send(err);
    });
});

router.post('/players/:id/set-regions', checkIfAuthenticated, checkIfPlayer,
    async function setPlayerRegions(req: Request, res: Response) {
        const playerId = parseInt(req.params.id);
        const allHighPrioAreNumbers = areValidNumbers(req.body.highPrioRegions);
        const allLowPrioAreNumbers = areValidNumbers(req.body.lowPrioRegions);

        if (isNaN(playerId)) {
            res.status(400).json({error: `Error parsing id: '${req.params.id}'`});
        } else if (!(allHighPrioAreNumbers && allLowPrioAreNumbers)) {
            res.status(400).json({error: 'Invalid region values. Valid numbers (0, 18] expected.'});
        } else {
            const highPrioRegions: number[] = req.body.highPrioRegions;
            const lowPrioRegions: number[] = req.body.lowPrioRegions;

            await setPlayerWantedRegions(
                playerId,
                highPrioRegions,
                lowPrioRegions
            ).then(() => {
                res.json({ playerId, highPrioRegions, lowPrioRegions });
            }).catch((err: any) => {
                res.status(500).json({error: `Error setting up Player's wanted regions: ${err}`})
            })
        }
    });

function areValidNumbers(regions: any[]) {
    return regions.every((value: any) => typeof value === 'number' && value > 0 && value <= 18);
}

export default router;
