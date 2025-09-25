import { UserDto } from "src/modules/user/dto/user.dto";
import { ApiProperty } from '@nestjs/swagger';
import { TokenDto } from './token.dto';

export class LoggedInUserDto {
    @ApiProperty({
        description: 'User information',
        type: UserDto
    })
    user: UserDto;

    @ApiProperty({
        description: 'Authentication tokens',
        type: TokenDto
    })
    tokens: TokenDto;

    constructor(user: UserDto, accessToken: string, refreshToken: string) {
        this.user = user;
        this.tokens = new TokenDto(accessToken, refreshToken);
    }
}