import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createHash } from 'crypto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' },
    });
  }

  findSubcategories(parentId: string) {
    return this.prisma.category.findMany({
      where: { parentId },
      orderBy: { name: 'asc' },
    });
  }

  async getEtag(): Promise<string> {
    const categories = await this.findAll();
    return createHash('md5').update(JSON.stringify(categories)).digest('hex');
  }
}
