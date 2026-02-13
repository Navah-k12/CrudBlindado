"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatosService = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
let DatosService = class DatosService {
    pool;
    async onModuleInit() {
        this.pool = new pg_1.Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
        });
    }
    async create(createDatoDto) {
        const result = await this.pool.query('INSERT INTO datos (contenido) VALUES ($1) RETURNING id, contenido', [createDatoDto.contenido]);
        return result.rows[0];
    }
    async findAll() {
        const result = await this.pool.query('SELECT id, contenido FROM datos ORDER BY id ASC');
        return result.rows;
    }
    async findOne(id) {
        const result = await this.pool.query('SELECT id, contenido FROM datos WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            throw new common_1.NotFoundException(`Dato con id ${id} no encontrado`);
        }
        return result.rows[0];
    }
    async update(id, updateDatoDto) {
        const result = await this.pool.query('UPDATE datos SET contenido = $1 WHERE id = $2 RETURNING id, contenido', [updateDatoDto.contenido, id]);
        if (result.rows.length === 0) {
            throw new common_1.NotFoundException(`Dato con id ${id} no encontrado`);
        }
        return result.rows[0];
    }
    async remove(id) {
        const result = await this.pool.query('DELETE FROM datos WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            throw new common_1.NotFoundException(`Dato con id ${id} no encontrado`);
        }
        return { message: `Dato con id ${id} eliminado correctamente` };
    }
};
exports.DatosService = DatosService;
exports.DatosService = DatosService = __decorate([
    (0, common_1.Injectable)()
], DatosService);
//# sourceMappingURL=datos.service.js.map