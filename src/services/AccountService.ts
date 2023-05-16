import admin from "../auth/Firebase";

export async function createUser(req: any, res: any): Promise<void> {
    const {email, password} = req.body;

    const user = await admin.auth().createUser({
        email,
        password
    });

    res.send(user);
}

