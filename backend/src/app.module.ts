import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ToolsModule } from './tools/tools.module';
import { BookingsModule } from './bookings/bookings.module';
import { CategoriesModule } from './categories/categories.module';
import { CountriesModule } from './countries/countries.module';
import { PaymentsModule } from './payments/payments.module';

function validateEnv(config: Record<string, unknown>) {
  const requiredEnvVars = [
    'PORT',
    'PUBLIC_BACKEND_URL',
    'DATABASE_URL',
    'JWT_SECRET',
    'STRIPE_SECRET_KEY',
  ];

  for (const key of requiredEnvVars) {
    const value = config[key];
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return config;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    AuthModule,
    UsersModule,
    PrismaModule,
    ToolsModule,
    BookingsModule,
    CategoriesModule,
    CountriesModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
