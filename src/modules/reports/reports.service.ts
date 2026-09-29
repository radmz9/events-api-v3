import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as hbs from 'handlebars';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { UserWithEventsDto } from '../users/dto/responses/user-events.dto';
import { CompleteEventReportResDto } from '../records/dto/responses/complete-event-report.dto';
import * as QRCode from 'qrcode';
import { EventResDto } from '../events/dto/responses/event-res.dto';


@Injectable()
export class ReportsService implements OnModuleInit, OnModuleDestroy {
    private browser!: puppeteer.Browser

    async onModuleInit(): Promise<void> {
        this.browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox', 
                '--disable-dev-shm-usage',
                '--disable-network-throttling',
                '--no-network-profile'
            ],
        })
    }

    private async getPartialFiles(): Promise<void>{
        const partialDir = path.join(process.cwd(), 'src/modules/reports/templates/partials');

        if(fs.existsSync(partialDir)){
            const partialFiles = await fs.readdir(partialDir);
            for(const file of partialFiles){
                if(file.endsWith('.hbs')){
                    const partialName = path.parse(file).name;
                    const partialContent = await fs.readFile(path.join(partialDir, file), 'utf-8');
                    hbs.registerPartial(partialName, partialContent);
                }
            }
        }
    }

    async generateEventAttendancePDF(data: CompleteEventReportResDto): Promise<Buffer> {
        const page = await this.browser.newPage();
        try{
            await this.getPartialFiles();

            const templatePath = path.join(process.cwd(), 'src/modules/reports/templates/event-attendance.hbs');

            const templateHtml = await fs.readFile(templatePath, 'utf-8');

            const compile = hbs.compile(templateHtml);

            const leftLogo = this.getLogoBase64('logoCunorte.png');
            const rightLogo = this.getLogoBase64('logoUdg.jpg');

            const fonts = this.getFontsBase64();

            const finalHtml = compile({
                leftLogo,
                rightLogo,
                fonts: fonts,
                event: data.event,
                internals: data.data.internals,
                externals: data.data.externals,
                stats: data.stats.byRole,
                total: data.stats.total
            })

            await page.setContent(finalHtml, { waitUntil: 'domcontentloaded' });
            const pdf = await page.pdf({
                format: 'A4',
                landscape: true,
                printBackground: true,
                margin: { top: '50px', bottom: '50px', left: '40px', right: '40px' },
            });

            return Buffer.from(pdf);
        }finally{
            await page.close()
        }
    }

    async generateUserReportEvents(data: UserWithEventsDto): Promise<Buffer>{
        const page = await this.browser.newPage();
        try {
            await this.getPartialFiles();

            const templatePath = path.join(process.cwd(), 'src/modules/reports/templates/user-events-report.hbs');
            const templateHtml = await fs.readFile(templatePath, 'utf-8');
            const compile = hbs.compile(templateHtml);

            const leftLogo = this.getLogoBase64('logoCunorte.png');
            const rightLogo = this.getLogoBase64('logoUdg.jpg');

            const fonts = this.getFontsBase64();

            const finalHtml = compile({
                leftLogo,
                rightLogo,
                fonts,
                data
            });

            await page.setContent(finalHtml, { waitUntil: 'networkidle0' });
            const pdf = await page.pdf({
                format: 'A4',
                landscape: true,
                printBackground: true,
                margin: { top: '50px', bottom: '50px', left: '40px', right: '40px' },
            });
            return Buffer.from(pdf);
        } finally{
            await page.close()
        }
    }

    private async generateQr(url: string): Promise<string>{
        const qrCode = QRCode as unknown as {
            toDataURL: (text: string, options: Record<string, unknown>) => Promise<string>;
        };

        return await qrCode.toDataURL(url, {
            type: 'image/png',
            width: 400,
            margin: 1,
            errorCorrectionLevel: 'H'
        });
    }

    private transformString(str: string){
        return str.toLowerCase().split(' ').map(s => s.length > 2 ? s.charAt(0).toUpperCase()+s.slice(1) : s).join(' ');
    }

    async generateQREventPDF(event: EventResDto): Promise<Buffer>{
        const page = await this.browser.newPage();
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC'
        };
        const formatedDate = new Date(event.fecha).toLocaleDateString('es-MX', options);

        const data = {
            ...event,
            fecha: formatedDate,
            tipo: this.transformString(event.tipo),
            encargado: this.transformString(event.encargado),
            responsable: this.transformString(event.responsable)
        }
        try {
            await this.getPartialFiles();
            const fakeURL = `http://localhost:5173/home/registros/${event.id}`;
            const qrCode = await this.generateQr(fakeURL)

            const templatePath = path.join(process.cwd(), 'src/modules/reports/templates/event-qr.hbs');

            const templateHtml = await fs.readFile(templatePath, 'utf-8');

            const compile = hbs.compile(templateHtml);

            const leftLogo = this.getLogoBase64('logoCunorte.png');
            const rightLogo = this.getLogoBase64('logoUdg.jpg');

            const fonts = this.getFontsBase64();

            const finalHtml = compile({
                leftLogo,
                rightLogo,
                fonts,
                qrCode,
                data
            });

            await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

            const pdf = await page.pdf({
                format: 'A4',
                landscape: false,
                printBackground: true,
                margin: { top: '50px', bottom: '50px', left: '40px', right: '40px' },
            });

            return Buffer.from(pdf);
        } finally {
            await page.close();
        }
    }

    private getFontsBase64(){
        const fontsPath = path.join(process.cwd(), 'src/modules/reports/assets/fonts/');

        const toBase64 = (fileName: string) => {
            const buffer = fs.readFileSync(path.join(fontsPath, fileName));
            return buffer.toString('base64');
        };

        return {
            regular: toBase64('Roboto-Regular.ttf'),
            bold: toBase64('Roboto-Bold.ttf'),
            light: toBase64('Roboto-Light.ttf'),
            medium: toBase64('Roboto-Medium.ttf')
        };
    }

    private getLogoBase64(fileName: string): string{
        try {
            const filePath = path.join(process.cwd(), 'src/modules/reports/assets/images/', fileName);
            const bitmap = fs.readFileSync(filePath);
            const extension = path.extname(fileName).replace('.', '');
            const base64 = bitmap.toString('base64');
            return `data:image/${extension};base64,${base64}`;
        } catch (error) {
            console.log(`Error cargando el logo ${fileName}`, error);
            return '';
        }
    }

    async onModuleDestroy(): Promise<void> {
        if(this.browser) await this.browser.close();
    }
}
