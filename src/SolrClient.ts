import { SearchOperation } from './lib/search/SearchOperation';
import { CollectionOperation } from './lib/cloud/CollectionOperation';
import { ConfigsetOperation } from './lib/cloud/ConfigsetOperation';
import { AliasOperation } from './lib/cloud/AliasOperation';
import { IndexOperation } from './lib/index/IndexOperation';
export { SearchFilter } from './lib/search/SearchFilter';

export class SolrClient {
    public searchOperation: SearchOperation;
    public collectionOperation: CollectionOperation;
    public configsetOperation: ConfigsetOperation;
    public aliasOperation: AliasOperation;
    public indexOperation: IndexOperation;

    /**
     * @param apiVersion : the version of the Solr server (e.g. 8.1)
     */
    constructor(private apiVersion: number) {
        this.searchOperation = new SearchOperation(this.apiVersion);
        this.collectionOperation = new CollectionOperation(this.apiVersion);
        this.configsetOperation = new ConfigsetOperation(this.apiVersion);
        this.aliasOperation = new AliasOperation(this.apiVersion);
        this.indexOperation = new IndexOperation(this.apiVersion);
    }
}
