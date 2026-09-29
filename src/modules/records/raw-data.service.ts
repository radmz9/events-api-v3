import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RecordEntity } from "./entity/record.entity";
import { Repository } from "typeorm";
import { EventEntity } from "../events/entity/event.entity";
import { OutsiderEntity } from "../outsiders/entity/outsider.entity";
import { OdsEntity } from "../ods/entity/ods.entity";
import { AreaEntity } from "../areas/entity/areas.entity";
import { UserEntity } from "../users/entity/users.entity";
import { TypeEventEntity } from "../types_event/entity/types_event.entity";
import { CommunityStatsDto, GeneralStatsDto, OutsiderStatsDto } from "./dto/reports/general_stats.dto";
import { FinalReportEventsByGender, InforEventGenderDto } from "./dto/reports/by_gender.dto";
import { CommunityRoleStatsDto, FinalRoleStatsDto, OutsiderRoleStatsDto, ReportAttendanceByRoleDto } from "./dto/reports/stats_rol.dto";
import { CommonStatsOdsDto, EventOdsDto, FullReportOdsDto, FullStatsOdsDto } from "./dto/reports/ods.dto";
import { CarrerStatsDto, FinalReportAttendanceStudent } from "./dto/reports/attendance_students.dto";
import { FinalReportAttendanceStaffDto, GeneralStaffStatsDto } from "./dto/reports/attendance_staff.dto";
import { HistorialReportByAreaDto, HistorialReportDto } from "./dto/reports/historical.dto";
import { CountEventsByStudentDto, DetailedAttendanceByStudentsDto } from "./dto/reports/detailed_attendance";

@Injectable()
export class RawDataService{
    constructor(
        @InjectRepository(AreaEntity) private areaRepo: Repository<AreaEntity>,
        @InjectRepository(RecordEntity) private recordRepo: Repository<RecordEntity>,
        @InjectRepository(EventEntity) private eventRepo: Repository<EventEntity>,
        @InjectRepository(OutsiderEntity) private outsiderRepo: Repository<OutsiderEntity>,
        @InjectRepository(OdsEntity) private odsRepo: Repository<OdsEntity>,
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
        @InjectRepository(TypeEventEntity) private typeRepo: Repository<TypeEventEntity>
    ){}

    //reportOne on Express - Report Attendace By Year idRol
    async getStatsExternalsByGender(eventId: number): Promise<OutsiderStatsDto>{
        const rawData = await this.outsiderRepo.createQueryBuilder('externos')
            .select("COUNT(*)", 'total')
            .addSelect("COUNT(CASE WHEN externos.genero = 'H' THEN 1 END)", 'hombres')
            .addSelect("COUNT(CASE WHEN externos.genero = 'M' THEN 1 END)", 'mujeres')
            .where('idEvento = :idEvento', { idEvento: eventId })
            .getRawOne<{ total: string, hombres: string, mujeres: string }>()
        return {
            hombres: Number(rawData?.hombres || 0),
            mujeres: Number(rawData?.mujeres || 0),
            total: Number(rawData?.total || 0)
        }
    }

    async getStatsInternalsByGender(eventId: number, idRol: number): Promise<CommunityStatsDto>{
        const rawData = await this.recordRepo.createQueryBuilder('registros')
            .innerJoin('registros.usuario', 'u')
            .select([
                "COUNT(*) AS total",
                "COUNT(CASE WHEN u.genero = 'H' THEN 1 END) AS hombres",
                "COUNT(CASE WHEN u.genero = 'M' THEN 1 END) AS mujeres",
                "COUNT(CASE WHEN u.etnia = 1 THEN 1 END) AS indigenas"
            ])
            .where('registros.idEvento = :idEvento', { idEvento: eventId })
            .andWhere('registros.idRol = :idRol', { idRol } )
            .getRawOne<{ hombres: string, mujeres: string, indigenas: string, total: string }>()
        return{
            hombres: Number(rawData?.hombres || 0),
            mujeres: Number(rawData?.mujeres || 0),
            indigenas: Number(rawData?.indigenas || 0),
            total: Number(rawData?.total || 0),
        }
    }

    async getStatsAttendanceByGender(eventId: number): Promise<GeneralStatsDto>{
        const [alumnos, egresados, profesores, administrativos, externos] = await Promise.all([
            this.getStatsInternalsByGender(eventId, 1),
            this.getStatsInternalsByGender(eventId, 2),
            this.getStatsInternalsByGender(eventId, 4),
            this.getStatsInternalsByGender(eventId, 5),
            this.getStatsExternalsByGender(eventId),
        ]);

        return {
            alumnos,
            egresados,
            profesores,
            administrativos, 
            externos,
            total: alumnos.total + egresados.total + profesores.total + administrativos.total + externos.total
        }
    }

    async getEventsByYear(year: number, areaId?: number): Promise<InforEventGenderDto[]>{
        const query = this.eventRepo
            .createQueryBuilder('eventos')
            .innerJoin('eventos.tipo', 'tipos')
            .innerJoin('eventos.tematica', 'tematicas')
            .innerJoin('eventos.area', 'areas')
            .innerJoin('eventos.ods', 'ods')
            .innerJoin('eventos.modalidad', 'modalidades')
            .where('eventos.year = :year', { year });
            
        if(areaId){
            query.andWhere('eventos.idArea = :areaId', { areaId })
        }
        
        return query
            .andWhere(qb => {
                const subQuery = qb.subQuery()
                    .select('r.idEvento')
                    .from('registros', 'r')
                    .where('r.idEvento = eventos.id')
                    .getQuery();
                return `EXISTS ${subQuery}`;
            })
            .orderBy('eventos.fecha', 'DESC')
            .select([
                'eventos.id AS id',
                'areas.nombre AS area',
                'eventos.nombre AS nombre',
                'tipos.nombre AS tipo',
                'tematicas.nombre AS tematica',
                'ods.nombre AS ods',
                'modalidades.nombre AS modalidad',
                'eventos.fecha AS fecha'
            ])
            .getRawMany();
    }

    async getAttendaceEventsByGender(year: number, role: string, areaId: number): Promise<FinalReportEventsByGender[]> {
        const events = role === 'ROOT' ? await this.getEventsByYear(year) : await this.getEventsByYear(year, areaId);

        const eventsWithStats = await Promise.all(
            events.map(async (event) => {
                const stats = await this.getStatsAttendanceByGender(event.id);
                return {
                    ...event,
                    stats
                }
            })
        )
        return eventsWithStats;
    }

    //Attendace Report Event by Year - reportTwo on Express
    async getStatsInternalsByRol(eventId: number): Promise<CommunityRoleStatsDto>{
        const rawData = await this.recordRepo
            .createQueryBuilder('r')
            .select("SUM(CASE WHEN idRol IN(1,2) THEN 1 ELSE 0 END)", 'estudiantes')
            .addSelect("SUM(CASE WHEN idRol = 4 THEN 1 ELSE 0 END)", 'profesores')
            .addSelect("SUM(CASE WHEN idRol = 5 THEN 1 ELSE 0 END)", 'administrativos')
            .addSelect("COUNT(*)", 'total')
            .where('r.idEvento = :idEvento', { idEvento: eventId })
            .getRawOne<{ estudiantes: string, profesores: string, administrativos: string, total: string }>()
        return {
            estudiantes: Number(rawData?.estudiantes || 0),
            profesores: Number(rawData?.profesores || 0),
            administrativos: Number(rawData?.administrativos || 0),
            total: Number(rawData?.total || 0),
        }
    }

    async getStatsExternalsByRol(eventId: number): Promise<OutsiderRoleStatsDto>{
        const rawData = await this.outsiderRepo.createQueryBuilder('e')
            .select('COUNT(*)', 'externos')
            .where('e.idEvento = :idEvento', { idEvento: eventId })
            .getRawOne<{ externos: string }>()
        return {
            externos: Number(rawData?.externos || 0)
        }
    }

    async getFullStatsByRole(eventId: number): Promise<FinalRoleStatsDto>{
        const [internals, externals] = await Promise.all([
            this.getStatsInternalsByRol(eventId),
            this.getStatsExternalsByRol(eventId)
        ]);
        return {
            estudiantes: internals.estudiantes,
            profesores: internals.profesores,
            administrativos: internals.administrativos,
            externos: externals.externos,
            total: internals.total + externals.externos
        }
    }

    async getAttendaceEventsByRole(year: number): Promise<ReportAttendanceByRoleDto[]>{
        const events = await this.getEventsByYear(year);

        const eventsWithStats = await Promise.all(
            events.map(async (event) => {
                const stats = await this.getFullStatsByRole(event.id);
                return {
                    ...event,
                    stats
                }
            })
        )
        return eventsWithStats;
    }

    //Count Events By ODS - reportThree on Express
    async getEventsByOds(year: number): Promise<EventOdsDto[]>{
        return this.odsRepo
            .createQueryBuilder('ods')
            .select('ods.id', 'id')
            .addSelect('ods.nombre', 'nombre')
            .addSelect((subQuery) => {
                return subQuery
                    .select('COUNT(eventos.id)', 'totalEventos')
                    .from('eventos', 'eventos')
                    .where('eventos.idOds = ods.id')
                    .andWhere('eventos.year = :year', { year })
                    .andWhere((existsQuery) => {
                        const subExists = existsQuery
                            .subQuery()
                            .select('1')
                            .from('registros', 'registro')
                            .where('registro.idEvento = eventos.id')
                            .getQuery();
                        return `EXISTS ${subExists}`
                    });
            }, 'totalEventos')
            .orderBy('ods.nombre', 'ASC')
            .getRawMany()
    }

    async getStatsInternalsGenderByOds(idOds: number, year: number): Promise<CommonStatsOdsDto>{
        const result = await this.recordRepo
            .createQueryBuilder('registro')
            .innerJoin('eventos', 'evento', 'evento.id = registro.idEvento')
            .innerJoin('usuarios', 'usuario', 'usuario.id = registro.idUsuario')
            .select("COUNT(DISTINCT CASE WHEN usuario.genero = 'H' THEN usuario.id END)", 'hombres')
            .addSelect("COUNT(DISTINCT CASE WHEN usuario.genero = 'M' THEN usuario.id END)", 'mujeres')
            .addSelect("COUNT(DISTINCT usuario.id)", 'total')
            .where('evento.idOds = :idOds', { idOds })
            .andWhere('evento.year = :year', { year })
            .getRawOne<{ hombres: number, mujeres: number, total: number }>();
        return {
            hombres: Number(result?.hombres || 0),
            mujeres: Number(result?.mujeres || 0),
            total: Number(result?.total || 0)
        }
    }

    async getStatsExternalsGenderByOds(idOds: number, year: number): Promise<CommonStatsOdsDto>{
        const result = await this.outsiderRepo
            .createQueryBuilder('externo')
            .innerJoin('eventos', 'evento', 'evento.id = externo.idEvento')
            .select("COUNT(DISTINCT CASE WHEN externo.genero = 'H' THEN externo.id END)", 'hombres')
            .addSelect("COUNT(DISTINCT CASE WHEN externo.genero = 'M' THEN externo.id END)", 'mujeres')
            .addSelect("COUNT(DISTINCT externo.id)", 'total')
            .where('evento.idOds = :idOds', { idOds })
            .andWhere('evento.year = :year', { year })
            .getRawOne<{ hombres: number, mujeres: number, total: number }>();
        return {
            hombres: Number(result?.hombres || 0),
            mujeres: Number(result?.mujeres || 0),
            total: Number(result?.total || 0)
        }
    }

    async getFullStatsGendersOds(idOds: number, year: number): Promise<FullStatsOdsDto>{
        const [statsInternals, statsExternals] = await Promise.all([
            this.getStatsInternalsGenderByOds(idOds, year),
            this.getStatsExternalsGenderByOds(idOds, year)            
        ]);

        return {
            asistencia: statsExternals.total + statsInternals.total,
            comunidad: {
                ...statsInternals
            },
            externos: {
                ...statsExternals
            }
        }
    }

    async getDashboardOds(year: number): Promise<FullReportOdsDto> {
        const odsList = await this.getEventsByOds(year);
        const completeReport = await Promise.all(
            odsList.map(async(ods) => {
                const stats = await this.getFullStatsGendersOds(ods.id, year);
                return {
                    ...ods,
                    stats
                }
            })
        );

        const generalStats = completeReport.reduce((acc, curr) => {
            return{
                actividades: acc.actividades + Number(curr.totalEventos),
                asistencia: acc.asistencia + curr.stats.asistencia,
                comunidad: {
                    hombres: acc.comunidad.hombres + curr.stats.comunidad.hombres,
                    mujeres: acc.comunidad.mujeres + curr.stats.comunidad.mujeres,
                },
                externos: {
                    hombres: acc.externos.hombres + curr.stats.externos.hombres,
                    mujeres: acc.externos.mujeres + curr.stats.externos.mujeres,
                }
            }
        }, { actividades: 0, asistencia: 0, comunidad: { hombres: 0, mujeres: 0 }, externos: { hombres: 0, mujeres: 0 } });

        return {
            report: completeReport,
            generalStats
        }
    }

    //Dashboard Students Attendace By Area - reportFive on Express
    async getStatsStudentsByCareer(): Promise<CarrerStatsDto[]>{
        return this.areaRepo
            .createQueryBuilder('area')
            .select('area.id', 'id')
            .addSelect('area.nombre', 'nombre')
            .addSelect('COUNT(usuarios.id)', 'alumnos')
            .leftJoin(
                'area.user',
                'usuarios',
                'usuarios.idCalendario IS NOT NULL AND usuarios.idRol = :rolId', { rolId: 1 }
            )
            .where('area.id_tipo_area = :tipoId', { tipoId: 1})
            .groupBy('area.id')
            .orderBy('nombre')
            .printSql()
            .getRawMany()
    }

    async getStatsStudentsWithEvents(areaId: number, year: number): Promise<CommunityStatsDto>{
        const rawData = await this.userRepo.createQueryBuilder('u')
            .select("COUNT(DISTINCT CASE WHEN u.genero = 'H' THEN u.id END)", 'hombres')
            .addSelect("COUNT(DISTINCT CASE WHEN u.genero = 'M' THEN u.id END)", 'mujeres')
            .addSelect("COUNT(DISTINCT CASE WHEN u.etnia = 1 THEN u.id END)", 'indigenas')
            .innerJoin('registros', 'r', 'r.idUsuario = u.id AND r.idRol = :idRol AND r.idArea = :idArea', { idRol: 1, idArea: areaId })
            .innerJoin('eventos', 'e', 'r.idEvento = e.id AND e.year = :year', { year })
            .where('u.idCalendario IS NOT NULL')
            .getRawOne<{ hombres: string, mujeres: string, indigenas: string }>();
        
        return {
            hombres: Number(rawData?.hombres || 0),
            mujeres: Number(rawData?.mujeres || 0),
            indigenas: Number(rawData?.indigenas || 0),
            total: Number(rawData?.hombres || 0) + Number(rawData?.mujeres || 0)
        }
    }

    async getFullStatsAttendaceByStudents(year: number): Promise<FinalReportAttendanceStudent[]>{
        const areas = await this.getStatsStudentsByCareer();
        const areasStats = await Promise.all(
            areas.map(async (a) => {
                const stats = await this.getStatsStudentsWithEvents(a.id, year);
                return {
                    ...a,
                    ...stats
                }
            })
        )
        return areasStats;
    }

    //Staff Attendace By Year - reportFive on Express
    async getStaff(year: number): Promise<GeneralStaffStatsDto>{
        const rawData = await this.userRepo.createQueryBuilder('usuario')
            .select("SUM(IF(usuario.idRol = 4, 1, 0))", 'totalProfesores')
            .addSelect("SUM(IF(usuario.idRol = 5, 1, 0))", 'totalAdministrativos')
            .where('usuario.idCalendario IS NULL')
            .getRawOne<{ totalProfesores: string, totalAdministrativos: string }>()
        return {
            year,
            totalProfesores: Number(rawData?.totalProfesores || 0),
            totalAdministrativos: Number(rawData?.totalAdministrativos || 0),
        }
    }

    async getStatsStaffGender(year: number, idRol: number): Promise<OutsiderStatsDto>{
        const rawData = await this.userRepo.createQueryBuilder('u')
            .select("COUNT(DISTINCT CASE WHEN u.genero = 'H' THEN u.id END)", 'hombres')
            .addSelect("COUNT(DISTINCT CASE WHEN u.genero = 'M' THEN u.id END)", 'mujeres')
            .innerJoin('registros', 'r', 'r.idUsuario = u.id AND r.idRol = :idRol', { idRol })
            .innerJoin('eventos', 'e', 'r.idEvento = e.id AND e.year = :year', { year: year })
            .where('u.idCalendario IS NULL')
            .getRawOne<{ hombres: string, mujeres: string }>();
        
        return {
            hombres: Number(rawData?.hombres || 0),
            mujeres: Number(rawData?.mujeres || 0),
            total: Number(rawData?.hombres || 0) + Number(rawData?.mujeres || 0)
        }
    }

    async getFullStatsStaffAttendanceByYear(year: number): Promise<FinalReportAttendanceStaffDto[]>{
        const [statsTotals, statsTeachers, statsStaff] = await Promise.all([
            this.getStaff(year),
            this.getStatsStaffGender(year, 4),
            this.getStatsStaffGender(year, 5)
        ])
        return [{
            ...statsTotals,
            profesores: {
                ...statsTeachers
            },
            administrativos: {
                ...statsStaff
            }
        }]
    }

    //The Final Boss - reportSix on Express
    async getAreasForTheFinalBossReport(year: number): Promise<HistorialReportDto>{
        const allTypes = await this.typeRepo.find({ select: { id: true, nombre: true}, order: { nombre: 'ASC' } });

        const allAreas = await this.areaRepo.createQueryBuilder('a')
            .select('a.id', 'id')
            .addSelect('a.clave', 'clave')
            .addSelect('a.nombre', 'area')
            .where('a.id_tipo_area IN (1,2,3)')
            .getRawMany<{ id: number, clave: string, area: string}>();

        const rawData = await this.eventRepo.createQueryBuilder('evento')
            .innerJoin('evento.registros', 'registro')
            .select([
                'evento.idArea AS areaId',
                'evento.idTipo AS tipoId'
            ])
            .addSelect('COUNT(DISTINCT evento.id)', 'total')
            .where('evento.year = :year', { year })
            .groupBy('evento.idArea')
            .addGroupBy('evento.idTipo')
            .getRawMany<{ areaId: number, tipoId: number, total: number }>();

        const lookup = new Map<string, number>();
        rawData.forEach(item => {
            lookup.set(`${item.areaId}-${item.tipoId}`, Number(item.total));
        })

        let globalTotal = 0;
        const typesAccumulator = allTypes.map(t => ({ ...t, total: 0 }));
        
        const areasReport = allAreas.map(area => {
            let areaTotal = 0;

            const eventosPorTipo = allTypes.map((tipo, index) => {
                const cantidad = lookup.get(`${area.id}-${tipo.id}`) || 0;

                areaTotal += cantidad;
                typesAccumulator[index].total +=cantidad;
                globalTotal +=cantidad;

                return {
                    nombre: tipo.nombre,
                    total: cantidad
                }
            })
            return {
                clave: area.clave,
                area: area.area,
                eventos: eventosPorTipo,
                total: areaTotal
            }
        })
        return {
            areas: areasReport,
            types: typesAccumulator.map(t => ({ nombre: t.nombre, total: t.total })),
            total: globalTotal
        }
    }

    //Final Boss for not ROOT users
    async generalReportByArea(areaId: number): Promise<HistorialReportByAreaDto>{
        const allTypes = await this.typeRepo.find({ select: { id: true, nombre: true }, order: { nombre: 'ASC' } });

        const eventsByYearAndType = await this.eventRepo
            .createQueryBuilder('evento')
            .innerJoin('evento.registros', 'registro')
            .select([
                'evento.idTipo AS tipoId',
                'evento.year AS year'
            ])
            .addSelect('COUNT(DISTINCT evento.id)', 'total')
            .where('evento.idArea = :areaId', { areaId })
            .addGroupBy('evento.idTipo')
            .addGroupBy('evento.year')
            .orderBy('evento.year', 'DESC')
            .getRawMany<{ year: string, tipoId: number, total: number }>();
        
        const lookup = new Map<string, number>();
        eventsByYearAndType.forEach(item => {
            lookup.set(`${item.year}-${item.tipoId}`, Number(item.total));
        });

        
        const years = [...new Set(eventsByYearAndType.map(item => item.year))];

        let globalTotal = 0;
        const typesAccumulator = allTypes.map(t => ({ ...t, total: 0 }));

        const stats = years.map(year => {
            let yearTotal = 0;

            const eventosPorTipo = allTypes.map((tipo, index) => {
                const cantidad = lookup.get(`${year}-${tipo.id}`) || 0;

                yearTotal+=cantidad;
                typesAccumulator[index].total +=cantidad;
                globalTotal+=cantidad;

                return {
                    nombre: tipo.nombre,
                    total: cantidad
                }
            });

            return {
                year,
                eventos: eventosPorTipo,
                total: yearTotal
            }
        });

        return {
            stats,
            types: typesAccumulator.map(t => ({ nombre: t.nombre, total: t.total })),
            total: globalTotal
        }
    }

    //Extra Final Boss - ReportSeven on Express
    async getAreas(): Promise<DetailedAttendanceByStudentsDto[]>{
        const rawData = await this.areaRepo.createQueryBuilder('a')
            .select([
                'a.id AS id',
                'a.nombre AS area',
                '0 AS groupOne',
                '0 AS groupTwo',
                '0 AS groupThree',
                '0 AS groupFour',
                '0 AS total'
            ])
            .where('a.id_tipo_area = :typeId', { typeId: 1 })
            .orderBy('a.nombre', 'ASC')
            .getRawMany<{ id: number; area: string; groupOne: number; groupTwo: number; groupThree: number; groupFour: number; total: number; }>();

        const formatedData = rawData.map((d) => ({ 
            id: d.id, 
            nombre: d.area, 
            groupOne: Number(d.groupOne), 
            groupTwo: Number(d.groupTwo), 
            groupThree: Number(d.groupThree), 
            groupFour: Number(d.groupFour), 
            total: Number(d.total), 
        }));
        return formatedData;
    }

    async countEventsByStudent(year: number): Promise<CountEventsByStudentDto[]>{
        const rawData = await this.recordRepo.createQueryBuilder('r')
            .select([
                'r.idUsuario AS idUsuario',
                'r.idArea AS idArea',
                'COUNT(*) AS total'
            ])
            .innerJoin('eventos', 'e', 'e.id = r.idEvento')
            .where('r.idRol = :idRol', { idRol: 1 })
            .andWhere('e.year = :year', { year })
            .groupBy('idUsuario')
            .getRawMany<{ idUsuario: number; idArea: number; total: string; }>();   
        const formatedData = rawData.map((r) => ({ idUsuario: r.idUsuario, idArea: r.idArea, total: Number(r.total) }))
        return formatedData;
    }

    async getDetailedAttendanceFromStudents(year: number): Promise<DetailedAttendanceByStudentsDto[]>{
        const [areas, stats] = await Promise.all([
            this.getAreas(),
            this.countEventsByStudent(year)
        ]);

        for(const curr of stats){
            const area = areas.find(a => a.id === curr.idArea)
            if(curr.idArea === area?.id){
                if(curr.total < 4) area.groupOne++
                else if(curr.total < 7) area.groupTwo++
                else if(curr.total < 11) area.groupThree++
                else area.groupFour++
                area.total++
            }
        }

        return areas;
    }
}