// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // 1. REGISTER
  async register(email: string, pass: string) {
    // Hash the password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(pass, salt);

    try {
      // Save to User table via UsersService
      const user = await this.userService.create({ 
        email, 
        password: hashedPassword 
      });
      return { message: 'User registered successfully', userId: user.id };
    } catch (error) {
      throw new ConflictException('Email already exists');
    }
  }

  // 2. LOGIN
  async login(email: string, pass: string) {
    const user = await this.userService.findOneByEmail(email);
    
    // Compare plain text password with the hashed one in DB
    const isMatch = user ? await bcrypt.compare(pass, user.password) : false;

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT
    //const payload = { sub: user!.id, email: user!.email };
    const payload = { 
      userId: user!.id, 
      email: user!.email, 
      role: user!.role // <--- Add this
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}