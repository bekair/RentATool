import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
    IsOptional,
} from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    @IsNotEmpty()
    displayName: string;

    @IsOptional()
    @IsString()
    city?: string;
}

export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
