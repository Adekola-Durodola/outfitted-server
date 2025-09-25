import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class LoginDto {
    @IsEmail()
    @ApiProperty({
        description: 'The email of the user',
        example: 'test@example.com',
    })
    email: string;

    @IsString()
    @ApiProperty({
        description: 'The password of the user',
        example: 'password',
    })
    password: string;
}