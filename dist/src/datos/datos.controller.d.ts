import { DatosService } from './datos.service';
import { CreateDatoDto } from './dto/create-dato.dto';
import { UpdateDatoDto } from './dto/update-dato.dto';
export declare class DatosController {
    private readonly datosService;
    constructor(datosService: DatosService);
    create(createDatoDto: CreateDatoDto): Promise<import("./entities/dato.entity").Dato>;
    findAll(): Promise<import("./entities/dato.entity").Dato[]>;
    findOne(id: number): Promise<import("./entities/dato.entity").Dato>;
    update(id: number, updateDatoDto: UpdateDatoDto): Promise<import("./entities/dato.entity").Dato>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
