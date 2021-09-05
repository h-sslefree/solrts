import { SearchQuery } from './SearchQuery';
import { LuceneQuery } from './LuceneQuery';
import { SolrRequest } from '../SolrRequest';
import { SearchFilter } from './SearchFilter';
import { Readable } from 'stream';

export class SearchOperation extends SolrRequest {
    private _sortField: string = '';
    private _sortOrder: 'asc' | 'desc' = 'asc';
    private _start: number = 0;
    private _rows: number = 0;
    private _fq: SearchFilter[] = new Array<SearchFilter>();
    private _facetOnField: string[] = new Array<string>();
    private _fl: string[] = new Array<string>();
    private readonly _wt = 'json';
    private _q: SearchQuery = new LuceneQuery();
    private _collection = '';
    private _requesthandler = '';

    /**
     * @param {number} apiVersion : the version of the Solr server
     * @param {string} collection : the collection in Solr where to search in
     */
    constructor(private apiVersion: number) {
        super();
    }

    /**
     * @param {ISearchQuery} query : the query where to search for
     */
    public for(query: SearchQuery): SearchOperation {
        this._q = query;
        return this;
    }

    /**
     * @param {number} from : offset from where the results should be returned
     */
    public offset(offset: number): SearchOperation {
        this._start = offset;
        return this;
    }

    /**
     * @param {string} field : the field(s) to return for each result in the response
     * @example : search.field('field1').field('field2').field('*')
     */
    public field(field: string): SearchOperation {
        this._fl.push(field);
        return this;
    }

    /**
     * @param {string} facetOnField : the field that Solr should create a facet for in the response
     * @example : search.facetOnField('field1').facetOnField('field2');
     */
    public facetOnField(field: string): SearchOperation {
        this._facetOnField.push(field);
        return this;
    }

    /**
     * @param {string} collection : in which collection do we want to search
     */
    public in(collection: string): SearchOperation {
        this._collection = collection;
        return this;
    }

    /**
     * @param field : field to filter on
     * @param value : filter on this value in field
     * @param toValue : optional 'to' value to define range (toValue's type should equal value's type)
     */
    public filter(filter: SearchFilter): SearchOperation {
        this._fq.push(filter);
        return this;
    }

    /**
     * @param on : field to sort on
     * @param order : order to sort the values in the field on
     */
    public sort(on: string, order: 'asc' | 'desc'): SearchOperation {
        this._sortField = on;
        this._sortOrder = order;
        return this;
    }

    /**
     * @param {number} limit : the maximum amount of results that should be returned
     */
    public limit(limit: number): SearchOperation {
        this._rows = limit;
        return this;
    }

    /**
     * Specify the requesthandler that should be used
     *
     * @param {string} handler
     * @returns {SearchOperation}
     * @memberof SearchOperation
     */
    public handler(handler: string): SearchOperation {
        this._requesthandler = handler;
        return this;
    }

    protected httpQueryString(): string {
        let request = `wt=${this._wt}`;
        if (this._q) {
            request = `${request}&q=${this._q.toString()}&defType=${this._q.getDefType()}`;
        }
        if (this._sortField) {
            request = `${request}&sort=${this._sortField} ${this._sortOrder}`;
        }
        if (this._start) {
            request = `${request}&start=${this._start}`;
        }
        if (this._fq.length) {
            request = `${request}&${this._fq.map((fq) => 'fq=' + fq.toHttpQueryStringParameter()).join('&')}`;
        }
        if (this._facetOnField.length) {
            request = `${request}&facet=true&${this._facetOnField.map((field) => 'facet.field=' + field).join('&')}`;
        }
        if (this._fl.length) {
            request = `${request}&fl=${this._fl.join(',')}`;
        }
        if (this._rows) {
            request = `${request}&rows=${this._rows}`;
        }
        return request.replace(/\s/g, '%20');
    }

    protected httpBodyStream(): Readable {
        return new Readable();
    }

    protected absolutePath(): string {
        if (!this._collection) {
            throw new Error('Collection must be specified first');
        }
        return `/solr/${this._collection}/${this._requesthandler || 'select'}`;
    }

    protected httpMethod(): 'GET' | 'POST' {
        return 'GET';
    }

    protected httpHeaders(): { 'content-type'?: string } {
        return {};
    }
}
