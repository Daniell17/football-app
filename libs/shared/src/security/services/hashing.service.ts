import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class HashingService {
  async hash(data: string): Promise<string> {
    return argon2.hash(data, {
      type: argon2.argon2id,
    });
  }

  async compare(data: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, data);
  }
}
