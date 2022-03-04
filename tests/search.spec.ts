import 'jasmine';
import * as express from 'express';
import { Router } from 'express';
import { SearchOperation } from '../src/lib/search/SearchOperation';
import { LuceneQuery } from '../src/lib/search/LuceneQuery';
import { RawQuery } from '../src/lib/search/RawQuery';
import { SearchFilter } from '../src/lib/search/SearchFilter';

describe('SearchOperation', () => {
    const apiVersion = 8.1;
    const solrPort = 5000;
    const expressApp: express.Application = express();
    const expressServer = expressApp.listen(solrPort);

    beforeAll(() => {
        // tslint:disable-next-line:no-console
        expressServer.on('error', () => console.error("Error starting 'solr'"));
        expressApp.use(
            '/solr',
            Router().get('/:collection/:handler', (req, res) => {
                res.json({ originalUrl: req.originalUrl });
            }),
        );
    });

    afterAll(() => {
        expressServer.close();
    });

    it('should be able to search for multiple terms in a field with a weight', async () => {
        const search = new SearchOperation(apiVersion);
        search.in('somecollection').for(new LuceneQuery().term('beer').term('home brewery').in('title').weight(1.0));
        const response: { originalUrl: string } = await search.execute('localhost', solrPort);
        expect(response.originalUrl).toContain('title:("beer"%20"home%20brewery")^1');
    });

    it('should be able to pass an offset', async () => {
        const search = new SearchOperation(apiVersion);
        search.in('somecollection').offset(11);
        const response: { originalUrl: string } = await search.execute('localhost', solrPort);
        expect(response.originalUrl).toContain('start=11');
    });

    it('should default to search term *:*', async () => {
        const search = new SearchOperation(apiVersion);
        search.in('somecollection').offset(11);
        const response: { originalUrl: string } = await search.execute('localhost', solrPort);
        expect(response.originalUrl).toContain('q=*:*');
    });

    it('should be able to specify limit', async () => {
        const search = new SearchOperation(apiVersion);
        search.in('somecollection').limit(22);
        const response: { originalUrl: string } = await search.execute('localhost', solrPort);
        expect(response.originalUrl).toContain('rows=22');
    });

    it('should be able to specify a filter with a string value', async () => {
        const search = new SearchOperation(apiVersion);
        const value = 'value1';
        search.in('somecollection').filter(new SearchFilter('field1').equals(value));
        const response: { originalUrl: string } = await search.execute('localhost', solrPort);
        expect(response.originalUrl).toContain(`fq=field1:${value}`);
    });

    it('should be able to specify an OR filter', async () => {
        const search = new SearchOperation(apiVersion);
        const value1 = 'value1';
        const value2 = 'value2';
        const value3 = 'value3';
        search.in('somecollection').filter(new SearchFilter('field1').ors([value1, value2, value3]));
        const response: { originalUrl: string } = await search.execute('localhost', solrPort);
        expect(response.originalUrl).toContain(`fq=field1:(${value1}%20OR%20${value2}%20OR%20${value3})`);
    });

    it('should be able to specify a facet', async () => {
        const search = new SearchOperation(apiVersion);
        const field1 = 'field1';
        const field2 = 'field2';
        search.in('somecollection').facetOnField(field1).facetOnField(field2);
        const response: { originalUrl: string } = await search.execute('localhost', solrPort);
        expect(response.originalUrl).toContain(`facet=true`);
        expect(response.originalUrl).toContain(`facet.field=${field1}`);
        expect(response.originalUrl).toContain(`facet.field=${field2}`);
    });

    it('should be able to specify a filter with a date value', async () => {
        const search = new SearchOperation(apiVersion);
        const value = new Date();
        search.in('somecollection').filter(new SearchFilter('field1').equals(value));
        const response: { originalUrl: string } = await search.execute('localhost', solrPort);
        expect(response.originalUrl).toContain(`fq=field1:${value.toISOString()}`);
    });

    it('should be able to specify a filter with an integer value', async () => {
        const search = new SearchOperation(apiVersion);
        const value = 321;
        search.in('somecollection').filter(new SearchFilter('field1').equals(value));
        const response: { originalUrl: string } = await search.execute('localhost', solrPort);
        expect(response.originalUrl).toContain(`fq=field1:${value.toString()}`);
    });

    it('should default to * from and to range', async () => {
        const search = new SearchOperation(apiVersion);
        search.in('somecollection').filter(new SearchFilter('field1'));
        const response: { originalUrl: string } = await search.execute('localhost', solrPort);
        expect(response.originalUrl).toContain(`fq=field1:[*%20TO%20*]`);
    });

    it('should be able to specify a filter with a string range', async () => {
        const search = new SearchOperation(apiVersion);
        const from = 'from';
        const to = 'to';
        search.in('somecollection').filter(new SearchFilter('field1').from(from).to(to));
        const response: { originalUrl: string } = await search.execute('localhost', solrPort);
        expect(response.originalUrl).toContain(`fq=field1:[${from}%20TO%20${to}]`);
    });

    it('should be able to specify a filter with a date range', async () => {
        const search = new SearchOperation(apiVersion);
        const from = new Date();
        const to = new Date();
        search.in('somecollection').filter(new SearchFilter('field1').from(from).to(to));
        const response: { originalUrl: string } = await search.execute('localhost', solrPort);
        expect(response.originalUrl).toContain(`fq=field1:[${from.toISOString()}%20TO%20${to.toISOString()}]`);
    });

    it('should be able to specify a filter with an integer range', async () => {
        const search = new SearchOperation(apiVersion);
        const from = 5;
        const to = 10;
        search.in('somecollection').filter(new SearchFilter('field1').from(from).to(to));
        const response: { originalUrl: string } = await search.execute('localhost', solrPort);
        expect(response.originalUrl).toContain(`fq=field1:[${from}%20TO%20${to}]`);
    });

    it('should be able to specify multiple filters', async () => {
        const search = new SearchOperation(apiVersion).in('somecollection');
        search.filter(new SearchFilter('field1').equals('value1'));
        search.filter(new SearchFilter('field2').equals('value2'));
        const response: { originalUrl: string } = await search.execute('localhost', solrPort);
        expect(response.originalUrl).toContain('fq=field1:value1');
        expect(response.originalUrl).toContain('fq=field2:value2');
    });

    it('should be able to specify multiple fields', async () => {
        const search = new SearchOperation(apiVersion).in('somecollection');
        search.field('field1');
        search.field('field2');
        const response: { originalUrl: string } = await search.execute('localhost', solrPort);
        expect(response.originalUrl).toContain('fl=field1,field2');
    });

    it('should be able to sort on a field ascending', async () => {
        const search = new SearchOperation(apiVersion).in('somecollection');
        const field = 'field1';
        const order: 'asc' | 'desc' = 'asc';
        search.sort(field, order);
        const response: { originalUrl: string } = await search.execute('localhost', solrPort);
        expect(response.originalUrl).toContain(`sort=${field}%20${order}`);
    });

    it('should be able to specify a requesthandler', async () => {
        const handler = 'myhandler';
        const collection = 'somecollection';
        const search = new SearchOperation(apiVersion).for(new LuceneQuery().term('home brewery').in('title')).in(collection);
        search.handler(handler);
        const response: { originalUrl: string } = await search.execute('localhost', solrPort);
        expect(response.originalUrl).toContain(`/${collection}/${handler}`);
    });

    it('should be able to create a complex query object by chaining', async () => {
        const search = new SearchOperation(apiVersion);
        const date = new Date();
        search
            .for(new LuceneQuery().term('home brewery').in('title'))
            .in('somecollection')
            .offset(1)
            .limit(20)
            .filter(new SearchFilter('field1').equals('value1'))
            .filter(new SearchFilter('field2').equals('value2'))
            .field('field3')
            .field('field4')
            .filter(new SearchFilter('field3').from(date).to(date))
            .filter(new SearchFilter('field4').equals(12));
        const response: { originalUrl: string } = await search.execute('localhost', solrPort);
        expect(response.originalUrl).toContain('title:("home%20brewery")');
        expect(response.originalUrl).toContain('start=1');
        expect(response.originalUrl).toContain('rows=20');
        expect(response.originalUrl).toContain('fq=field1:value1');
        expect(response.originalUrl).toContain('fq=field2:value2');
        expect(response.originalUrl).toContain('fl=field3,field4');
        expect(response.originalUrl).toContain(`fq=field3:[${date.toISOString()}%20TO%20${date.toISOString()}]`);
        expect(response.originalUrl).toContain('fq=field4:12');
    });

    it('should escape special characters', () => {
        expect(new LuceneQuery().term('+ - && || ! ( ) { } [ ] ^ " ~ * ? : /').toString()).toEqual(
            '*:("\\+ \\- \\&& \\|| \\! \\( \\) \\{ \\} \\[ \\] \\^ \\" \\~ \\* \\? \\: \\/")',
        );
    });

    it('should be able to perform a raw query', () => {
        expect(new RawQuery().term('started:[2003-01-01T00:00:00.000Z TO 2004-01-01T00:00:00.000Z] OR ended:[2003-01-01T00:00:00.000Z TO 2004-01-01T00:00:00.000Z]').toString()).toEqual(
            'started:[2003-01-01T00:00:00.000Z TO 2004-01-01T00:00:00.000Z] OR ended:[2003-01-01T00:00:00.000Z TO 2004-01-01T00:00:00.000Z]',
        );
    });
});
