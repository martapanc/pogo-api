import express from "express";
import {checkIfAdmin} from "../middleware/Auth";
import {getAllUsers, getUserById, getUserByUuid, matchUserWithPlayer} from "../services/UserService";
import {User} from "@prisma/client";
import {fetchPlayer} from "../services/PlayerService";

const router = express.Router();

router.get('/users', checkIfAdmin, async (req, res) => {
    const {orderBy} = req.query

    const users: User[] = await getAllUsers(orderBy);

    res.json(users.sort(p => p.id));
});

router.get('/users/:id', checkIfAdmin, async (req, res) => {
    const userId = parseInt(req.params.id);

    if (!isNaN(userId)) {
        const user = await getUserById(userId);
        res.json(user ? user : {error: `User with id ${userId} not found.`});
    } else {
        res.status(400).json({error: `Error parsing id: '${req.params.id}'`});
    }
});

router.get('/users/uuid/:uuid', checkIfAdmin, async (req, res) => {
    const uuid = req.params.uuid;
    const user = await getUserByUuid(uuid);

    res.json(user ? user : {error: `User with uuid ${uuid} not found.`});
});

router.put('/users/:uuid/match/:playerId', checkIfAdmin, async (req, res) => {
    const playerId = parseInt(req.params.playerId);

    if (!isNaN(playerId)) {
        const uuid = req.params.uuid;
        const player = await fetchPlayer(playerId);

        if (player) {
            matchUserWithPlayer(uuid, playerId)
                .then((user) => {
                    res.json({message: `User '${uuid}' matched with playerId ${playerId}`})
                }).catch((err) => {
                res.status(400).json({error: `Couldn't match user '${uuid}' with playerId ${playerId}.`});
            })
        } else {
            res.status(404).json({error: `Player with id ${playerId} not found.`});
        }
    } else {
        res.status(400).json({error: `Error parsing id: '${req.params.id}'`});
    }
})

export default router;
