export interface ISearchQuery {
    defType: 'lucene' | 'dismax' | 'edismax';
    toString(): string;
}
