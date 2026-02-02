import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class PasswordBreachService {
  private readonly HIBP_API_URL = 'https://api.pwnedpasswords.com/range/';

  async checkPassword(password: string): Promise<void> {
    const sha1Hash = crypto
      .createHash('sha1')
      .update(password)
      .digest('hex')
      .toUpperCase();
    
    const prefix = sha1Hash.substring(0, 5);
    const suffix = sha1Hash.substring(5);

    try {
      const response = await axios.get(`${this.HIBP_API_URL}${prefix}`);
      const hashes = response.data.split('\n');
      
      const found = hashes.find((line: string) => line.startsWith(suffix));
      
      if (found) {
        const count = found.split(':')[1].trim();
        throw new BadRequestException(
          `This password has appeared in ${count} data breaches and is unsafe to use. Please choose a different password.`
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      // If API is down, we might want to log it and skip the check or fail closed depending on policy.
      // Failing open for now to not block users if HIBP is down.
      console.error('HIBP API error:', error.message);
    }
  }
}
