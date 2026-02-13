import { OnModuleInit } from '@nestjs/common';
import { Dato } from './entities/dato.entity';
import { CreateDatoDto } from './dto/create-dato.dto';
import { UpdateDatoDto } from './dto/update-dato.dto';
export declare class DatosService implements OnModuleInit {
    private pool;
    private logger;
    private fallback;
    private nextId;
    onModuleInit(): Promise<void>;
    private query;
    create(createDatoDto: CreateDatoDto): Promise<Dato>;
    findAll(): Promise<Dato[]>;
    findOne(id: number): Promise<Dato>;
    update(id: number, updateDatoDto: UpdateDatoDto): Promise<Dato>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
