import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Throttle } from '@nestjs/throttler';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { LoggedInUserDto } from './dto/logged-in-user.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { VerifyPasswordDto } from './dto/verify-password.dto';
import { VerifyPasswordResponseDto } from './dto/verify-password-response.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyEmailResponseDto } from './dto/verify-email-response.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ResendVerificationResponseDto } from './dto/resend-verification-response.dto';
import { GoogleSignupDto } from './dto/google-signup.dto';

@ApiTags('Auth')
@Controller('auth')
@Throttle({default: { limit: 5, ttl: 60000 }})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Create a new user account and receive authentication tokens'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully',
    type: RegisterResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'User already exists or validation error' 
  })
  register(@Body() createUserDto: CreateUserDto): Promise<RegisterResponseDto> {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @ApiOperation({ 
    summary: 'Login a user',
    description: 'Authenticate user credentials and receive authentication tokens'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    type: LoggedInUserDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation error' 
  })
  async login(@Body() loginDto: LoginDto): Promise<LoggedInUserDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ 
    summary: 'Refresh access token',
    description: 'Get new access and refresh tokens using a valid refresh token'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully',
    type: TokenResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid or expired refresh token' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation error' 
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('verify-password')
  @ApiOperation({ 
    summary: 'Verify user password',
    description: 'Check if the provided password matches the user\'s stored password'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password verification completed',
    type: VerifyPasswordResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation error' 
  })
  async verifyPassword(@Body() verifyPasswordDto: VerifyPasswordDto): Promise<VerifyPasswordResponseDto> {
    return this.authService.verifyPassword(verifyPasswordDto);
  }

  @Post('verify-email')
  @ApiOperation({ 
    summary: 'Verify user email with OTP',
    description: 'Verify user email address using the 6-digit verification code sent to their email'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Email verification completed',
    type: VerifyEmailResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation error or invalid/expired code' 
  })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<VerifyEmailResponseDto> {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('resend-verification')
  @ApiOperation({ 
    summary: 'Resend verification email',
    description: 'Resend verification email with new OTP code to user email address'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Verification email sent successfully',
    type: ResendVerificationResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation error or email already verified' 
  })
  async resendVerificationEmail(@Body() resendVerificationDto: ResendVerificationDto): Promise<ResendVerificationResponseDto> {
    return this.authService.resendVerificationEmail(resendVerificationDto);
  }

  @Post('google-signup')
  @ApiOperation({ 
    summary: 'Sign up with Google',
    description: 'Create a new user account using Google OAuth data from frontend'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User created successfully with Google provider',
    type: RegisterResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation error or user already exists' 
  })
  async googleSignup(@Body() googleSignupDto: GoogleSignupDto): Promise<RegisterResponseDto> {
    return this.authService.googleSignup(googleSignupDto);
  }
}
