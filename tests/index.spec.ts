import 'jasmine';
import * as express from 'express';
import { NextFunction, Request, Response, Router } from 'express';
import * as bodyParser from 'body-parser';
import { IndexOperation } from '../src/lib/index/IndexOperation';

describe('Index operation', () => {
    const apiVersion = 8.1;
    const solrPort = 7000;
    const expressApp: express.Application = express();
    const expressServer = expressApp.listen(solrPort);

    beforeAll(() => {
        // tslint:disable-next-line:no-console
        expressServer.on('error', () => console.error("Error starting 'solr'"));
        expressApp.use(
            '/solr',
            Router().post(
                '/:collection/update',
                bodyParser.json(),
                (req: Request, res: Response, next: NextFunction) => {
                    res.json(req.body);
                },
            ),
        );
    });

    afterAll(() => {
        expressServer.close();
    });

    it('should support add and delete of documents', async () => {
        const collectionName = 'collection';
        const indexOperation = new IndexOperation(apiVersion);
        const adds: any[] = [
            {
                a: 1,
                b: 2,
            },
            {
                a: 3,
                b: 4,
                c: 5,
            },
        ];
        indexOperation.in(collectionName).prepareBulk(adds, []);
        expect(await indexOperation.execute('localhost', solrPort)).toEqual({ add: adds, delete: [] });
    });
});
