import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { SeedModule } from './seed/seed.module';
import { StorageModule } from './storage/storage.module';
import { MaterialsModule } from './materials/materials.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { TariffsModule } from './tariffs/tariffs.module';
import { TicketsModule } from './tickets/tickets.module';
import { PaymentsModule } from './payments/payments.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'mindbodyhub'),
        password: config.get<string>('DB_PASSWORD', 'devpassword'),
        database: config.get<string>('DB_NAME', 'mindbodyhub'),
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    HealthModule,
    StorageModule,
    UsersModule,
    TariffsModule,
    MaterialsModule,
    KnowledgeModule,
    TicketsModule,
    PaymentsModule,
    AuthModule,
    SeedModule,
  ],
})
export class AppModule {}
