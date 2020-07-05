import { SolrRequest } from '../SolrRequest';
import { Readable } from 'stream';

// https://lucene.apache.org/solr/guide/6_6/uploading-data-with-index-handlers.html#UploadingDatawithIndexHandlers-AddingMultipleJSONDocuments

export class IndexOperation extends SolrRequest {
    private _collectionName: string = '';
    private _adds: any[] = [];
    private _deletes: string[] = [];

    constructor(private apiVersion: number) {
        super();
    }

    /**
     * @param name : name of collection to index into
     */
    public in(name: string): IndexOperation {
        this._collectionName = name;
        return this;
    }

    /**
     *
     * @param adds : the objects that should be added to the index
     * @param deletes : the ids of the documents that should be removed from the index
     */
    public prepareBulk(adds: any[], deletes: string[]): IndexOperation {
        this._adds = adds;
        this._deletes = deletes;
        return this;
    }

    protected httpQueryString(): string {
        return 'commit=true';
    }

    protected httpBodyStream(): Readable {
        const body = {
            add: this._adds,
            delete: this._deletes,
        };
        return Readable.from(JSON.stringify(body));
    }

    protected absolutePath(): string {
        if (!this._collectionName) {
            throw new Error('No collection name specified');
        }
        return `/solr/${this._collectionName}/update`;
    }

    protected httpMethod(): 'GET' | 'POST' {
        return 'POST';
    }

    protected httpHeaders(): { 'content-type'?: string } {
        return { 'content-type': 'application/json' };
    }
}
