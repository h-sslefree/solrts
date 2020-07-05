import 'jasmine';
import * as express from 'express';
import { Router } from 'express';
import { AliasOperation } from '../src/lib/cloud/AliasOperation';

describe('Collection aliasing', () => {
    const apiVersion = 8.1;
    const solrPort = 6000;
    const expressApp: express.Application = express();
    const expressServer = expressApp.listen(solrPort);

    beforeAll(() => {
        // tslint:disable-next-line:no-console
        expressServer.on('error', () => console.error("Error starting 'solr'"));
        expressApp.use(
            '/solr',
            Router().get('/admin/collections', (req, res) => {
                const response: any = { originalUrl: req.originalUrl };
                switch (req.query.action) {
                    case 'LISTALIASES':
                        break;
                    case 'CREATEALIAS':
                    case 'DELETEALIAS':
                        if (!req.query.name) {
                            res.status(500).send("Required parameter 'name' was not specified");
                        }
                        response.name = req.query.name;

                        if (req.query.action === 'CREATEALIAS') {
                            if (!req.query.collections) {
                                res.status(500).send(`Action CREATEALIAS requires parameter 'collections'`);
                            }
                            response.collections = req.query.collections;
                        }
                        break;
                    default:
                        res.status(500).send(`Unsupported action ${req.query.action}`);
                        break;
                }
                res.json(response);
            }),
        );
    });

    afterAll(() => {
        expressServer.close();
    });

    it('should be able to create a new alias', async () => {
        const aliasName = 'alias';
        const aliasOperation = new AliasOperation(apiVersion);
        const collections = ['collection1', 'collection2'];
        aliasOperation.prepareCreate(aliasName, collections);
        const response: any = await aliasOperation.execute('localhost', solrPort);
        expect(response.originalUrl).toContain(`name=${aliasName}`);
        expect(response.originalUrl).toContain('action=CREATEALIAS');
        expect(response.collections).toEqual(collections.join(','));
    });

    it('should be able to delete an alias', async () => {
        const aliasName = 'alias';
        const aliasOperation = new AliasOperation(apiVersion);
        aliasOperation.prepareDelete(aliasName);
        const response: any = await aliasOperation.execute('localhost', solrPort);
        expect(response.originalUrl).toContain(`name=${aliasName}`);
        expect(response.originalUrl).toContain('action=DELETEALIAS');
    });

    it('should be able to list aliases', async () => {
        const aliasName = 'alias';
        const aliasOperation = new AliasOperation(apiVersion);
        aliasOperation.prepareList();
        const response: any = await aliasOperation.execute('localhost', solrPort);
        expect(response.originalUrl).toContain('action=LISTALIASES');
    });
});
