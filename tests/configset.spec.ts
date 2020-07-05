import 'jasmine';
import * as express from 'express';
import { NextFunction, Request, Response, Router } from 'express';
import * as bodyParser from 'body-parser';
import { ConfigsetOperation } from '../src/lib/Cloud/ConfigsetOperation';
import * as crypto from 'crypto';
import { readFileSync } from 'fs';

describe('Configset management', () => {
    const apiVersion = 8.1;
    const solrPort = 4000;
    const expressApp: express.Application = express();
    const expressServer = expressApp.listen(solrPort);

    beforeAll(() => {
        // tslint:disable-next-line:no-console
        expressServer.on('error', () => console.error("Error starting 'solr'"));
        expressApp.use(
            '/solr',
            Router()
                .get('/admin/configs', (req: Request, res: Response, next: NextFunction) => {
                    const response: { action: any; originalUrl: string; baseConfigSet?: any; dataHash?: any } = {
                        action: req.query.action,
                        originalUrl: req.originalUrl,
                    };
                    switch (req.query.action) {
                        case 'LIST':
                            break;
                        case 'CREATE':
                            response.baseConfigSet = req.query.baseConfigSet;
                        // ! fallthrough !
                        case 'DELETE':
                            if (!req.query.name) {
                                res.status(500).send("Required parameter 'name' was not specified");
                            }
                            break;
                        default:
                            res.status(500).send(`Unsupported action ${req.query.action}`);
                            break;
                    }
                    res.json(response);
                })
                .post('/admin/configs', bodyParser.text(), (req: Request, res: Response, next: NextFunction) => {
                    const response: { action: any; originalUrl: string; baseConfigSet?: any; dataHash?: any } = {
                        action: req.query.action,
                        originalUrl: req.originalUrl,
                    };
                    switch (req.query.action) {
                        case 'UPLOAD':
                            let data: string = '';
                            req.on('data', (chunk) => {
                                data += chunk;
                            });
                            req.on('end', () => {
                                response.dataHash = crypto.createHash('md5').update(data).digest('hex');
                                res.json(response);
                            });
                            break;
                        default:
                            res.status(500).send(`Unsupported action ${req.query.action}`);
                            break;
                    }
                }),
        );
    });

    afterAll(() => {
        expressServer.close();
    });

    it('should have all required fields when creating a configset', async () => {
        const configSetOperation = new ConfigsetOperation(apiVersion);
        const configName = 'configset';
        const baseConfigSet = 'baseConfigSet';
        configSetOperation.prepareCreate(configName, baseConfigSet);
        const response: {
            action: any;
            originalUrl: string;
            baseConfigSet?: any;
            dataHash?: any;
        } = await configSetOperation.execute('localhost', solrPort);
        expect(response.originalUrl).toContain(`name=${configName}`);
        expect(response.originalUrl).toContain('action=CREATE');
        expect(response.originalUrl).toContain(`baseConfigSet=${baseConfigSet}`);
    });

    it('should have all required fields and correctly posted file contents when uploading a configset', async () => {
        const configSetOperation = new ConfigsetOperation(apiVersion);
        const configName = 'configset';
        const zipFileName = __filename;
        configSetOperation.prepareUpload(configName, zipFileName);
        const response: {
            action: any;
            originalUrl: string;
            baseConfigSet?: any;
            dataHash?: any;
        } = await configSetOperation.execute('localhost', solrPort);
        expect(response.originalUrl).toContain(`name=${configName}`);
        expect(response.originalUrl).toContain('action=UPLOAD');
        // verify that the server received exact the same content as our file
        const zipFileContents = readFileSync(zipFileName, 'utf-8');
        const zipFileContentsHash = crypto.createHash('md5').update(zipFileContents).digest('hex');
        expect(response.dataHash).toEqual(zipFileContentsHash);
    });

    it('should support list all configsets', async () => {
        const configSetOperation = new ConfigsetOperation(apiVersion);
        configSetOperation.prepareList();
        const response: {
            action: any;
            originalUrl: string;
            baseConfigSet?: any;
            dataHash?: any;
        } = await configSetOperation.execute('localhost', solrPort);
        expect(response.originalUrl).toContain('action=LIST');
    });
});
