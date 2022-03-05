import { SearchQuery } from './SearchQuery';

export class RawQuery extends SearchQuery {

    constructor(
        private _term: string = ''
    ) {
        super();
    }

    public getDefType(): 'lucene' | 'dismax' | 'edismax' {
        return 'lucene';
    }

    /**
     * @param term : the term to search on
     */
    public term(term: string): RawQuery {
        this._term = term;
        return this;
    }

    public toString(): string {
        return this._term;
    }
}
