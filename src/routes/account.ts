import express, {Request, Response} from "express";
import admin from "../auth/Firebase";
import {Login} from "../models/Login";
import {checkIfAdmin} from "../middleware/Auth";
import {UserData} from "../models/UserData";
import {deleteUser, saveUser} from "../services/UserService";

const router = express.Router();

router.post('/auth/signup', async function createAccount(req: any, res: any): Promise<void> {
    const user: Login = req.body;

    admin.auth().createUser({
        email: user.email,
        password: user.password
    }).then(async (userCreatedResp: any) => {
        const userCreated: UserData = userCreatedResp;

        try {
            await saveUser(userCreated);
        } catch (err: any) {
            res.sendStatus(500).send({err});
            return;
        }

        res.send(userCreatedResp);
    }).catch((err: any) => {
        console.error('Error creating user:', err);
        res.status(400).send(err);
    });
});

router.delete('/auth/deleteAccount', async function deleteAccount(req: any, res: any): Promise<void> {
    const userData: UserData = req.body;

    admin.auth().deleteUser(
        userData.uid
    ).then(async (userDeletedResp: any) => {
        try {
            await deleteUser(userData);
        } catch (err: any) {
            console.error('Error deleting user:', err);
            res.sendStatus(500).send({err});
            return;
        }

        res.send(userDeletedResp);
    }).catch((err: any) => {
        res.status(400).send(err);
    });
});

router.post('/auth/make-admin', checkIfAdmin, async function makeUserAdmin(req: Request, res: Response): Promise<void> {
    const {userId} = req.body;

    await admin.auth().setCustomUserClaims(userId, {admin: true});

    res.send({message: 'Success'});
});

export default router;
