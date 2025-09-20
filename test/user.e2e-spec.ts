// Utilitários do NestJS para criar módulo de teste e instanciar a aplicação
import { Test, TestingModule } from '@nestjs/testing';
// Tipos e recursos comuns do NestJS (aplicação + pipes de validação)
import { INestApplication, ValidationPipe } from '@nestjs/common';
// Módulo de configuração (lê variáveis do .env)
import { ConfigModule } from '@nestjs/config';
// Executa comandos de terminal dentro do Node (usado aqui para rodar migrations do Prisma)
import { execSync } from 'node:child_process';
// Biblioteca usada para simular requisições HTTP nos testes
import request from 'supertest';
// Utilitário do Node para manipular caminhos de arquivos
import { join } from 'node:path';

// Serviço do Prisma (conexão e queries com o banco de dados)
import { PrismaService } from 'src/prisma/prisma.service';
// Módulos da aplicação que serão carregados nos testes
import { UsersModule } from 'src/users/users.module';
import { TasksModule } from 'src/tasks/tasks.module';
import { AuthModule } from 'src/auth/auth.module';
// Módulo para servir arquivos estáticos (ex: uploads de imagens)
import { ServeStaticModule } from '@nestjs/serve-static';

describe('App E2E', () => {
  // Instância da aplicação NestJS usada nos testes
  let app: INestApplication;
  // Instância do Prisma para manipular o banco durante os testes
  let prisma: PrismaService;

  // Executa uma vez antes de todos os testes
  beforeAll(async () => {
    // Aplica as migrations do Prisma no banco de teste
    execSync('npx prisma migrate deploy');

    // Cria o módulo de teste carregando apenas os módulos necessários
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // Configura o .env.test como variáveis de ambiente e deixa global
        ConfigModule.forRoot({
          envFilePath: '.env.test',
          isGlobal: true,
        }),
        // Módulos reais da aplicação
        UsersModule,
        TasksModule,
        AuthModule,
        // Configuração para servir a pasta uploads como estática
        ServeStaticModule.forRoot({
          rootPath: join(__dirname, '..', '..', 'uploads'),
          serveRoot: '/uploads',
        }),
      ],
    }).compile();

    // Cria a aplicação NestJS a partir do módulo de teste
    app = moduleFixture.createNestApplication();

    // Adiciona pipe global para validação dos DTOs (remove campos extras não permitidos)
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    // Obtém o PrismaService para poder manipular dados durante os testes
    prisma = moduleFixture.get(PrismaService);

    // Inicializa a aplicação (como se fosse rodar normalmente)
    await app.init();
  });

  // Executa antes de cada teste
  beforeEach(async () => {
    // Limpa tabelas relevantes (garante isolamento entre testes)
    await prisma.user.deleteMany();
    await prisma.task.deleteMany();
  });

  // Executa uma vez no final de todos os testes
  afterAll(async () => {
    // Fecha a aplicação (evita conexões abertas/memory leaks)
    await app.close();
  });

  // Grupo de testes relacionados ao módulo de Users
  describe('Users', () => {
    // Testa o endpoint POST /users
    it('/users (POST)', async () => {
      // DTO usado para criar usuário
      const createUserDto = {
        name: 'matheus junior',
        email: 'matheus.junior@gmail.com',
        password: '123456',
      };

      // Faz requisição POST /users enviando o DTO
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto);

      // Verifica se status foi 201 (created)
      expect(response.status).toBe(201);
      // Verifica se corpo da resposta contém os dados esperados
      expect(response.body).toEqual({
        id: expect.any(Number), // ou expect.any(String) se id for UUID
        name: createUserDto.name,
        email: createUserDto.email,
      });
    });
  });
});
