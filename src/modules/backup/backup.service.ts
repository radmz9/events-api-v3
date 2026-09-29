import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';
import { Readable } from 'stream';
import { pipeline } from "stream/promises";
import { promises as fs } from "fs";
import { createGzip } from 'zlib';

interface BackupResult {
    stream: Readable;
    filename: string;
}

@Injectable()
export class BackupService {
    constructor(
        private readonly configService: ConfigService
    ){}

    async createBackup(): Promise<BackupResult>{
        const credentialsFile = await this.createCredentialsFile();

        const database = this.configService.getOrThrow<string>('DB_NAME');

        const filename = `backup-${this.getTimestamp()}.sql.gz`;

        const dumpProcess = spawn('mysqldump', [
            `--defaults-extra-file=${credentialsFile}`,
            '--single-transaction',
            '--quick',
            '--routines',
            '--triggers',
            '--events',
            database
        ]);

        const gzip = createGzip({ level: 6 })

        let errorOutput = '';

        dumpProcess.stderr.on('data', (chunk: Buffer) => {
            errorOutput += chunk.toString()
        });

        dumpProcess.on('error', (error) => {
            gzip.destroy(error);
        });

        dumpProcess.on('close', (code) => {
            if (code !== 0) {
                const error = new Error(
                errorOutput.trim() ||
                    `mysqldump terminó con código ${code}`,
                );

                gzip.destroy(error);
            }
            void fs.unlink(credentialsFile).catch(() => {}); 
        });
        
        pipeline(dumpProcess.stdout, gzip).catch((error: Error) => {
            gzip.destroy(error);
        })

        return {
            stream: gzip, //process.stdout,
            filename,
        }
    }

    private async createCredentialsFile(): Promise<string>{
        const filePath = join(
            tmpdir(),
            `mysql-backup-${Date.now()}.cnf`
        );

        const content = [
            '[client]',
            `host=${this.configService.getOrThrow<string>('DB_HOST')}`,
            `port=${this.configService.get<string>('DB_PORT', '3306')}`,
            `user=${this.configService.getOrThrow<string>('DB_USER')}`,
            `password=${this.configService.getOrThrow<string>('DB_PASS')}`,
        ].join('\n');

        await fs.writeFile(filePath, content, {
            encoding: 'utf8',
            mode: 0o600,
        });

        return filePath;
    }

    private getTimestamp(): string {
        return new Date()
            .toISOString()
            .replace(/[:.]/g, '-');
    }
}
