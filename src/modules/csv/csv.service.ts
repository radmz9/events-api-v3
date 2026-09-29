import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../users/entity/users.entity';
import { Repository, DataSource } from 'typeorm';
import { Readable } from 'stream';
import csvParser from 'csv-parser';
import { AreaEntity } from '../areas/entity/areas.entity';
import { CalendarEntity } from '../calendars/entity/calendar.entity';
import { SedeEntity } from '../sedes/entity/sede.entity';
import { EventEntity } from '../events/entity/event.entity';
import { RecordEntity } from '../records/entity/record.entity';
import { AdminRoles } from '../users/enums/admin-roles.enum';
import { handleMysqlError } from 'src/common/utils/db-error-handler';
import { Students, Staff, AttendanceCsv, AttendanceDto, ChangeStatusDto } from './interfaces';

@Injectable()
export class CsvService {
    constructor(
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
        @InjectRepository(AreaEntity) private areaRepo: Repository<AreaEntity>,
        @InjectRepository(CalendarEntity) private calRepo: Repository<CalendarEntity>,
        @InjectRepository(SedeEntity) private sedeRepo: Repository<SedeEntity>,
        @InjectRepository(EventEntity) private eventRepo: Repository<EventEntity>,
        @InjectRepository(RecordEntity) private recordRepo: Repository<RecordEntity>,
        private readonly dataSource: DataSource
    ){}

    private codePattern = /^[a-zA-Z0-9]{7,9}$/;
    private namePattern = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s.]{3,250}$/;  ///^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s.,]{3,250}$/;
    ///^[\p{L}\s.,]{3,250}$/u - Alfabeto latino

    private chunkSize = 500;

    async registerStudents(fileBuffer: Buffer){
        const filasCsv: Students[] = [];

        const headers = ['codigo', 'nombre', 'genero', 'etnia', 'idRol', 'idArea', 'idCalendario', 'idSede']

        await new Promise((resolve, reject) => {
            const stream = Readable.from(fileBuffer)

                stream
                .pipe(csvParser({ separator: ',' }))
                .on('headers', (h: string[]) => {
                    const missingHeaders = headers.filter(header => !h.includes(header))
                    if(missingHeaders.length > 0){
                        stream.destroy();
                        reject(new BadRequestException({ csvFile: `Faltan las siguientes columnas obligatorias: ${missingHeaders.join(', ')}` }));
                        
                    }
                })
                .on('data', (data: Students) => filasCsv.push(data))
                .on('end', resolve)
                .on('error', reject)
        })

        if(filasCsv.length === 0) throw new BadRequestException({ csvFile: 'El archivo CSV esta vacío.' })

        const codes = [...new Set(filasCsv.map((f) => f.codigo))];
        const areaIds = [...new Set(filasCsv.map((f) => Number(f.idArea)))];
        const calendarIds = [...new Set(filasCsv.map((f) => Number(f.idCalendario)))];
        const sedeIds = [...new Set(filasCsv.map((f) => f.idSede))];

        const [alumnosExistentes, carrerasExistentes, calendariosExistentes, sedesExistentes] = await Promise.all([
            this.userRepo.createQueryBuilder('a').select(['a.codigo']).where('a.codigo IN (:...codigos)', { codigos: codes }).getMany(),
            this.areaRepo.createQueryBuilder('c').select(['c.id']).where('c.id_tipo_area = :id_tipo', { id_tipo: 1 }).andWhere('c.id IN (:...ids)', { ids: areaIds }).getMany(),
            this.calRepo.createQueryBuilder('c').select(['c.id']).where('c.id IN (:...ids)', { ids: calendarIds }).getMany(),
            this.sedeRepo.createQueryBuilder('s').select(['s.id']).where('s.id IN (:...ids)', { ids: sedeIds }).getMany()
        ]);

        const codigosExistentesSet = new Set(alumnosExistentes.map(a => a.codigo));
        const carrerasExistentesSet = new Set(carrerasExistentes.map(c => c.id));
        const calendariosExistentesSet = new Set(calendariosExistentes.map(c => c.id));
        const sedesExistentesSet = new Set(sedesExistentes.map(s => s.id));

        const students: Students[] = [];
        const errores: string[] = [];

        filasCsv.forEach((fila, index) => {
            const rowNumber = index + 1;

            if(fila.codigo.match(this.codePattern) === null) {
                errores.push(`Fila ${rowNumber}: Código: solo se permiten letras y numeros, logitud mínima 7 y máxima 9.`)
                return;
            }

            if(codigosExistentesSet.has(fila.codigo)){
                errores.push(`Fila ${rowNumber}: El código ${fila.codigo} ya existe en el sistema.`);
                return;
            }
            
            if(fila.nombre.match(this.namePattern) === null){
                errores.push(`Fila ${rowNumber}: El nombre solo debe tener letras y ".", la longitud debe ser mínimo 3 y máximo 250`)
                return;
            }

            if(!['H','M'].includes(fila.genero)){
                errores.push(`Fila ${rowNumber}: Género: solo se permiten los siguientes valores: H o M. Valor recibido: ${fila.genero}`)
                return;
            }

            if(![0,1].includes(Number(fila.etnia))){
                errores.push(`Fila ${rowNumber}: Etnia: Solo se perminten los siguientes valores: 0 o 1. Valor recibido: ${fila.etnia}`)
                return;
            }

            if(![1,2,3].includes(Number(fila.idRol))){
                errores.push(`Fila ${rowNumber}: El idRol con el ID ${fila.idRol} no esta permitido, debe ser solo: 1, 2 o 3.`)
            }

            if(!carrerasExistentesSet.has(Number(fila.idArea))){
                errores.push(`Fila ${rowNumber}: idArea: la carrera con el ID ${fila.idArea} no existe.`);
                return;
            }

            if(!calendariosExistentesSet.has(Number(fila.idCalendario))){
                errores.push(`Fila ${rowNumber}: El calendario con el ID ${fila.idCalendario} no existe.`);
                return;
            }

            if(!sedesExistentesSet.has(Number(fila.idSede))){
                errores.push(`Fila ${rowNumber}: La sede con el ID ${fila.idSede} no existe.`);
                return;
            }

            const nuevoAlumno = this.userRepo.create({
                codigo: fila.codigo,
                nombre: fila.nombre,
                genero: fila.genero,
                etnia: Number(fila.etnia),
                idRol: Number(fila.idRol),
                idArea: Number(fila.idArea),
                idCalendario: Number(fila.idCalendario),
                idSede: Number(fila.idSede) 
            })

            students.push(nuevoAlumno);
        });

        if(errores.length > 0){
            throw new BadRequestException({ csvFile: errores })
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            for(let i = 0; i < students.length; i += this.chunkSize){
                const chunk = students.slice(i, i + this.chunkSize);
                await queryRunner.manager.save(UserEntity, chunk)
            }
            await queryRunner.commitTransaction();
            return {
                success: true,
                message: `Registros existosos: ${students.length}`
            }
        } catch (error) {
            console.log('Error', error)
            await queryRunner.rollbackTransaction();
            handleMysqlError(error)
        } finally {
            await queryRunner.release();
        }
    }

    async registerStaff(fileBuffer: Buffer, roleType: number) {
        const filasCsv: Staff[] = [];

        const headers = ['codigo', 'nombre', 'genero', 'idArea'];

        await new Promise((resolve, reject) => {
            const stream = Readable.from(fileBuffer)
            stream
                .pipe(csvParser({ separator: ',' }))
                .on('headers', (h: string[]) => {
                    const missingHeaders = headers.filter(header => !h.includes(header));
                    if(missingHeaders.length > 0){
                        stream.destroy();
                        reject(new BadRequestException({ csvFile: `Faltan las siguientes columnas obligatorias: ${missingHeaders.join(', ')}` }))
                    }
                })
                .on('data', (data: Staff) => filasCsv.push(data))
                .on('end', resolve)
                .on('error', reject)
        });

        if(filasCsv.length === 0) throw new BadRequestException({ csvFile: 'El archivo CSV esta vacío.' })

        const codes = [...new Set(filasCsv.map((f) => f.codigo))];
        const areaIds = [...new Set(filasCsv.map((f) => f.idArea))];

        let queryArea: string = 'a.id_tipo_area = 2';

        if(roleType === 5) queryArea = 'a.id_tipo_area IN (2,3)';

        const [codigosExistents, areasExistentes] = await Promise.all([
            this.userRepo.createQueryBuilder('u').select(['u.codigo']).where('u.codigo IN (:...codigos)', { codigos: codes }).getMany(),
            this.areaRepo.createQueryBuilder('a').select(['a.id']).where(queryArea).andWhere('a.id IN (:...ids)', { ids: areaIds }).getMany()
        ])

        const codigosExistentesSet = new Set(codigosExistents.map((s) => s.codigo));
        const areasExistentesSet = new Set(areasExistentes.map((a) => a.id));

        const staff: Staff[] = [];
        const errores: string[] = [];

        filasCsv.forEach((fila, index) => {
            const rowNumber = index + 1;

            if(fila.codigo.match(this.codePattern) === null) {
                errores.push(`Fila ${rowNumber}: Código: solo se permiten letras y numeros, logitud mínima 7 y máxima 9.`)
                return;
            }

            if(codigosExistentesSet.has(fila.codigo)){
                errores.push(`Fila ${rowNumber}: El código ${fila.codigo} ya existe en el sistema.`);
                return;
            }
            
            if(fila.nombre.match(this.namePattern) === null){
                errores.push(`Fila ${rowNumber}: El nombre solo debe tener letras y ".", la longitud debe ser mínimo 3 y máximo 250`)
                return;
            }

            if(!['H','M'].includes(fila.genero)){
                errores.push(`Fila ${rowNumber}: Género: solo se permiten los siguientes valores: H o M. Valor recibido: ${fila.genero}`)
                return;
            }
            
            if(!areasExistentesSet.has(Number(fila.idArea))){
                errores.push(`Fila ${rowNumber}: El área con el ID ${fila.idArea} no existe.`);
                return;
            }

            const nuevoStaff = this.userRepo.create({
                codigo: fila.codigo,
                nombre: fila.nombre,
                genero: fila.genero,
                idRol: Number(roleType),
                idArea: Number(fila.idArea)
            })

            staff.push(nuevoStaff)
        })
        
        if(errores.length > 0){
            throw new BadRequestException({ csvFile: errores })
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            for(let i = 0; i < staff.length; i += this.chunkSize){
                const chunk = staff.slice(i, i + this.chunkSize);
                await queryRunner.manager.save(UserEntity, chunk);
            }
            await queryRunner.commitTransaction();
            return{
                success: true,
                message: `Se registraron exitosamente ${staff.length} miembros`
            }
        } catch (error) {
            console.log(error);
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException('Error al realizar inserción masiva en la base de datos')
        } finally{
            await queryRunner.release();
        }
    }

    async attendaceEvent(fileBuffer: Buffer){
        const filasCsv: AttendanceCsv[] = [];

        const headers = ['idEvento', 'codigo'];

        await new Promise((resolve, reject) => {
            const stream = Readable.from(fileBuffer)
                stream
                .pipe(csvParser({ separator: ',' }))
                .on('header', (h: string[]) => {
                    const missingHeaders = headers.filter(header => !h.includes(header));
                    if(missingHeaders.length > 0){
                        stream.destroy()
                        reject(new BadRequestException({ csvFile: `Faltan las siguientes columnas obligatorias: ${missingHeaders.join(', ')}` }))
                    }
                })
                .on('data', (data: AttendanceCsv) => filasCsv.push(data))
                .on('end', resolve)
                .on('error', reject)
        })
        
        if(filasCsv.length === 0) throw new BadRequestException({ csv: 'El archivo CSV está vacío' })
        
        const codes = [...new Set(filasCsv.map(f => f.codigo))];
        const eventIds = [...new Set(filasCsv.map(f => Number(f.idEvento)))];

        const [usuarios, eventos, currentRecords] = await Promise.all([
            this.userRepo.createQueryBuilder('u').select(['u.id', 'u.codigo', 'u.idArea', 'u.idRol']).where('u.codigo IN (:...codigos)', { codigos: codes }).getMany(),
            this.eventRepo.createQueryBuilder('e').select('e.id').where('e.id IN (:...ids)', { ids: eventIds  }).getMany(),
            this.recordRepo.createQueryBuilder('r').select(['r.idEvento', 'r.idUsuario']).where('r.idEvento IN (:...ids)', { ids: eventIds }).printSql().getMany()
        ]);
        
        const userCodes = new Set(usuarios.map(c => c.codigo));
        const eventosIds = new Set(eventos.map(e => e.id));

        const attendance: AttendanceDto[] = [];
        const errores: string[] = [];

        filasCsv.forEach((fila, index) => {
            const rowNumber = index + 1;

            if(fila.codigo.match(this.codePattern) === null){
                errores.push(`Fila ${rowNumber}: Código: solo se permiten letras y numeros, logitud mínima 7 y máxima 9.`)
                return;
            }

            if(!userCodes.has(fila.codigo)){
                errores.push(`Fila ${rowNumber}: El código ${fila.codigo} no existe en el sistema.`);
                return;
            }

            const idEvento = Number(fila.idEvento);

            if(!eventosIds.has(idEvento)){
                errores.push(`Fila ${rowNumber}: El id ${idEvento} del evento no existe`);
                return
            }

            const user = usuarios.find(u => u.codigo === fila.codigo);

            if(user !== undefined){
                if(user.idRol === AdminRoles.INACTIVO){
                    errores.push(`Fila ${rowNumber}: El estatus del alumno ${fila.codigo} es INACTIVO`);
                    return;
                }

                if(currentRecords.length > 0){
                    const exists = currentRecords.findIndex(r => r.idEvento === idEvento && r.idUsuario === user.id);
                    if(exists !== -1){
                        errores.push(`Fila ${rowNumber}: Ya se ecuentra registrada una asistencia a este evento (${idEvento}) para el usuario ${fila.codigo}`)
                        return;
                    }
                }
            }

            const record = this.recordRepo.create({
                idEvento: idEvento,
                idUsuario: user?.id,
                idRol: user?.idRol,
                idArea: user?.idArea
            })
            
            attendance.push(record);
        })

        if(errores.length > 0) {
            throw new BadRequestException({ csvFile: errores })
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        
        try {
            for(let i = 0, len = attendance.length; i < len; i += this.chunkSize){
                const chunk = attendance.slice(i, i + this.chunkSize);
                await queryRunner.manager.save(RecordEntity, chunk)
            }
            await queryRunner.commitTransaction();
            return{
                success: true,
                message: `Registros existosos: ${attendance.length}`
            }
        } catch (error) {
            await queryRunner.rollbackTransaction();
            handleMysqlError(error);
        } finally {
            await queryRunner.release();
        }
    }

    async changeStudentStatus(fileBuffer: Buffer){
        const filasCsv: ChangeStatusDto[] = [];

        const headers = ['codigo', 'estatus'];

        await new Promise((resolve, reject) => {
            const stream = Readable.from(fileBuffer);

            stream
                .pipe(csvParser({ separator: ',' }))
                .on('headers', (h: string[]) => {
                    const missingHeaders = headers.filter(header => !h.includes(header));
                    if(missingHeaders.length > 0){
                        stream.destroy();
                        reject(new BadRequestException({ csvFile: `Faltan las siguientes columnas obligatorias: ${missingHeaders.join(', ')}` }));
                    }
                })
                .on('data', (data: ChangeStatusDto) => filasCsv.push(data))
                .on('end', resolve)
                .on('error', reject)
        })

        if(filasCsv.length === 0) throw new BadRequestException({ csvFile: 'El archivo CSV estaá vacío.' });

        const codes = [...new Set(filasCsv.map(r => r.codigo))];

        const students = await this.userRepo.createQueryBuilder('u').select(['u.id', 'u.codigo', 'u.idRol']).where('u.codigo IN (:...codigos)', { codigos: codes }).getMany();

        const studentsCode = new Set(students.map((s) => s.codigo));

        const payload: Partial<UserEntity>[] = [];
        const errores: string[] = [];

        filasCsv.forEach((fila, index) => {
            const rowNumber = index + 1;

            if(fila.codigo.match(this.codePattern) === null){
                errores.push(`Fila ${rowNumber}: Código: solo se permiten letras y numeros, logitud mínima 7 y máxima 9.`)
                return;
            }

            if(!studentsCode.has(fila.codigo)){
                errores.push(`Fila ${rowNumber}: El código ${fila.codigo} no existe en el sistema.`);
                return;
            }

            const user = students.find(s => s.codigo === fila.codigo);

            if(user !== undefined){
                if([4,5,6].includes(user.idRol)){
                    errores.push(`Fila ${rowNumber}: El código ${fila.codigo} no pertenece a un estudiante.`);
                    return;
                }
            }

            const idRol = Number(fila.estatus);

            if(![1,2,3].includes(idRol)){
                errores.push(`Fila ${rowNumber}: El valor estatus ${idRol} no es valido, debe ser: 1, 2 o 3`)
            }

            const record = this.userRepo.create({
                codigo: user?.codigo,
                idRol: idRol
            });

            payload.push(record);
        });

        if(errores.length > 0){
            throw new BadRequestException({ csvFile: errores })
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            for(let i = 0, len = payload.length; i < len; i += this.chunkSize){
                const chunk = payload.slice(i, i + this.chunkSize);

                // const parameters: Record<string, string | number> = {};

                // const cases = chunk
                //     .map(({ codigo, idRol }, index) => {
                //         if(codigo !== undefined && idRol !== undefined){
                //             parameters[`codigo${index}`] = codigo;
                //             parameters[`idRol${index}`] = idRol;
                //         }
                //         return `WHEN :codigos${index} THEN :idRol${index}`
                //     })
                //     .join(' ');

                const cases = chunk
                    .map(({ codigo, idRol }) => `WHEN :codigo_${codigo} THEN :idRol_${idRol}`)
                    .join(' ');
                
                const parameters = chunk.reduce(
                    (acc, { codigo, idRol }) => {
                        if (codigo !== undefined && idRol !== undefined) {
                            acc[`codigo_${codigo}`] = codigo;
                            acc[`idRol_${idRol}`] = idRol;
                        }
                        return acc;
                    },
                    {} as Record<string, string | number>
                );

                const codigos = chunk.map(({ codigo }) => codigo);

                await queryRunner.manager
                    .createQueryBuilder()
                    .update(UserEntity)
                    .set({
                        idRol: () => `CASE codigo ${cases} END`
                    })
                    .where('codigo IN (:...codigos)', { codigos })
                    .setParameters(parameters)
                    .execute();
            }
            return{
                success: true,
                message: `Registros existosos: ${payload.length}`
            }
        } catch (error) {
            await queryRunner.rollbackTransaction();
            handleMysqlError(error);
        } finally {
            await queryRunner.release();
        }
    }
}
