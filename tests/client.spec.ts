import 'jasmine';
import { SolrClient } from '../src/SolrClient';

describe('Client api', () => {
    const apiVersion = 8.1;
    const client = new SolrClient(apiVersion);

    it('should offer convenient search', () => {
        expect(client.searchOperation).toBeDefined();
    });

    it('should offer convenient collection management', () => {
        expect(client.collectionOperation).toBeDefined();
    });

    it('should offer convenient configset management', () => {
        expect(client.configsetOperation).toBeDefined();
    });

    it('should offer convenient collection aliasing', () => {
        expect(client.aliasOperation).toBeDefined();
    });
});
