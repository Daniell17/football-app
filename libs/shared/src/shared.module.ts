import { Global, Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { PrismaModule } from './prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [SharedService],
  exports: [SharedService, PrismaModule],
})
export class SharedModule {}
