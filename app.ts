import express, {Request, Response } from 'express';
import multer from 'multer';
const path = require('path')
import sharp, { cache } from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import fsPromise from 'fs/promises'

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
    },
    filename: function(req, file, cb) {
        const ext = file.originalname.split('.').pop();
        const uuid = uuidv4();
        cb(null, uuid);
    }
})

const upload = multer({ storage });

export const app = express();

app.post('/upload', upload.array('images'), (req: Request, res: Response) => {
    if(!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No image uploaded" });
    }

    const ids = (req.files as Express.Multer.File[]).map((image) => {
        return image.filename
    })
    return res.status(200).json({ imageIds: ids })
})

app.get('/image/:imageId', async (req: Request, res: Response) => {
    const { imageId } = req.params;
    const baseId = imageId.split('.')[0]
    const imagePath = path.join(__dirname, `uploads/${baseId}`);

    let format;

    try {
        format = imageId.split('.')[1];
    } catch(error) {

    }

    if(!fs.existsSync(imagePath)) {
        res.status(400).send({ error: `Image with id ${baseId} does not exist.`})
    } else {
        if(!format) {
            res.sendFile(imagePath);
        } else {
            const imageBuf = await sharp(imagePath).toBuffer();
            try {
                const convertedBuf = await sharp(imageBuf).toFormat(sharp.format[`${format}`]).toBuffer();
                await fsPromise.writeFile()
                res.type(`image/${format}`).send(convertedBuf);
            } catch(error) {
                console.log(error);
                res.status(500).send({ error: "Error processing image. Accepted conversion formats are: JPEG, PNG, WebP, GIF, AVIF and TIFF" })
            }
        }
    }
})

