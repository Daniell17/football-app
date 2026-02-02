import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from '@app/shared';
import { NewsModule } from './news/news.module';
import { MatchesModule } from './matches/matches.module';
import { ManagementModule } from './management/management.module';
import { ContactModule } from './contact/contact.module';
import { HistoryModule } from './history/history.module';

@Module({
  imports: [
    SharedModule,
    NewsModule,
    MatchesModule,
    ManagementModule,
    ContactModule,
    HistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
