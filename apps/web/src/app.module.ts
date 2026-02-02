import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from '@app/shared';
import { NewsModule } from './news/news.module';
import { MatchesModule } from './matches/matches.module';
import { TicketsModule } from './tickets/tickets.module';
import { PlayersModule } from './players/players.module';
import { ManagementModule } from './management/management.module';
import { SponsorsModule } from './sponsors/sponsors.module';
import { StandingsModule } from './standings/standings.module';
import { ContactModule } from './contact/contact.module';
import { HistoryModule } from './history/history.module';

@Module({
  imports: [
    SharedModule,
    NewsModule,
    MatchesModule,
    TicketsModule,
    PlayersModule,
    ManagementModule,
    SponsorsModule,
    StandingsModule,
    ContactModule,
    HistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
