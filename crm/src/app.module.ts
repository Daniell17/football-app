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
})
export class AppModule {}
