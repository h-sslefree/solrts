import { SolrRequest } from '../SolrRequest';
import { Readable } from 'stream';

// https://lucene.apache.org/solr/guide/8_2/collection-management.html#collection-management

export class CollectionOperation extends SolrRequest {
    private _action: 'CREATE' | 'DELETE' = 'CREATE';

    private _name: string = '';
    private _routerName: 'compositeId' | 'implicit' = 'compositeId';
    private _numShards: number = 0;
    private _shards: number = 0;
    private _collectionConfigName: string = '';

    // private _replicationFactor: number = 1;
    // private _nrtReplicas: number = 1;
    // private _tlogReplicas: number = 1;
    // private _pullReplicas: number = 1;
    // private _maxShardsPerNode: number = 1;
    // private _createNodeSet: string = '';
    // private _createNodeSetshuffle: boolean = true;

    // private _routerField: string = '';
    // private _property: Record<string, string>[] = new Array<Record<string, string>>();
    // private _autoAddReplicas: boolean = false;
    // private _async: boolean = false;
    // private _rule: string = '';
    // private _snitch: string = '';
    // private _policy: string = '';
    // private _waitForFinalState: boolean = false;
    // private _withCollection: string = '';
    // private _alias: string = '';

    private readonly _wt = 'json';

    constructor(private apiVersion: number) {
        super();
    }

    /**
     * @param {string} name : name of collection that should be created
     * @param {string} config : name of configset that should be used
     */
    public prepareCreate(name: string, config: string): CollectionOperation {
        this._action = 'CREATE';
        this._name = name;
        this._collectionConfigName = config;
        return this;
    }

    /**
     *
     * @param name name of collection that should be deleted
     */
    public prepareDelete(name: string): CollectionOperation {
        this._action = 'DELETE';
        this._name = name;
        return this;
    }

    public routerName(name: 'compositeId' | 'implicit'): CollectionOperation {
        this._routerName = name;
        return this;
    }

    public collectionConfigName(name: string): CollectionOperation {
        this._collectionConfigName = name;
        return this;
    }

    public numShards(amount: number): CollectionOperation {
        this._numShards = amount;
        return this;
    }

    public shards(amount: number): CollectionOperation {
        this._shards = amount;
        return this;
    }

    protected httpQueryString(): string {
        let httpRequestString = `wt=${this._wt}`;
        switch (this._action) {
            case 'CREATE': {
                if (this._routerName === 'compositeId') {
                    if (!this._numShards) {
                        throw new Error('numShards is required');
                    } else {
                        httpRequestString = `${httpRequestString}&router.name=${this._routerName}&numShards=${this._numShards}`;
                    }
                }
                if (this._routerName === 'implicit') {
                    if (!this._shards) {
                        throw new Error('shards is required');
                    } else {
                        httpRequestString = `${httpRequestString}&router.name=${this._routerName}&shards=${this._shards}`;
                    }
                }
                if (!this._name) {
                    throw new Error('name is required');
                } else {
                    httpRequestString = `${httpRequestString}&name=${this._name}`;
                }
                break;
            }
            case 'DELETE': {
                if (!this._name) {
                    throw new Error('name is required');
                } else {
                    httpRequestString = `${httpRequestString}&name=${this._name}`;
                }
                break;
            }
            default: {
                throw new Error(`Could not handle action ${this._action}`);
            }
        }

        if (this._collectionConfigName) {
            httpRequestString = `${httpRequestString}&collection.configName=${this._collectionConfigName}`;
        }
        httpRequestString = `${httpRequestString}&action=${this._action}`;
        return httpRequestString;
    }

    protected httpBodyStream(): Readable {
        return new Readable();
    }

    protected absolutePath(): string {
        return '/solr/admin/collections';
    }

    protected httpMethod(): 'GET' | 'POST' {
        return 'GET';
    }

    protected httpHeaders(): { 'content-type'?: string } {
        return {};
    }
}
