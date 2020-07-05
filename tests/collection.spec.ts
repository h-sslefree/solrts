import 'jasmine';
import * as express from 'express';
import { Router } from 'express';
import { CollectionOperation } from '../src/lib/Cloud/CollectionOperation';

describe('Collection management', () => {
    const apiVersion = 8.1;
    const solrPort = 3000;
    const expressApp: express.Application = express();
    const expressServer = expressApp.listen(solrPort);

    beforeAll(() => {
        // tslint:disable-next-line:no-console
        expressServer.on('error', () => console.error("Error starting 'solr'"));
        expressApp.use(
            '/solr',
            Router().get('/admin/collections', (req, res) => {
                const collectionName = req.query.name;
                if (!collectionName) {
                    res.status(500).send("Required parameter 'name' was not specified");
                }

                switch (req.query.action) {
                    case 'CREATE':
                    case 'RELOAD':
                    case 'UPLOAD':
                    case 'MODIFYCOLLECTION':
                    case 'LIST':
                    case 'DELETE':
                    case 'REINDEXCOLLECTION':
                    case 'COLSTATUS':
                    case 'BACKUP':
                    case 'RESTORE':
                    case 'REBALANCELEADERS':
                        break;
                    case 'RENAME':
                        if (!req.query.target) {
                            res.status(500).send(`Action RENAME requires parameter 'target'`);
                        }
                        break;
                    case 'COLLECTIONPROP':
                        if (!req.query.propertyName) {
                            res.status(500).send(`Action COLLECTIONPROP requires parameter 'propertyName'`);
                        }
                        break;
                    case 'MIGRATE':
                        if (!req.query['target.collectionOperation']) {
                            res.status(500).send(`Action MIGRATE requires parameter 'target.collectionOperation'`);
                        }
                        if (!req.query['split.key']) {
                            res.status(500).send(`Action MIGRATE requires parameter 'split.key'`);
                        }
                        break;
                    default:
                        res.status(500).send(`Unsupported action ${req.query.action}`);
                        break;
                }
                res.json({ name: collectionName, originalUrl: req.originalUrl });
            }),
        );
    });

    afterAll(() => {
        expressServer.close();
    });

    it('should throw an exception when no name was specified during creation of a new collectionOperation', async () => {
        const collectionOperation = new CollectionOperation(apiVersion);
        collectionOperation.numShards(3);
        collectionOperation.prepareCreate('', 'configsetid');
        try {
            await collectionOperation.execute('localhost', solrPort);
            expect(false).toBe(true);
        } catch (error) {
            expect(true).toBe(true);
        }
    });

    it('should be able to create a new collectionOperation', async () => {
        const collectionName = 'collection';
        const configsetId = 'configsetid';
        const collectionOperation = new CollectionOperation(apiVersion);
        collectionOperation.numShards(3);
        collectionOperation.prepareCreate(collectionName, configsetId);
        const response: { collectionName: string; originalUrl: string } = await collectionOperation.execute(
            'localhost',
            solrPort,
        );
        expect(response.originalUrl).toContain(`name=${collectionName}`);
        expect(response.originalUrl).toContain(`collection.configName=${configsetId}`);
        expect(response.originalUrl).toContain('action=CREATE');
    });

    it('should be able to delete a new collectionOperation', async () => {
        const collectionName = 'collection';
        const collectionOperation = new CollectionOperation(apiVersion);
        collectionOperation.numShards(3);
        collectionOperation.prepareDelete(collectionName);
        const response: { collectionName: string; originalUrl: string } = await collectionOperation.execute(
            'localhost',
            solrPort,
        );
        expect(response.originalUrl).toContain(`name=${collectionName}`);
        expect(response.originalUrl).toContain('action=DELETE');
    });

    it('should use router.name=implicit when shards are specified', async () => {
        const collectionName = 'collection';
        const configsetId = 'configsetid';
        const collectionOperation = new CollectionOperation(apiVersion);
        collectionOperation.routerName('compositeId');
        collectionOperation.shards(1);
        collectionOperation.prepareCreate(collectionName, configsetId);
        try {
            await collectionOperation.execute('localhost', solrPort);
            expect(false).toBe(true);
        } catch (error) {
            expect(true).toBe(true);
        }
        collectionOperation.routerName('implicit');
        const response: { collectionName: string; originalUrl: string } = await collectionOperation.execute(
            'localhost',
            solrPort,
        );
        expect(response.originalUrl).toContain('router.name=implicit');
        expect(response.originalUrl).toContain(`name=${collectionName}`);
    });

    it('should require numshards when router.name=compositeId has been specified', async () => {
        const collectionName = 'collection';
        const configsetId = 'configsetid';
        const collectionOperation = new CollectionOperation(apiVersion);
        collectionOperation.routerName('implicit');
        collectionOperation.numShards(1);
        collectionOperation.prepareCreate(collectionName, configsetId);
        try {
            await collectionOperation.execute('localhost', solrPort);
            expect(false).toBe(true);
        } catch (error) {
            expect(true).toBe(true);
        }
        collectionOperation.routerName('compositeId');
        const response: { collectionName: string; originalUrl: string } = await collectionOperation.execute(
            'localhost',
            solrPort,
        );
        expect(response.originalUrl).toContain('router.name=compositeId');
        expect(response.originalUrl).toContain(`name=${collectionName}`);
    });
});
