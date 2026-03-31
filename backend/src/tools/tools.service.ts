import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateToolDto, UpdateToolDto } from './dto/tool.dto';
import { Tool } from '@prisma/client';
import { CountriesService } from '../countries/countries.service';

@Injectable()
export class ToolsService {
  constructor(
    private prisma: PrismaService,
    private countriesService: CountriesService,
  ) {}

  async create(ownerId: string, createToolDto: CreateToolDto): Promise<any> {
    const {
      name,
      description,
      categoryId,
      pricePerDay,
      replacementValue,
      condition,
      latitude,
      longitude,
      images,
      label,
      street,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      ...toolData
    } = createToolDto;

    const normalizedCountry =
      await this.countriesService.normalizeCountryCode(country);
    if (!normalizedCountry) {
      throw new BadRequestException(
        'Tool country is required before listing your tool.',
      );
    }

    const currency = this.currencyForCountry(normalizedCountry);
    if (!currency) {
      throw new BadRequestException(
        `No supported currency mapping found for country: ${normalizedCountry}.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Create the parent Tool
      const tool = await tx.tool.create({
        data: {
          ...toolData,
          ownerId,
        },
      });

      // Create the first version
      const version = await tx.toolVersion.create({
        data: {
          toolId: tool.id,
          name,
          description,
          categoryId,
          pricePerDay,
          replacementValue,
          condition,
          currency,
          latitude,
          longitude,
          images: images || [],
        },
      });

      await tx.toolAddress.create({
        data: {
          toolVersionId: version.id,
          label: label || null,
          street: street || null,
          addressLine2: addressLine2 || null,
          city: city || null,
          state: state || null,
          postalCode: postalCode || null,
          country: normalizedCountry,
          latitude: latitude ?? null,
          longitude: longitude ?? null,
        },
      });

      // Link the parent tool to this active version
      return tx.tool.update({
        where: { id: tool.id },
        data: { activeVersionId: version.id },
        include: {
          activeVersion: {
            include: {
              category: true,
              address: true,
            },
          },
        },
      });
    });
  }

  async findAll(excludeOwnerId?: string): Promise<any[]> {
    const tools = await this.prisma.tool.findMany({
      where: {
        isAvailable: true,
        ...(excludeOwnerId ? { ownerId: { not: excludeOwnerId } } : {}),
      },
      include: {
        owner: {
          select: {
            id: true,
            createdAt: true,
            profile: { select: { displayName: true } },
            verificationTier: true,
          },
        },
        activeVersion: {
          include: {
            category: true,
            address: true,
          },
        },
      },
    });

    // Flatten for frontend compatibility
    return tools.map((t) => ({
      ...t,
      ...((t as any).activeVersion || {}),
      id: t.id, // Preserve master tool ID
      owner: t.owner
        ? { ...t.owner, displayName: (t.owner as any).profile?.displayName }
        : null,
    }));
  }

  async findOne(id: string): Promise<any> {
    const tool = await this.prisma.tool.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            createdAt: true,
            profile: { select: { displayName: true } },
            verificationTier: true,
          },
        },
        activeVersion: {
          include: {
            category: true,
            address: true,
          },
        },
        blocks: true,
      },
    });

    if (!tool) {
      throw new NotFoundException(`Tool with ID ${id} not found`);
    }

    return {
      ...tool,
      ...((tool as any).activeVersion || {}),
      id: tool.id, // Preserve master tool ID
      owner: tool.owner
        ? {
            ...tool.owner,
            displayName: (tool.owner as any).profile?.displayName,
          }
        : null,
    };
  }

  async findByOwner(ownerId: string): Promise<any[]> {
    const tools = await this.prisma.tool.findMany({
      where: { ownerId },
      include: {
        activeVersion: {
          include: {
            category: true,
            address: true,
          },
        },
        blocks: true,
      },
    });

    // Flatten for frontend compatibility
    return tools.map((t) => ({
      ...t,
      ...((t as any).activeVersion || {}),
      id: t.id, // Preserve master tool ID
    }));
  }

  async update(
    id: string,
    ownerId: string,
    updateToolDto: UpdateToolDto,
  ): Promise<any> {
    const tool = await this.findOne(id);
    if (tool.ownerId !== ownerId) {
      throw new NotFoundException(
        'You do not have permission to update this tool',
      );
    }

    // Isolate the availability flag (only field that updates parent)
    const { isAvailable, ...versionData } = updateToolDto;
    const hasVersionChanges = Object.keys(versionData).length > 0;

    let nextCountry: string | null = null;
    let nextCurrency: string | null = null;
    if (hasVersionChanges) {
      const currentAddress = tool.address || {};
      nextCountry =
        (await this.countriesService.normalizeCountryCode(
          versionData.country,
        )) ||
        (await this.countriesService.normalizeCountryCode(
          currentAddress.country,
        ));

      if (!nextCountry) {
        throw new BadRequestException(
          'Tool country is required before updating this listing.',
        );
      }

      nextCurrency = this.currencyForCountry(nextCountry);
      if (!nextCurrency) {
        throw new BadRequestException(
          `No supported currency mapping found for country: ${nextCountry}.`,
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. If availability changed, update parent tool
      if (isAvailable !== undefined) {
        await tx.tool.update({
          where: { id },
          data: { isAvailable },
        });
      }

      // 2. Map existing active version data, overridden by the incoming changes
      if (hasVersionChanges) {
        const currentAddress = tool.address || {};

        const newVersion = await tx.toolVersion.create({
          data: {
            toolId: id,
            name: versionData.name ?? tool.name,
            description: versionData.description ?? tool.description,
            categoryId: versionData.categoryId ?? tool.categoryId,
            pricePerDay: versionData.pricePerDay ?? tool.pricePerDay,
            replacementValue:
              versionData.replacementValue ?? tool.replacementValue,
            condition: versionData.condition ?? tool.condition,
            currency: nextCurrency!,
            latitude: versionData.latitude ?? tool.latitude,
            longitude: versionData.longitude ?? tool.longitude,
            images: versionData.images ?? tool.images,
          },
        });

        await tx.toolAddress.create({
          data: {
            toolVersionId: newVersion.id,
            label: versionData.label ?? currentAddress.label ?? null,
            street: versionData.street ?? currentAddress.street ?? null,
            addressLine2:
              versionData.addressLine2 ?? currentAddress.addressLine2 ?? null,
            city: versionData.city ?? currentAddress.city ?? null,
            state: versionData.state ?? currentAddress.state ?? null,
            postalCode:
              versionData.postalCode ?? currentAddress.postalCode ?? null,
            country: nextCountry!,
            latitude: versionData.latitude ?? tool.latitude ?? null,
            longitude: versionData.longitude ?? tool.longitude ?? null,
          },
        });

        // 3. Move the pointer to the newly created version
        await tx.tool.update({
          where: { id },
          data: { activeVersionId: newVersion.id },
        });
      }

      return this.findOne(id);
    });
  }

  async remove(id: string, ownerId: string): Promise<Tool> {
    const tool = await this.findOne(id);
    if (tool.ownerId !== ownerId) {
      throw new NotFoundException(
        'You do not have permission to delete this tool',
      );
    }

    return this.prisma.tool.delete({
      where: { id },
    });
  }

  async getAvailability(id: string) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const tool = await this.prisma.tool.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: { in: ['PENDING', 'APPROVED'] },
            endDate: { gte: today },
          },
          select: {
            startDate: true,
            endDate: true,
          },
        },
        blocks: {
          where: {
            date: { gte: today },
          },
          select: {
            date: true,
          },
        },
      },
    });

    if (!tool) {
      throw new NotFoundException(`Tool with ID ${id} not found`);
    }

    const bookedDates: string[] = [];
    tool.bookings.forEach((booking) => {
      const curr = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      while (curr <= end) {
        // Format to YYYY-MM-DD
        bookedDates.push(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
      }
    });

    const manualBlockedDates = tool.blocks.map(
      (b) => b.date.toISOString().split('T')[0],
    );

    // Deduplicate arrays
    return {
      bookedDates: [...new Set(bookedDates)],
      manualBlockedDates: [...new Set(manualBlockedDates)],
    };
  }

  async updateAvailability(
    id: string,
    ownerId: string,
    manualBlockedDates: string[],
  ) {
    const tool = await this.findOne(id);
    if (tool.ownerId !== ownerId) {
      throw new NotFoundException(
        'You do not have permission to update this tool',
      );
    }

    const todayDate = new Date();
    todayDate.setUTCHours(0, 0, 0, 0);
    const todayString = todayDate.toISOString().split('T')[0];

    // 1. Past dates restriction
    const hasPastDates = manualBlockedDates.some((date) => date < todayString);
    if (hasPastDates) {
      throw new BadRequestException('Cannot block dates in the past');
    }

    // 2. Active bookings restriction
    const activeBookings = await this.prisma.booking.findMany({
      where: {
        toolId: id,
        status: { in: ['PENDING', 'APPROVED'] },
        endDate: { gte: todayDate },
      },
    });

    const bookedDates = new Set<string>();
    activeBookings.forEach((booking) => {
      const curr = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      while (curr <= end) {
        bookedDates.add(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
      }
    });

    const conflicts = manualBlockedDates.filter((date) =>
      bookedDates.has(date),
    );
    if (conflicts.length > 0) {
      throw new BadRequestException(
        `Cannot block dates that have pending or approved requests: ${conflicts.join(', ')}`,
      );
    }

    // 3. Apply changes (only affecting future dates)
    await this.prisma.$transaction([
      this.prisma.toolDateBlock.deleteMany({
        where: {
          toolId: id,
          date: { gte: todayDate },
        },
      }),
      ...manualBlockedDates.map((dateString) =>
        this.prisma.toolDateBlock.create({
          data: {
            toolId: id,
            date: new Date(`${dateString}T00:00:00Z`),
          },
        }),
      ),
    ]);

    return this.getAvailability(id);
  }

  async cleanupPastDateBlocks(): Promise<{
    deletedCount: number;
    cutoff: string;
  }> {
    const todayUtc = new Date();
    todayUtc.setUTCHours(0, 0, 0, 0);

    const deleted = await this.prisma.toolDateBlock.deleteMany({
      where: {
        date: {
          lt: todayUtc,
        },
      },
    });

    return {
      deletedCount: deleted.count,
      cutoff: todayUtc.toISOString().slice(0, 10),
    };
  }

  private currencyForCountry(countryCode: string): string | null {
    const byCountry: Record<string, string> = {
      BE: 'eur',
      NL: 'eur',
      LU: 'eur',
      FR: 'eur',
      DE: 'eur',
      ES: 'eur',
      IT: 'eur',
      PT: 'eur',
      AT: 'eur',
      IE: 'eur',
      GB: 'gbp',
      US: 'usd',
      CA: 'cad',
      JP: 'jpy',
      CH: 'chf',
    };

    return byCountry[countryCode] || null;
  }
}
