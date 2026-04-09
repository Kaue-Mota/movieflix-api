# 🎬 MovieFlix API

API REST para gerenciamento de filmes, construída com **Node.js**, **TypeScript**, **Express**, **Prisma** e **PostgreSQL**.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [PostgreSQL](https://www.postgresql.org/) (v14 ou superior)
- npm (já vem com o Node.js)

---

## 🗂️ Estrutura de pastas

```
movieflix-api/
├── generated/          # Cliente Prisma gerado automaticamente (não editar)
│   └── prisma/
├── prisma/
│   └── schema.prisma   # Definição dos models do banco de dados
├── src/
│   └── server.ts       # Arquivo principal da aplicação
├── .env                # Variáveis de ambiente (não versionar)
├── .gitignore
├── .prettierrc         # Configuração do Prettier
├── .prettierignore
├── package.json
├── swagger.json        # Documentação da API
└── tsconfig.json
```

---

## 🚀 Passo a passo para recriar o projeto

### 1. Inicializar o projeto

```bash
mkdir movieflix-api
cd movieflix-api
npm init -y
```

---

### 2. Instalar as dependências

**Dependências de produção:**

```bash
npm install express swagger-ui-express @prisma/client typescript
```

**Dependências de desenvolvimento:**

```bash
npm install -D prisma tsx @types/node @types/express @types/swagger-ui-express prettier
```

| Pacote | Descrição |
|---|---|
| `express` | Framework web para criação das rotas |
| `swagger-ui-express` | Interface visual para documentação da API |
| `@prisma/client` | Cliente gerado pelo Prisma para acessar o banco |
| `typescript` | Suporte a TypeScript |
| `prisma` | ORM para modelagem e migração do banco |
| `tsx` | Executa arquivos TypeScript diretamente (dev) |
| `@types/node` | Tipos do Node.js para TypeScript |
| `@types/express` | Tipos do Express para TypeScript |
| `@types/swagger-ui-express` | Tipos do swagger-ui-express para TypeScript |
| `prettier` | Formatador de código |

---

### 3. Configurar o TypeScript

Crie o arquivo `tsconfig.json` na raiz do projeto:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "target": "esnext",
    "types": [],
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "strict": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "skipLibCheck": true
  }
}
```

---

### 4. Configurar o Prettier

Crie o arquivo `.prettierrc` na raiz:

```json
{
  "trailingComma": "es5",
  "tabWidth": 4,
  "semi": false,
  "singleQuote": true
}
```

Crie o arquivo `.prettierignore` na raiz:

```
node_modules
generated
```

---

### 5. Configurar o package.json

Adicione `"type": "module"` e os scripts no `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:pull": "prisma db pull"
  }
}
```

---

### 6. Configurar o .gitignore

Crie o arquivo `.gitignore` na raiz:

```
/node_modules
/dist
/coverage
.env
```

---

### 7. Configurar o banco de dados (PostgreSQL)

Crie um banco de dados no PostgreSQL chamado `movieflix`:

```sql
CREATE DATABASE movieflix;
```

Em seguida, crie as tabelas:

```sql
CREATE TABLE languages (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE genres (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE movies (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(100),
  release_date DATE,
  genre_id     INT REFERENCES genres(id),
  language_id  INT REFERENCES languages(id),
  oscar_count  INT
);
```

Popule com alguns dados de exemplo:

```sql
INSERT INTO languages (name) VALUES ('Inglês'), ('Português'), ('Espanhol');

INSERT INTO genres (name) VALUES ('Ação'), ('Comédia'), ('Ficção Científica'), ('Drama'), ('Terror');

INSERT INTO movies (title, release_date, genre_id, language_id, oscar_count) VALUES
  ('Interestelar',     '2014-11-07', 3, 1, 1),
  ('O Poderoso Chefão','1972-03-24', 4, 1, 3),
  ('Parasita',         '2019-05-30', 4, 3, 4);
```

---

### 8. Configurar as variáveis de ambiente

Crie o arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://SEU_USUARIO:SUA_SENHA@localhost:5432/movieflix"
```

> Substitua `SEU_USUARIO` e `SUA_SENHA` pelas credenciais do seu PostgreSQL.

---

### 9. Configurar o Prisma

Inicialize o Prisma:

```bash
npx prisma init --datasource-provider postgresql
```

Isso vai criar a pasta `prisma/` com o arquivo `schema.prisma`. Substitua o conteúdo pelo schema do projeto:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Genre {
  id     Int     @id @default(autoincrement())
  name   String? @db.VarChar(100)
  movies Movie[]

  @@map("genres")
}

model Language {
  id     Int     @id @default(autoincrement())
  name   String? @db.VarChar(100)
  movies Movie[]

  @@map("languages")
}

model Movie {
  id           Int       @id @default(autoincrement())
  title        String?   @db.VarChar(100)
  release_date DateTime? @db.Date
  genre_id     Int?
  language_id  Int?
  oscar_count  Int?
  genre        Genre?    @relation(fields: [genre_id], references: [id])
  language     Language? @relation(fields: [language_id], references: [id])

  @@map("movies")
}
```

> O `output` no generator aponta para `../generated/prisma`, que mantém o cliente gerado fora da pasta `src`.

Agora gere o cliente Prisma:

```bash
npm run prisma:generate
```

> Se o banco já estiver criado e você quiser gerar o schema a partir dele, use `npm run prisma:pull` antes.

---

### 10. Criar o servidor

Crie a pasta `src` e o arquivo `src/server.ts`:

```typescript
import express from 'express'
import { PrismaClient } from '../generated/prisma/index.js'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from '../swagger.json'

const port = 3000
const app = express()
const prisma = new PrismaClient()

app.use(express.json())

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Listar todos os filmes
app.get('/movies', async (req, res) => {
    const movies = await prisma.movie.findMany({
        orderBy: { title: 'asc' },
        include: { genre: true, language: true },
    })
    res.json(movies)
})

// Cadastrar um filme
app.post('/movies', async (req, res) => {
    const { title, language_id, genre_id, oscar_count, release_date } = req.body

    if (!title || !language_id || !genre_id || !release_date) {
        res.status(400).json({ message: 'Campos obrigatórios: title, language_id, genre_id, release_date' })
        return
    }

    try {
        await prisma.movie.create({
            data: { title, language_id, genre_id, oscar_count, release_date: new Date(release_date) },
        })
        res.status(201).send()
    } catch (error) {
        console.error('Error creating movie:', error)
        res.status(500).json({ error: 'Failed to create movie' })
    }
})

// Atualizar um filme
app.put('/movies/:id', async (req, res) => {
    const id = Number(req.params.id)
    const data = req.body
    data.release_date = data.release_date ? new Date(data.release_date) : undefined

    try {
        const movieExists = await prisma.movie.findUnique({ where: { id } })
        if (!movieExists) {
            return res.status(404).json({ error: 'Movie not found' })
        }
        await prisma.movie.update({ where: { id }, data })
        res.status(200).send(`Movie with id ${id} updated successfully`)
    } catch (error) {
        console.error('Error updating movie:', error)
        res.status(500).json({ error: 'Failed to update movie' })
    }
})

// Remover um filme
app.delete('/movies/:id', async (req, res) => {
    const id = Number(req.params.id)
    try {
        const movieExists = await prisma.movie.findUnique({ where: { id } })
        if (!movieExists) {
            return res.status(404).json({ error: 'Movie not found' })
        }
        await prisma.movie.delete({ where: { id } })
        res.status(200).send(`Movie with id ${id} deleted successfully`)
    } catch (error) {
        console.error('Error deleting movie:', error)
        res.status(500).json({ error: 'Failed to delete movie' })
    }
})

// Filtrar filmes por gênero
app.get('/movies/:genreName', async (req, res) => {
    try {
        const { genreName } = req.params
        const movies = await prisma.movie.findMany({
            include: { genre: true, language: true },
            where: { genre: { name: { equals: genreName, mode: 'insensitive' } } },
        })
        if (movies.length === 0) {
            return res.status(404).json({ error: 'No movies found for this genre' })
        }
        res.status(200).json(movies)
    } catch (error) {
        console.error('Error fetching movies by genre:', error)
        res.status(500).json({ error: 'Failed to fetch movies by genre' })
    }
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})
```

---

### 11. Criar a documentação Swagger

Crie o arquivo `swagger.json` na raiz do projeto com a documentação de todas as rotas. Consulte o arquivo `swagger.json` deste repositório como referência — ele segue o padrão **OpenAPI 3.0** e documenta todos os endpoints com seus parâmetros, request bodies e possíveis respostas.

---

## ▶️ Rodando o projeto

**Modo desenvolvimento** (com hot reload):

```bash
npm run dev
```

**Modo produção:**

```bash
npm run build
npm start
```

---

## 📡 Endpoints disponíveis

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/movies` | Lista todos os filmes |
| `POST` | `/movies` | Cadastra um novo filme |
| `PUT` | `/movies/:id` | Atualiza um filme pelo ID |
| `DELETE` | `/movies/:id` | Remove um filme pelo ID |
| `GET` | `/movies/:genreName` | Filtra filmes por gênero |
| `GET` | `/docs` | Documentação Swagger UI |

---

## 📄 Exemplo de request (POST /movies)

```json
{
  "title": "Interestelar",
  "release_date": "2014-11-07",
  "genre_id": 3,
  "language_id": 1,
  "oscar_count": 1
}
```

---

## 📖 Documentação interativa

Com o servidor rodando, acesse:

```
http://localhost:3000/docs
```

Você verá a interface do **Swagger UI** com todos os endpoints documentados e prontos para teste.
