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
        cb(null, uuid + '.' + ext);
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
    const { format } = req.query;

    const imagePath = path.join(__dirname, `uploads/${imageId}`);
    const cachePath = path.join(__dirname, `cache/${imageId.split('.')[0]}.${format}`)

    const originalFormat = imageId.split('.')[1];

    if(!format || format === originalFormat) {
        res.sendFile(imagePath);
    } else {
        try {

            if (format && fs.existsSync(cachePath)) {
                const cachedImage = await fsPromise.readFile(cachePath);
                res.type(`image/${format}`).send(cachedImage);
            } else {
                const imageBuf = await sharp(imagePath).toBuffer();
    
                if (format) {
                    const convertedBuf = await sharp(imageBuf).toFormat(sharp.format[`${format}`]).toBuffer();
                    await fsPromise.writeFile(cachePath, convertedBuf);
                    res.type(`image/${format}`).send(convertedBuf);
                } else {
                    res.sendFile(imagePath)
                }
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Error processing image. Accepted conversion formats are: JPEG, PNG, WebP, GIF, AVIF and TIFF" })
        }
    }
})
