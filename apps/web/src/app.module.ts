import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from '@app/shared';
import { NewsModule } from './news/news.module';
import { MatchesModule } from './matches/matches.module';
import { ManagementModule } from './management/management.module';
import { ContactModule } from './contact/contact.module';
import { HistoryModule } from './history/history.module';
import { AuthModule } from './auth/auth.module';
import { TicketsModule } from './tickets/tickets.module';
import { JwtModule } from '@nestjs/jwt';

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
    ManagementModule,
    ContactModule,
    HistoryModule,
    AuthModule,
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
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
