import { SearchQuery } from './SearchQuery';

export class LuceneQuery extends SearchQuery {

    constructor(
        private _terms: string[] = new Array<string>(),
        private _field: string = '',
        private _weight: number = 0,
        private _q: string = '',
        private _op: 'AND' | 'OR' = 'AND',
        private _df: string[] = new Array<string>(),
        private _sow: boolean = true,
    ) {
        super();
    }

    public getDefType(): 'lucene' | 'dismax' | 'edismax' {
        return 'lucene';
    }

    /**
     * @param term : the term to search on
     */
    public term(term: string): LuceneQuery {
        term = term.replace(/([\+\-!\(\){}\[\]\^\\\"~\*\?:\/]|&&|\|\|)/g, '\\$1');
        this._terms.push(`"${term}"`);
        return this;
    }

    /**
     * @param field : the field to search in, defaults to _df
     */
    public in(field: string): LuceneQuery {
        this._field = field;
        return this;
    }

    /**
     * @param weight : the weight for matches of <term> in field <in>
     */
    public weight(weight: number): LuceneQuery {
        this._weight = weight;
        return this;
    }

    public toString(): string {
        let q = '';
        if (this._terms.length) {
            q = `(${this._terms.join(' ')})`;
        } else {
            q = '*';
        }
        if (this._field) {
            q = `${this._field}:${q}`;
        } else {
            q = `*:${q}`;
        }
        if (this._weight) {
            q = `${q}^${this._weight}`;
        }
        return q;
    }
}
