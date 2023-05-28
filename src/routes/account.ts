import express, {Request, Response} from "express";
import admin from "../auth/Firebase";
import {Login} from "../models/Login";
import {checkIfAdmin} from "../middleware/Auth";
import {UserData} from "../models/UserData";
import {deleteUser, saveUser} from "../services/UserService";
import {sendActivationEmail, sendPasswordResetEmail} from "../auth/SendGrid";

const router = express.Router();

router.post('/auth/signup', async function createAccount(req: Request, res: Response): Promise<void> {
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

        const emailVerificationLink = await admin.auth().generateEmailVerificationLink(userCreated.email);

        sendActivationEmail(userCreated.email, emailVerificationLink);

        res.send(userCreatedResp);
    }).catch((err: any) => {
        console.error('Error creating user:', err);
        res.status(400).send(err);
    });
});

router.post('/auth/reset-password', async function resetPassword(req: Request, res: Response) {
    const {email} = req.body;

    try {
        const user: UserData | undefined = await admin.auth().getUserByEmail(email);
        if (user) {
            const newPassword = generateNewPassword();

            await admin.auth().updateUser(user.uid, {
                password: newPassword,
            });

            sendPasswordResetEmail(email, newPassword);

            res.status(200).json({message: 'Password reset successfully'});
        } else {
            res.status(404).json({error: `User with email ${email} not found.`})
        }
    } catch (err: any) {
        console.error('Error resetting password:', err);
        res.status(400).json({error: 'Failed to reset password'});
    }
});

router.delete('/auth/delete-account', async function deleteAccount(req: Request, res: Response): Promise<void> {
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

function generateNewPassword() {
    const length = 14;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_.,?@*%$#+=';
    let newPassword = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        newPassword += charset.charAt(randomIndex);
    }
    return newPassword;
}

export default router;
