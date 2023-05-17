import {describe} from "node:test";
import request from "supertest";
import {Server} from "http";

import app from "../../src/app";

describe('API Status endpoint', () => {
    let server: Server;

    beforeAll(async () => {
        server = app.listen(3030);
    });

    afterAll(async () => {
        await server.close();
    });

    it('should return the health status', async () => {
        const response = await request(app).get('/')

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toEqual("UP");
    })
})
