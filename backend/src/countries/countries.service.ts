import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createHash } from 'crypto';

const COUNTRY_LOOKUP_TTL_MS = 24 * 60 * 60 * 1000;
const COUNTRY_NAME_LOCALES = ['en', 'nl', 'fr', 'de'];

type CountryLookupCache = {
  byCode: Map<string, string>;
  byName: Map<string, string>;
  expiresAt: number;
};

@Injectable()
export class CountriesService {
  private lookupCache: CountryLookupCache | null = null;
  private lookupLoadPromise: Promise<void> | null = null;

  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.country.findMany({
      orderBy: { name: 'asc' },
      select: { code: true, name: true, countryCode: true, flag: true },
    });
  }

  async normalizeCountryCode(
    raw: string | null | undefined,
  ): Promise<string | null> {
    if (!raw || typeof raw !== 'string') {
      return null;
    }

    const normalized = this.normalizeLookupKey(raw);
    if (!normalized) {
      return null;
    }

    await this.ensureLookupCacheLoaded();
    const cache = this.lookupCache;
    if (!cache) {
      return null;
    }

    if (/^[A-Z]{2}$/.test(normalized)) {
      return cache.byCode.get(normalized) || null;
    }

    return cache.byName.get(normalized) || null;
  }

  async refreshCache(): Promise<void> {
    await this.ensureLookupCacheLoaded(true);
  }

  async getEtag(): Promise<string> {
    // Lightweight fingerprint: count + last-modified equivalent
    // Using a hash of all codes+names is stable and cheap
    const countries = await this.findAll();
    return createHash('md5').update(JSON.stringify(countries)).digest('hex');
  }

  private async ensureLookupCacheLoaded(force = false): Promise<void> {
    const hasFreshCache =
      !force &&
      this.lookupCache &&
      Number.isFinite(this.lookupCache.expiresAt) &&
      this.lookupCache.expiresAt > Date.now();

    if (hasFreshCache) {
      return;
    }

    if (this.lookupLoadPromise) {
      return this.lookupLoadPromise;
    }

    this.lookupLoadPromise = (async () => {
      const countries = await this.findAll();
      const byCode = new Map<string, string>();
      const byName = new Map<string, string>();

      for (const country of countries) {
        const codeKey = this.normalizeLookupKey(country.code);

        if (codeKey) {
          byCode.set(codeKey, country.code.toUpperCase());
        }

        const candidateNames = [
          country.name,
          ...this.getDisplayNamesForCountryCode(country.code),
        ];

        for (const candidateName of candidateNames) {
          const nameKey = this.normalizeLookupKey(candidateName);
          if (!nameKey) {
            continue;
          }

          if (!byName.has(nameKey)) {
            byName.set(nameKey, country.code.toUpperCase());
          }
        }
      }

      this.lookupCache = {
        byCode,
        byName,
        expiresAt: Date.now() + COUNTRY_LOOKUP_TTL_MS,
      };
    })();

    try {
      await this.lookupLoadPromise;
    } finally {
      this.lookupLoadPromise = null;
    }
  }

  private normalizeLookupKey(value: string): string {
    const normalized = value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    return normalized
      .replace(/[^\p{L}\p{N} ]+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase();
  }

  private getDisplayNamesForCountryCode(countryCode: string): string[] {
    const DisplayNamesCtor = (Intl as any)?.DisplayNames;
    if (typeof DisplayNamesCtor !== 'function') {
      return [];
    }

    const supportedLocales =
      typeof DisplayNamesCtor.supportedLocalesOf === 'function'
        ? DisplayNamesCtor.supportedLocalesOf(COUNTRY_NAME_LOCALES)
        : COUNTRY_NAME_LOCALES;

    const result: string[] = [];
    for (const locale of supportedLocales) {
      try {
        const displayNames = new DisplayNamesCtor([locale], { type: 'region' });
        const displayName = displayNames.of(countryCode.toUpperCase());

        if (typeof displayName === 'string' && displayName.trim()) {
          result.push(displayName);
        }
      } catch {
        // Skip locale-specific failures and keep loading other locales.
      }
    }

    return result;
  }
}
