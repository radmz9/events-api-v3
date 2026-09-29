import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('calendarios')
export class CalendarEntity{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 5, type: 'varchar', unique: true })
    nombre!: string;
}