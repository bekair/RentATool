import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    findAll() {
        return this.prisma.category.findMany({
            where: { parentId: null }, // top-level only; subcategories via children[]
            orderBy: { name: 'asc' },
        });
    }

    findSubcategories(parentId: string) {
        return this.prisma.category.findMany({
            where: { parentId },
            orderBy: { name: 'asc' },
        });
    }
}
