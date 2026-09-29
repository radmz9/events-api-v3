import { EventEntity } from 'src/modules/events/entity/event.entity';
import { UserGender } from 'src/modules/users/enums/user-genders.enum';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('externos')
export class OutsiderEntity{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'idEvento' }) //Ref
    idEvento!: number;

    @ManyToOne(() => EventEntity)
    @JoinColumn({ name: 'idEvento' })
    evento!: EventEntity;

    @Column({ length: '150', type: 'varchar' })
    nombre!: string;

    @Column({ length: '100', type: 'varchar' })
    dependencia!: string;

    @Column({
        type: 'enum',
        enum: UserGender
    })
    genero!: UserGender;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;
}