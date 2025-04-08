/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.findUser(email);
    if (!user || !user.password) {
      return null;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    const { password: _, ...result } = user;
    return result;
  }

  login(user: Omit<User, 'password'>): { access_token: string } {
    const payload = { email: user.email, sub: user.userId };
    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }

  private async findUser(email: string): Promise<User | null> {
    // TODO: Implement your user lookup logic here
    // This is just a placeholder implementation
    if (email === 'test@example.com') {
      return {
        userId: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('test123', 10),
      };
    }
    return null;
  }
}
