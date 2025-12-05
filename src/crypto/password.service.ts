import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordService {
  public async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, //64 MB
      timeCost: 3,
      parallelism: 1,
    });
  }

  public async verify(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }
}
