import { UserEventsSummaryDto } from "./user-events-summary.dto";

export class UserWithEventsDto {
    id!: number;
    codigo!: string;
    nombre!: string;
    area!: string;
    rol!: string;
    areaResponsable!: string;
    rolAreaResponsable!: string;
    eventsSummary!: UserEventsSummaryDto;
}