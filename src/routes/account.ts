import express, {Request, Response} from "express";
import admin from "../auth/Firebase";
import {User} from "../models/User";
import {checkIfAdmin} from "../middleware/Auth";

const router = express.Router();

router.post('/auth/signup', async function createUser(req: any, res: any): Promise<void> {
    const user: User = req.body;

    admin.auth().createUser({
        email: user.email,
        password: user.password
    }).then((userCreated: any) => {
        res.send(userCreated);
    }).catch((err: any) => {
        res.status(400).send(err);
    });
});

export default router;

router.post('/auth/make-admin', checkIfAdmin, async function makeUserAdmin(req: Request, res: Response): Promise<void> {
    const {userId} = req.body;

    await admin.auth().setCustomUserClaims(userId, {admin: true});

    res.send({message: 'Success'});
});
