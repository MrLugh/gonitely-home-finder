export default abstract class Query {
    public static readonly SORT_ASC = 'ASC';
    public static readonly SORT_DESC = 'DESC';

    abstract getFilters(): { [key: string]: string };
    abstract getFilter(key: string): string|undefined;
    abstract getSort(): { [key: string]: string };
    abstract getIncludes(): string[];
    abstract getOffset(): number;
    abstract getPage(): number;
    abstract getLimit(): number;
}
