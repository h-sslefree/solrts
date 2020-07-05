/**
 * A SearchFilter filters the search results on results that have an accepted value for the field.
 * It is send as 'fq' to Solr (see https://lucene.apache.org/solr/guide/6_6/common-query-parameters.html#CommonQueryParameters-Thefq_FilterQuery_Parameter).
 */
export class SearchFilter {
    private _fromValue: string | number | Date = '';
    private _toValue: string | number | Date = '';
    private _equalsValue: string | number | Date = '';
    private _orsValue: (string | number | Date)[] = [];

    constructor(private _field: string) {}

    /**
     * A list of values where the field should contain one or more from
     * @param value
     */
    public ors(value: (string | number | Date)[]): SearchFilter {
        this._orsValue = value;
        return this;
    }

    /**
     * Specifies an exact value the field should contain
     * @param value
     */
    public equals(value: string | number | Date): SearchFilter {
        this._equalsValue = value;
        return this;
    }

    /**
     * Specifies the starting point of a range
     * @param value : the value where to start from
     */
    public from(value: string | number | Date): SearchFilter {
        this._fromValue = value;
        return this;
    }

    /**
     * Specifies the end point of a range
     * @param value : the value where to end with
     */
    public to(value: string | number | Date): SearchFilter {
        this._toValue = value;
        return this;
    }

    private genericValueToString(value: string | number | Date): string {
        switch (typeof value) {
            case 'string': {
                return value as string;
            }
            case 'number': {
                return (value as number).toString();
            }
            case 'object': {
                return (value as Date).toISOString();
            }
            default: {
                throw new Error('Could not handle value type');
            }
        }
    }

    public toHttpQueryStringParameter(): string {
        let param = '';
        if (this._field) {
            if (this._equalsValue) {
                param = `${this._field}:${this.genericValueToString(this._equalsValue)}`;
            } else if (this._orsValue.length) {
                param = `${this._field}:(${this._orsValue
                    .map((value: string | number | Date) => this.genericValueToString(value))
                    .join(' OR ')})`;
            } else {
                const fromValue: string = this.genericValueToString(this._fromValue) || '*';
                const toValue: string = this.genericValueToString(this._toValue) || '*';
                param = `${this._field}:[${fromValue} TO ${toValue}]`;
            }
        }
        return param;
    }
}
