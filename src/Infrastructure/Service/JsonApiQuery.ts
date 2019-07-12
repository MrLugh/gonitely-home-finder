import { Request } from 'express';
import Query from '../../Domain/Model/Common/Query';

export default class JsonApiQuery implements Query {
    private filters: { [key: string]: string } = {};
    private sort: { [key: string]: string } = {};
    private includes: string[] = [];
    private page: number;
    private size: number;

    constructor(
        filters?: { [key: string]: string },
        sort?: { [key: string]: string },
        includes?: string[],
        page?: number,
        size?: number,
    ) {
        this.filters = filters || {};
        this.sort = sort || {};
        this.includes = includes || [];
        this.page = Math.max(1, Math.abs(page || 0) || 1);
        this.size = Math.min(Math.abs(size || 0) || 20, 50);
    }

    static fromRequest(request: Request): JsonApiQuery {
        const pagination = request.query.page;

        return new JsonApiQuery(
            request.query.filter instanceof Object ? request.query.filter : {},
            request.query.sort instanceof Object ? request.query.sort : {},
            request.query.include ? request.query.include.split(',') : [],
            parseInt(pagination && pagination.number ? pagination.number : 1),
            parseInt(pagination && pagination.size ? pagination.size : 20)
        );
    }

    getFilters(): {} {
        return this.filters;
    }

    getFilter(key: string): string | undefined {
        return this.filters[key];
    }

    getSort(): { [key: string]: string } {
        return this.sort;
    }

    getIncludes(): string[] {
        return this.includes;
    }

    getOffset(): number {
        return (this.page - 1) * this.size;
    }

    getPage(): number {
        return this.page;
    }

    getLimit(): number {
        return this.size;
    }

    setSize(size: number): void {
        this.size = size;
    }
}
