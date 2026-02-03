import { Global, Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { PrismaModule } from './prisma/prisma.module';
import { HashingService } from './security/services/hashing.service';
import { TokenService } from './security/services/token.service';
import { CaslAbilityFactory } from './casl/casl-ability.factory';
import { MfaService } from './security/services/mfa.service';
import { MailService } from './services/mail.service';
import { PasswordBreachService } from './security/services/password-breach.service';
import { RateLimiterService } from './security/services/rate-limiter.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    SharedService,
    HashingService,
    TokenService,
    CaslAbilityFactory,
    MfaService,
    CaslAbilityFactory,
    MfaService,
    PasswordBreachService,
    RateLimiterService,
    MailService,
  ],
  exports: [
    SharedService,
    PrismaModule,
    HashingService,
    TokenService,
    CaslAbilityFactory,
    MfaService,
    PasswordBreachService,
    RateLimiterService,
    MailService,
  ],
})
export class SharedModule {}
