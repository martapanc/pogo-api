import express from "express";
import {PlayerFetchingError} from "../models/PlayerFetchingError";
import {PlayerFetchResult} from "../models/PlayerFetchResult";
import {
    createNewPlayer,
    getAllPlayers,
    getPlayer,
    getPlayersFromRegion,
    getPlayersFromRegionWithWantedHighPrioRegion,
    getPlayersFromRegionWithWantedLowPrioRegion,
    getPlayersWithWantedHighPrioRegion,
    getPlayersWithWantedLowPrioRegion
} from "../services/PlayerService";
import {getRegionFromName} from "../services/RegionService";
import {checkIfAuthenticated} from "../middleware/Auth";
import {getUserFromPlayer, matchUserWithPlayer} from "../services/UserService";
import {Player} from "@prisma/client";

const router = express.Router();

router.get('/players', checkIfAuthenticated, async (req, res) => {
    const {search, orderBy} = req.query

    const players = await getAllPlayers(search, orderBy);

    res.json(players.sort(p => p.id));
});

router.get('/players/:id', checkIfAuthenticated, async (req, res) => {
    try {
        const playerId = parseInt(req.params.id);

        await getUserFromPlayer(
            playerId
        ).then(async (user) => {
            if (user && user.uuid === req.authId) {
                await getPlayer(playerId).then((player) => {
                    res.json(player);
                });
            } else {
                res.status(401).json({error: "Not authorised to view player info."});
            }
        }).catch((err: any) => {
            res.status(404).json({error: `Error finding player: ${err}`} as PlayerFetchingError);
        });

    } catch (error) {
        res.status(400).json({error: `Error parsing id: '${req.params.id}'`});
    }
});

router.get('/players/from/:regionName', checkIfAuthenticated, async (req, res) => {
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

router.get('/players/looking-for/:regionName', checkIfAuthenticated, async (req, res) => {
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

router.get('/players/from/:fromRegion/looking-for/:wantedRegion', checkIfAuthenticated, async (req, res) => {
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

router.post('/players/create', checkIfAuthenticated, async (req, res) => {
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

export default router;
