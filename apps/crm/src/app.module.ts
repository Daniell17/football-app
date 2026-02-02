import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SharedModule } from '@app/shared';

import { NewsModule } from './news/news.module';
import { MatchesModule } from './matches/matches.module';
import { PlayersModule } from './players/players.module';
import { ManagementModule } from './management/management.module';
import { SponsorsModule } from './sponsors/sponsors.module';
import { StandingsModule } from './standings/standings.module';
import { ContactModule } from './contact/contact.module';
import { HistoryModule } from './history/history.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { AuditLogInterceptor, SessionGuard } from '@app/shared';

@Module({
  imports: [
    SharedModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1d' },
      global: true,
    }),
    NewsModule,
    MatchesModule,
    PlayersModule,
    ManagementModule,
    SponsorsModule,
    StandingsModule,
    ContactModule,
    HistoryModule,
    UsersModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: SessionGuard,
    },
  ],
})
export class AppModule {}
