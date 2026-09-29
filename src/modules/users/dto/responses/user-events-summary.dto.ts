import { EventAttendedDto } from "./event-attended.dto";

export class UserEventsSummaryDto {
    total!: number;

    totalHours!: number;

    events!: EventAttendedDto[];    
}