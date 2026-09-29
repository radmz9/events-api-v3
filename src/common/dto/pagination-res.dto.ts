import { Expose, Type } from 'class-transformer';

export class MetaDto {
    @Expose() totalItems: number;
    @Expose() itemsCount: number;
    @Expose() itemsPerPage: number;
    @Expose() totalPages: number;
    @Expose() currentPage: number;
}

export class PaginationResponseDto<T> {
    @Expose()
    @Type((options) => (options?.newObject as PaginationResponseDto<T>).type)
    data: T[];

    @Expose()
    meta: MetaDto;

    private type: new () => T;

    constructor(data: T[], meta: MetaDto, type: new () => T){
        this.data = data;
        this.meta = meta;
        this.type = type;
    }
}