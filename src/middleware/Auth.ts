import {NextFunction, Request, Response} from "express";
import admin from "../auth/Firebase";
import {getUserFromPlayer} from "../services/UserService";

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

export function checkIfPlayer(req: Request, res: Response, next: NextFunction) {
    getAuthToken(req, res, async () => {
        const playerId = parseInt(req.params.id);

        if (!isNaN(playerId)) {
            await getUserFromPlayer(
                playerId
            ).then(async (user) => {
                if (user && user.uuid === req.authId) {
                    return next();
                } else {
                    return res.status(403).json({error: 'You are not authorized to view player info.'});
                }
            }).catch((err: any) => {
                res.status(404).json({error: `Error finding User: ${err}`});
            });
        } else {
            res.status(400).json({error: `Error parsing id: '${req.params.id}'`});
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
            return res.status(401).send({error: 'You are not authorized to make this request'});
        }
    });
}
