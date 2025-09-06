import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.auth.signup(dto.email, dto.password, dto.userType);
  }

  @Post('signin')
  signin(@Body() dto: SigninDto) {
    return this.auth.signin(dto.email, dto.password);
  }

  @Post('signout')
  signout() {
    // Stateless JWT: client should discard token. Endpoint provided for symmetry.
    return { success: true };
  }
}
