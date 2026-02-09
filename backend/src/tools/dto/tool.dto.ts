import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateToolDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsNumber()
    pricePerDay: number;

    @IsOptional()
    @IsNumber()
    latitude?: number;

    @IsOptional()
    @IsNumber()
    longitude?: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];
}

export class UpdateToolDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsNumber()
    pricePerDay?: number;

    @IsOptional()
    @IsBoolean()
    isAvailable?: boolean;

    @IsOptional()
    @IsNumber()
    latitude?: number;

    @IsOptional()
    @IsNumber()
    longitude?: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];
}
