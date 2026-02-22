import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsBoolean, IsUUID } from 'class-validator';

export class CreateToolDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsUUID()
    @IsNotEmpty()
    categoryId: string;

    @IsNumber()
    pricePerDay: number;

    @IsOptional()
    @IsNumber()
    replacementValue?: number;

    @IsOptional()
    @IsString()
    condition?: string;

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
    @IsUUID()
    categoryId?: string;

    @IsOptional()
    @IsNumber()
    pricePerDay?: number;

    @IsOptional()
    @IsBoolean()
    isAvailable?: boolean;

    @IsOptional()
    @IsNumber()
    replacementValue?: number;

    @IsOptional()
    @IsString()
    condition?: string;

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
