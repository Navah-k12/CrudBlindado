"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DatosService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatosService = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
let DatosService = DatosService_1 = class DatosService {
    constructor() {
        this.pool = null;
        this.logger = new common_1.Logger(DatosService_1.name);
        this.fallback = [];
        this.nextId = 1;
    }
    async onModuleInit() {
        const possibleKeys = [
            'DATABASE_URL',
            'DATABASE_URL_PUBLIC',
            'DATABASE_URL_PUBLICA',
            'URL_DE_LA_BASE_DE_DATOS',
            'URL_PÚBLICA_DE_LA_BASE_DE_DATOS',
            'DATABASE_URL_VERSEL',
            'POSTGRES_URL',
            'PGDATABASE_URL',
        ];
        const dbUrl = possibleKeys.map((k) => ({ k, v: process.env[k] })).find((x) => x.v)?.v;
        const usedKey = possibleKeys.find((k) => !!process.env[k]);
        if (!dbUrl) {
            this.logger.warn('DATABASE_URL no definida (busqué varios nombres): usando almacenamiento en memoria');
            return;
        }
        if (usedKey)
            this.logger.log(`Usando variable de entorno '${usedKey}' para conectar la BD`);
        try {
            this.pool = new pg_1.Pool({
                connectionString: dbUrl,
                ssl: { rejectUnauthorized: false },
            });
            await this.pool.query('SELECT 1');
            await this.pool.query(`
        CREATE TABLE IF NOT EXISTS datos (
          id SERIAL PRIMARY KEY,
          contenido TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
            this.logger.log('Conectado a Postgres y tabla lista');
        }
        catch (err) {
            this.logger.error('No se pudo conectar a Postgres, usando fallback en memoria', err);
            this.pool = null;
        }
    }
    async query(sql, params) {
        if (!this.pool)
            throw new Error('DB_NOT_AVAILABLE');
        try {
            return await this.pool.query(sql, params);
        }
        catch (err) {
            this.logger.error('Error en consulta a Postgres', err);
            throw err;
        }
    }
    async create(createDatoDto) {
        try {
            if (this.pool) {
                const result = await this.query('INSERT INTO datos (contenido) VALUES ($1) RETURNING id, contenido', [createDatoDto.contenido]);
                return result.rows[0];
            }
            const nuevo = { id: this.nextId++, contenido: createDatoDto.contenido };
            this.fallback.push(nuevo);
            return nuevo;
        }
        catch (err) {
            this.logger.error('Error creating dato', err);
            throw new common_1.InternalServerErrorException('Error al crear el dato');
        }
    }
    async findAll() {
        try {
            if (this.pool) {
                const result = await this.query('SELECT id, contenido FROM datos ORDER BY id ASC');
                return result.rows;
            }
            return [...this.fallback];
        }
        catch (err) {
            this.logger.error('Error fetching datos', err);
            throw new common_1.InternalServerErrorException('Error al obtener los datos');
        }
    }
    async findOne(id) {
        try {
            if (this.pool) {
                const result = await this.query('SELECT id, contenido FROM datos WHERE id = $1', [id]);
                if (result.rows.length === 0) {
                    throw new common_1.NotFoundException(`Dato con id ${id} no encontrado`);
                }
                return result.rows[0];
            }
            const found = this.fallback.find((d) => d.id === id);
            if (!found)
                throw new common_1.NotFoundException(`Dato con id ${id} no encontrado`);
            return found;
        }
        catch (err) {
            if (err instanceof common_1.NotFoundException)
                throw err;
            this.logger.error('Error fetching dato by id', err);
            throw new common_1.InternalServerErrorException('Error al obtener el dato');
        }
    }
    async update(id, updateDatoDto) {
        try {
            if (this.pool) {
                const result = await this.query('UPDATE datos SET contenido = $1 WHERE id = $2 RETURNING id, contenido', [updateDatoDto.contenido, id]);
                if (result.rows.length === 0) {
                    throw new common_1.NotFoundException(`Dato con id ${id} no encontrado`);
                }
                return result.rows[0];
            }
            const idx = this.fallback.findIndex((d) => d.id === id);
            if (idx === -1)
                throw new common_1.NotFoundException(`Dato con id ${id} no encontrado`);
            this.fallback[idx].contenido = updateDatoDto.contenido;
            return this.fallback[idx];
        }
        catch (err) {
            if (err instanceof common_1.NotFoundException)
                throw err;
            this.logger.error('Error updating dato', err);
            throw new common_1.InternalServerErrorException('Error al actualizar el dato');
        }
    }
    async remove(id) {
        try {
            if (this.pool) {
                const result = await this.query('DELETE FROM datos WHERE id = $1 RETURNING id', [id]);
                if (result.rows.length === 0) {
                    throw new common_1.NotFoundException(`Dato con id ${id} no encontrado`);
                }
                return { message: `Dato con id ${id} eliminado correctamente` };
            }
            const idx = this.fallback.findIndex((d) => d.id === id);
            if (idx === -1)
                throw new common_1.NotFoundException(`Dato con id ${id} no encontrado`);
            this.fallback.splice(idx, 1);
            return { message: `Dato con id ${id} eliminado correctamente` };
        }
        catch (err) {
            if (err instanceof common_1.NotFoundException)
                throw err;
            this.logger.error('Error removing dato', err);
            throw new common_1.InternalServerErrorException('Error al eliminar el dato');
        }
    }
};
exports.DatosService = DatosService;
exports.DatosService = DatosService = DatosService_1 = __decorate([
    (0, common_1.Injectable)()
], DatosService);
//# sourceMappingURL=datos.service.js.map