import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { UserDto } from '../user/dto/user.dto';
import { User } from '../user/entities/user.entity';
import { LoggedInUserDto } from './dto/logged-in-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { VerifyPasswordDto } from './dto/verify-password.dto';
import { VerifyPasswordResponseDto } from './dto/verify-password-response.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyEmailResponseDto } from './dto/verify-email-response.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ResendVerificationResponseDto } from './dto/resend-verification-response.dto';
import { GoogleSignupDto } from './dto/google-signup.dto';
import { AppConfig } from 'src/app.config';

@Injectable()
export class AuthService {
  constructor(private usersService: UserService, private jwtService: JwtService) {}

  async register(createUserDto: CreateUserDto): Promise<RegisterResponseDto> {
    const existingUser = await this.usersService.findUserByEmail(createUserDto.email);
    if (existingUser) throw new BadRequestException('User already exists');
    const user = await this.usersService.create(createUserDto);
    // await this.usersService.sendVerificationEmail(user.id);

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);
    return new RegisterResponseDto(user, accessToken, refreshToken);
  }
  
  async login(loginDto: LoginDto): Promise<LoggedInUserDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);
    
    return new LoggedInUserDto(user, accessToken, refreshToken);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: AppConfig().JWT_REFRESH_SECRET
      });

      // Check if user still exists
      const user = await this.usersService.findUserById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user.id);
      const newRefreshToken = this.generateRefreshToken(user.id);

      return new TokenResponseDto(newAccessToken, newRefreshToken);
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
      throw error;
    }
  }

  private generateAccessToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId },
      { 
        secret: AppConfig().JWT_SECRET
      }
    );
  }

  private generateRefreshToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId },
      { 
        secret: AppConfig().JWT_REFRESH_SECRET
      }
    );
  }

  async verifyPassword(verifyPasswordDto: VerifyPasswordDto): Promise<VerifyPasswordResponseDto> {
    const user = await this.usersService.findUserByEmail(verifyPasswordDto.email);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    if (!user['password']) {
      return {
        success: false,
        message: 'User has no password set'
      };
    }

    const isPasswordValid = await bcrypt.compare(verifyPasswordDto.password, user['password']);
    
    if (isPasswordValid) {
      return {
        success: true,
        message: 'Password verified successfully'
      };
    } else {
      return {
        success: false,
        message: 'Invalid password'
      };
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<VerifyEmailResponseDto> {
    try {
      await this.usersService.verifyEmail(verifyEmailDto.email, verifyEmailDto.verificationCode);
      return {
        success: true,
        message: 'Email verified successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  async resendVerificationEmail(resendVerificationDto: ResendVerificationDto): Promise<ResendVerificationResponseDto> {
    try {
      await this.usersService.resendVerificationEmail(resendVerificationDto.email);
      return {
        success: true,
        message: 'Verification email sent successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  async googleSignup(googleSignupDto: GoogleSignupDto): Promise<RegisterResponseDto> {
    // Check if user already exists with this Google ID
    const existingUserByProvider = await this.usersService.findUserByProviderId(googleSignupDto.providerId);
    if (existingUserByProvider) {
      // User exists, generate new tokens
      const accessToken = this.generateAccessToken(existingUserByProvider.id);
      const refreshToken = this.generateRefreshToken(existingUserByProvider.id);
      // Ensure we pass a UserDto to RegisterResponseDto to satisfy type requirements
      const userDto = new UserDto(existingUserByProvider);
      return new RegisterResponseDto(userDto, accessToken, refreshToken);
    }

    // Check if user exists with this email
    const existingUserByEmail = await this.usersService.findUserByEmail(googleSignupDto.email);
    if (existingUserByEmail) {
      throw new BadRequestException('User already exists with this email. Please use regular login.');
    }

    // Create new user with Google provider
    const user = await this.usersService.createGoogleUser(googleSignupDto);
    
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);
    
    return new RegisterResponseDto(user, accessToken, refreshToken);
  }

  private async validateUser(email: string, password: string): Promise<UserDto> {
    const user = await this.usersService.findUserByEmail(email);
    if (user && user['password']) {
      const match = await bcrypt.compare(password, user['password']);
      if (match) {
        const { password, ...result } = user.get({ plain: true });
        return new UserDto(result as User);
      }
    }
    return null;
  }
}
