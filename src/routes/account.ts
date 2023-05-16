import express from "express";
import admin from "../auth/Firebase";
import {User} from "../models/User";
import {checkIfAuthenticated} from "../middleware/Auth";

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

router.post('/auth/token/:uid', async function createToken(req: any, res: any): Promise<void> {
    admin.auth()
        .createCustomToken(req.params.uid)
        .then((token: any) => {
            res.json({
                token
            });
        }).catch((err: any) => {
            res.status(400).json(err);
        });
});

router.get('/protected', checkIfAuthenticated, (req, res) => {
    res.send('This is a protected route');
});

export default router;
