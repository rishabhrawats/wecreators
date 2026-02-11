import { Injectable } from '@nestjs/common';
import { Env, validateEnv } from './env.schema';

@Injectable()
export class EnvService {
  private readonly env: Env;

  constructor() {
    this.env = validateEnv(process.env);
  }

  get<K extends keyof Env>(key: K): Env[K] {
    return this.env[key];
  }

  getAll(): Env {
    return this.env;
  }
}
