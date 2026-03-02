import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createHash } from 'crypto';

@Injectable()
export class CountriesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.country.findMany({
            orderBy: { name: 'asc' },
            select: { code: true, name: true, countryCode: true, flag: true },
        });
    }

    async getEtag(): Promise<string> {
        // Lightweight fingerprint: count + last-modified equivalent
        // Using a hash of all codes+names is stable and cheap
        const countries = await this.findAll();
        return createHash('md5').update(JSON.stringify(countries)).digest('hex');
    }
}
