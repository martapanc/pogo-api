import {NextFunction, Request, Response} from "express";
import admin from "../auth/Firebase";

declare global {
    namespace Express {
        interface Request {
            authToken?: string;
            authId?: string;
            user?: string;
        }
    }
}

export function getAuthToken(req: Request, res: Response, next: NextFunction) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        req.authToken = req.headers.authorization.split(' ')[1];
    }

    next();
}

export function checkIfAuthenticated(req: Request, res: Response, next: NextFunction) {
    getAuthToken(req, res, async () => {
        try {
            const {authToken} = req;
            const userInfo = await admin
                .auth()
                .verifyIdToken(authToken);
            req.authId = userInfo.uid;
            return next();
        } catch (e) {
            return res
                .status(401)
                .send({error: 'You are not authorized to make this request.'});
        }
    });
}

export function checkIfAdmin(req: Request, res: Response, next: NextFunction) {
    getAuthToken(req, res, async () => {
        try {
            const {authToken} = req;
            const userInfo = await admin.auth().verifyIdToken(authToken);

            if (userInfo.admin === true) {
                req.authId = userInfo.uid;
                return next();
            }

            throw new Error('unauthorized');
        } catch (e) {
            return res.status(401).send({ error: 'You are not authorized to make this request' });
        }
    });
}

export async function makeUserAdmin(req: Request, res: Response) {

}
