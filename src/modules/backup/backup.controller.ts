import { Controller, Get, Res } from '@nestjs/common';
import { type Response } from 'express';
import { BackupService } from './backup.service';

@Controller('backup')
export class BackupController {
    constructor(
        private readonly backupService: BackupService
    ){}

    @Get('download')
    async download(@Res() res: Response){
        const { stream, filename } = await this.backupService.createBackup();

        res.setHeader('Content-Type', 'application/gzip');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${filename}"`
        )

        stream.on('error', (error) => {
            console.error('Error generando backup', error);

            if(!res.headersSent){
                res.status(500).json({ message: 'No se pudo generar el respaldo.' })
            }else{
                res.destroy(error);
            }
        })

        stream.pipe(res);
    }
}
