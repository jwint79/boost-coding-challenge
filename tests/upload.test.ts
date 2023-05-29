import request from 'supertest'
import { Express, Request, Response } from 'express'
import { app } from '../app'
import fs from 'fs'
import path from 'path'

describe('Express', () => {

    let expressApp;

    beforeAll(() => {
        expressApp = app;
    })

    test('Should upload images and return array of image ids', async () => {
        
        const testImage1buf = fs.readFileSync(path.join(__dirname, 'testImage1.png'))
        const testImage2buf = fs.readFileSync(path.join(__dirname, 'testImage2.png'))

        const response = await request(expressApp)
            .post('/upload')
            .attach('images', testImage1buf, 'testimage1.png')
            .attach('images', testImage2buf, 'testimage2.png')
        
        expect(response.status).toBe(200);
        expect(response.body.imageIds).toHaveLength(2)
    })
})

