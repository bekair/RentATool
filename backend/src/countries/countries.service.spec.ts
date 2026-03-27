import { CountriesService } from './countries.service';

describe('CountriesService', () => {
  const baseCountries = [
    { code: 'BE', name: 'Belgium', countryCode: '+32', flag: '🇧🇪' },
    { code: 'FR', name: 'France', countryCode: '+33', flag: '🇫🇷' },
    { code: 'GB', name: 'United Kingdom', countryCode: '+44', flag: '🇬🇧' },
  ];

  const createService = () => {
    const prisma = {
      country: {
        findMany: jest.fn(),
      },
    } as any;

    const service = new CountriesService(prisma);
    return { service, prisma };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes ISO2 country codes from database values', async () => {
    const { service, prisma } = createService();
    prisma.country.findMany.mockResolvedValue(baseCountries);

    await expect(service.normalizeCountryCode('be')).resolves.toBe('BE');
    await expect(service.normalizeCountryCode('FR')).resolves.toBe('FR');
    await expect(service.normalizeCountryCode('ZZ')).resolves.toBeNull();
  });

  it('normalizes country names from database values', async () => {
    const { service, prisma } = createService();
    prisma.country.findMany.mockResolvedValue(baseCountries);

    await expect(service.normalizeCountryCode('Belgium')).resolves.toBe('BE');
    await expect(service.normalizeCountryCode(' france ')).resolves.toBe('FR');
  });

  it('keeps strict DB matching and rejects legacy aliases', async () => {
    const { service, prisma } = createService();
    prisma.country.findMany.mockResolvedValue(baseCountries);

    await expect(service.normalizeCountryCode('UK')).resolves.toBeNull();
    await expect(service.normalizeCountryCode('USA')).resolves.toBeNull();
  });

  it('accepts localized display-name variants for DB country codes', async () => {
    const { service, prisma } = createService();
    prisma.country.findMany.mockResolvedValue(baseCountries);
    jest
      .spyOn(service as any, 'getDisplayNamesForCountryCode')
      .mockImplementation((countryCode: string) =>
        countryCode === 'BE' ? ['Belgie'] : [],
      );

    await expect(service.normalizeCountryCode('België')).resolves.toBe('BE');
  });

  it('deduplicates parallel cache loads to a single DB read', async () => {
    const { service, prisma } = createService();
    prisma.country.findMany.mockImplementation(
      async () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(baseCountries), 15);
        }),
    );

    await Promise.all([
      service.normalizeCountryCode('Belgium'),
      service.normalizeCountryCode('France'),
      service.normalizeCountryCode('be'),
    ]);

    expect(prisma.country.findMany).toHaveBeenCalledTimes(1);
  });

  it('refreshes cache after TTL expiry', async () => {
    const { service, prisma } = createService();
    prisma.country.findMany
      .mockResolvedValueOnce(baseCountries)
      .mockResolvedValueOnce(baseCountries);

    await service.normalizeCountryCode('Belgium');
    (service as any).lookupCache.expiresAt = Date.now() - 1;
    await service.normalizeCountryCode('France');

    expect(prisma.country.findMany).toHaveBeenCalledTimes(2);
  });

  it('refreshes cache immediately when refreshCache is called', async () => {
    const { service, prisma } = createService();
    prisma.country.findMany
      .mockResolvedValueOnce([{ code: 'BE', name: 'Belgium' }])
      .mockResolvedValueOnce([
        { code: 'BE', name: 'Belgium' },
        { code: 'NL', name: 'Netherlands' },
      ]);

    await expect(
      service.normalizeCountryCode('Netherlands'),
    ).resolves.toBeNull();
    await service.refreshCache();
    await expect(service.normalizeCountryCode('Netherlands')).resolves.toBe(
      'NL',
    );
  });
});
