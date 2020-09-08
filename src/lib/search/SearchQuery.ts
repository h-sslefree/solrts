export abstract class SearchQuery {
    abstract getDefType(): 'lucene' | 'dismax' | 'edismax';
    abstract toString(): string;
}
