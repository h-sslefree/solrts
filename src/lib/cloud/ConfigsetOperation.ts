import { SolrRequest } from '../SolrRequest';
import { Readable } from 'stream';
import { createReadStream } from 'fs';

// https://lucene.apache.org/solr/guide/8_4/configsets-api.html#configsets-api

export class ConfigsetOperation extends SolrRequest {
    private readonly _wt = 'json';
    private _action: 'CREATE' | 'DELETE' | 'UPLOAD' | 'LIST' = 'CREATE';
    private _name: string = '';
    private _baseConfigSet = '';
    private _absolutePathToZipFile = '';

    constructor(private apiVersion: number) {
        super();
    }

    /**
     * Create a new configset based upon another configset
     *
     * @param name : the name of the new configset
     * @param baseConfigSet : the configset to base the new configset upon
     */
    public prepareCreate(name: string, baseConfigSet: string): ConfigsetOperation {
        this._action = 'CREATE';
        this._name = name;
        this._baseConfigSet = baseConfigSet;
        return this;
    }

    /**
     * Upload a new configset as zipfile
     * @param {string} name : configset will be stored under this name in Solr
     * @param {string} zipFile : zip file that contains the configset
     */
    public prepareUpload(name: string, absolutePathToZipFile: string): ConfigsetOperation {
        this._action = 'UPLOAD';
        this._name = name;
        this._absolutePathToZipFile = absolutePathToZipFile;
        return this;
    }

    /**
     * List the available configsets
     */
    public prepareList(): ConfigsetOperation {
        this._action = 'LIST';
        return this;
    }

    /**
     * Delete a configset
     * @param name : the name of the configset to delete
     */
    public prepareDelete(name: string): ConfigsetOperation {
        this._action = 'DELETE';
        this._name = name;
        return this;
    }

    protected httpQueryString(): string {
        let httpRequestString = `wt=${this._wt}&action=${this._action}`;
        switch (this._action) {
            case 'LIST':
                break;
            default: {
                if (!this._name) {
                    throw new Error('name is required');
                } else {
                    httpRequestString = `${httpRequestString}&name=${this._name}`;
                }
            }
        }
        switch (this._action) {
            case 'CREATE':
                httpRequestString = `${httpRequestString}&baseConfigSet=${this._baseConfigSet}`;
                break;
        }
        return httpRequestString;
    }

    protected httpBodyStream(): Readable {
        if (this._action === 'UPLOAD') {
            return createReadStream(this._absolutePathToZipFile);
        }
        return new Readable();
    }

    protected absolutePath(): string {
        return `/solr/admin/configs`;
    }

    protected httpMethod(): 'GET' | 'POST' {
        if (this._action === 'UPLOAD') {
            return 'POST';
        }
        return 'GET';
    }

    protected httpHeaders(): { 'content-type'?: string } {
        return {};
    }
}
