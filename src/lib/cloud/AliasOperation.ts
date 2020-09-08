import { SolrRequest } from '../SolrRequest';
import { Readable } from 'stream';

export class AliasOperation extends SolrRequest {
    private _action: 'CREATEALIAS' | 'DELETEALIAS' | 'LISTALIASES' | 'ALIASPROP' = 'CREATEALIAS';

    private _name: string = '';
    private _collections: string[] = new Array<string>();

    private readonly _wt = 'json';

    constructor(private apiVersion: number) {
        super();
    }

    /**
     * Prepare creation of a standard alias
     *
     * @param {string} name : name of alias that should be created
     * @param {string} collections : array of collections where the alias should point to
     */
    public prepareCreate(name: string, collections: string[]): AliasOperation {
        this._action = 'CREATEALIAS';
        this._name = name;
        this._collections = collections;
        return this;
    }

    public prepareDelete(name: string): AliasOperation {
        this._action = 'DELETEALIAS';
        this._name = name;
        return this;
    }

    public prepareList(): AliasOperation {
        this._action = 'LISTALIASES';
        return this;
    }

    protected httpQueryString(): string {
        let httpRequestString = `wt=${this._wt}`;
        switch (this._action) {
            case 'LISTALIASES':
                break;
            case 'CREATEALIAS': {
                if (!this._collections.length) {
                    throw new Error('one or more collections are required');
                } else {
                    httpRequestString = `${httpRequestString}&collections=${this._collections.join(',')}`;
                }
                if (!this._name) {
                    throw new Error('name is required');
                } else {
                    httpRequestString = `${httpRequestString}&name=${this._name}`;
                }
                break;
            }
            case 'DELETEALIAS': {
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
