# No de Duas API

Uma API R## ??? Tecnologias Utilizadas

- **NestJS** - Framework Node.js
- **TypeScript** - Linguagem de programa��o
- **Prisma** - ORM para banco de dados
- **JWT** - Autentica��o com tokens
- **bcrypt** - Hash de senhas
- **Custom Exceptions** - Tratamento de erros personalizado
- **LocalStack** - Simula��o local de servi�os AWS S3 para desenvolvimentoonstru�da com **NestJS**, **TypeScript** e **Prisma**, implementando autentica��o JWT, sistema de roles/permiss�es e tratamento de exce��es personalizado.

## ?? Quick Start para Desenvolvedores

**Novo no projeto?** Siga o guia r�pido:

```bash
# 1. Clone o reposit�rio
git clone <repository-url>
cd no-de-duas-api

# 2. Execute o setup automatizado
./scripts/dev-setup.sh

# 3. Acesse a API
curl http://localhost:3000/health

# 4. Teste a integra��o S3 (opcional)
./scripts/test-s3.sh
```

**Pronto!** Sua API est� rodando em http://localhost:3000
- LocalStack S3: http://localhost:4566 (para desenvolvimento)

?? **Para instru��es detalhadas de desenvolvimento, veja [DEVELOPMENT.md](./DEVELOPMENT.md)**
?? **Para hist�rico de mudan�as, veja [CHANGELOG.md](./CHANGELOG.md)**

> **Nota**: Se voc� encontrar problemas relacionados ao Prisma, eles foram corrigidos na vers�o atual. Use `./scripts/test-prisma.sh` para diagn�stico.

## ?? Tecnologias Utilizadas

- **NestJS** - Framework Node.js
- **TypeScript** - Linguagem de programa��o
- **Prisma** - ORM para banco de dados
- **JWT** - Autentica��o com tokens
- **bcrypt** - Hash de senhas
- **Custom Exceptions** - Tratamento de erros personalizado

## ?? Estrutura do Projeto

```
src/
??? auth/                    # M�dulo de autentica��o
??? users/                   # M�dulo de usu�rios
??? common/
?   ??? exceptions/          # Exce��es customizadas
?   ??? filters/             # Filtros globais
??? prisma/                  # Configura��o do Prisma
??? main.ts                  # Ponto de entrada
```

## ?? Sistema de Autentica��o

### Fluxo de Autentica��o

1. **Login** ? Recebe `access_token` e `refresh_token`
2. **Uso do Access Token** ? Acesso a rotas protegidas
3. **Renova��o** ? Usa `refresh_token` para obter novos tokens
4. **Logout** ? Revoga tokens de refresh

### Tokens JWT

- **Access Token**: Expira em 15 minutos
- **Refresh Token**: Expira em 7 dias
- **Armazenamento**: Refresh tokens s�o salvos no banco de dados

## ?? Documenta��o das Rotas

### ?? Autentica��o

#### `POST /auth/login`

Realiza login do usu�rio.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1...",
  "refresh_token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "roles": ["user"]
  }
}
```

**Exce��es:**

- `InvalidCredentialsException` (401) - Email ou senha incorretos

---

#### `POST /auth/refresh`

Renova tokens de acesso.

**Request Body:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1..."
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1...",
  "refresh_token": "eyJhbGciOiJIUzI1..."
}
```

**Exce��es:**

- `TokenExpiredException` (401) - Token expirado
- `UnauthorizedAccessException` (403) - Token inv�lido

---

#### `GET /auth/profile`

Obt�m dados do usu�rio logado.

**Headers:**

```
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "roles": ["user"]
}
```

---

#### `POST /auth/logout`

Realiza logout revogando tokens.

**Headers:**

```
Authorization: Bearer {access_token}
```

**Request Body:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1..."
}
```

### ?? Gerenciamento de Usu�rios

#### `POST /users`

Cria um novo usu�rio.

**Headers:**

```
Authorization: Bearer {access_token}
```

**Request Body:**

```json
{
  "name": "Jo�o Silva",
  "email": "joao@example.com",
  "password": "password123",
  "roles": ["user", "moderator"]
}
```

**Exce��es:**

- `UserAlreadyExistsException` (409) - Email j� cadastrado
- `InvalidUserDataException` (400) - Dados inv�lidos ou roles inexistentes

---

#### `GET /users`

Lista todos os usu�rios.

**Headers:**

```
Authorization: Bearer {access_token}
```

**Response:**

```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "roles": [
      {
        "role": {
          "name": "user",
          "description": "Regular user"
        }
      }
    ]
  }
]
```

---

#### `GET /users/{id}`

Busca usu�rio por ID.

**Headers:**

```
Authorization: Bearer {access_token}
```

**Exce��es:**

- `UserNotFoundException` (404) - Usu�rio n�o encontrado

---

#### `PATCH /users/{id}`

Atualiza dados do usu�rio.

**Headers:**

```
Authorization: Bearer {access_token}
```

**Request Body (Dados b�sicos):**

```json
{
  "name": "Jo�o Silva Santos",
  "email": "joao.santos@example.com",
  "isActive": true
}
```

**Request Body (Com roles):**

```json
{
  "name": "Jo�o Admin",
  "roles": ["admin", "moderator"]
}
```

**Request Body (Senha):**

```json
{
  "password": "newPassword123"
}
```

**Exce��es:**

- `UserNotFoundException` (404) - Usu�rio n�o encontrado
- `UserUpdateFailedException` (500) - Falha na atualiza��o
- `InvalidUserDataException` (400) - Dados inv�lidos

## ?? Sistema de Exce��es Customizadas

### Exce��es de Autentica��o

| Exce��o                       | Status | Mensagem                           |
| ----------------------------- | ------ | ---------------------------------- |
| `InvalidCredentialsException` | 401    | "Invalid credentials provided"     |
| `TokenExpiredException`       | 401    | "Authentication token has expired" |
| `UnauthorizedAccessException` | 403    | "Unauthorized access to resource"  |
| `AccountBlockedException`     | 403    | "Account has been blocked"         |

### Exce��es de Usu�rio

| Exce��o                      | Status | Mensagem                     |
| ---------------------------- | ------ | ---------------------------- |
| `UserNotFoundException`      | 404    | "User not found"             |
| `UserAlreadyExistsException` | 409    | "User already exists"        |
| `InvalidUserDataException`   | 400    | "Invalid user data provided" |
| `UserUpdateFailedException`  | 500    | "Failed to update user"      |

### Formato Padr�o de Erro

Todas as exce��es retornam no formato:

```json
{
  "statusCode": 401,
  "message": "Invalid credentials provided",
  "error": "InvalidCredentialsException",
  "timestamp": "2024-01-15T14:30:25.123Z",
  "path": "/auth/login"
}
```

## ?? Testando a API

### Pr�-requisitos

1. **VS Code** com extens�o **REST Client**
2. **Servidor rodando** na porta 3000

### Usando o arquivo routes.http

1. **Abra o arquivo** `routes.http` no VS Code
2. **Execute o login** clicando em "Send Request" na se��o de login
3. **Os tokens ser�o capturados automaticamente** pelas vari�veis
4. **Execute outras rotas** que usar�o os tokens automaticamente

### Fluxo de Teste Recomendado

```
1. Login (obter tokens)
   ?
2. Criar usu�rios de teste
   ?
3. Testar opera��es CRUD
   ?
4. Testar cen�rios de erro
   ?
5. Testar refresh de tokens
   ?
6. Logout
```

### Exemplos de Teste

**1. Setup Inicial:**

```http
# Criar usu�rio admin (primeira execu��o)
POST http://localhost:3000/users
Content-Type: application/json

{
  "name": "System Admin",
  "email": "admin@example.com",
  "password": "admin123",
  "roles": ["admin"]
}
```

**2. Login:**

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**3. Testar Exce��o:**

```http
# Teste InvalidCredentialsException
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "wrong@example.com",
  "password": "wrongpassword"
}
```

## ?? Configura��o do Ambiente

### Vari�veis de Ambiente

```env
DATABASE_URL=""
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET=""
JWT_REFRESH_EXPIRES_IN="7d"
```

### Instala��o

```bash
# Instalar depend�ncias
npm install

# Configurar banco de dados
npx prisma migrate dev

# Seed inicial (opcional)
npx prisma db seed

# Iniciar servidor
npm run start:dev
```

## ?? Logs e Monitoramento

O sistema implementa **logs estruturados** para todas as exce��es:

```
[Nest] 12345 - 2024-01-15T10:30:00.000Z ERROR [HttpExceptionFilter] HTTP Exception: InvalidCredentialsException
{
  "statusCode": 401,
  "message": "Invalid credentials provided",
  "path": "/auth/login",
  "method": "POST",
  "userAgent": "Mozilla/5.0...",
  "ip": "127.0.0.1",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## ??? Seguran�a

- **Senhas hasheadas** com bcrypt (salt rounds: 10)
- **Tokens JWT** com expira��o configur�vel
- **Refresh tokens** armazenados no banco com controle de revoga��o
- **Valida��o de dados** com class-validator
- **Tratamento de exce��es** sem exposi��o de dados sens�veis

## ?? Funcionalidades Implementadas

- ? **Autentica��o JWT** completa
- ? **Sistema de roles** e permiss�es
- ? **CRUD de usu�rios** com valida��es
- ? **CRUD de produtos** completo
- ? **Upload de imagens S3** com presigned URLs
- ? **Gerenciamento de imagens** (m�x 3 por produto)
- ? **Reordena��o de imagens** via drag & drop
- ? **Exce��es customizadas** com logs estruturados
- ? **Refresh tokens** com revoga��o
- ? **Testes HTTP** automatizados
- ? **Documenta��o** completa

## ?? Pr�ximos Passos

- [ ] Implementar rate limiting
- [ ] Adicionar valida��o de for�a de senha
- [ ] Implementar 2FA (Two-Factor Authentication)
- [ ] Adicionar auditoria de a��es
- [ ] Implementar cache com Redis
- [ ] Adicionar testes unit�rios e e2e

---

**Desenvolvido com ?? usando NestJS + TypeScript**

## ??? **Gerenciamento de Imagens de Produtos**

### Sistema de Upload S3

O sistema utiliza **upload direto ao AWS S3** via presigned URLs para m�xima performance e escalabilidade.

#### **Limita��es:**

- ? M�ximo **3 imagens** por produto
- ? Tamanho m�ximo **5MB** por imagem
- ? Formatos aceitos: **JPG, PNG, WebP**
- ? Ordem configur�vel das imagens

#### **Fluxo de Upload:**

```mermaid
sequenceDiagram
    Frontend->>API: 1. Solicita URLs de upload
    API->>AWS S3: 2. Gera presigned URLs
    AWS S3->>API: 3. Retorna URLs tempor�rias
    API->>Frontend: 4. Envia URLs + metadata
    Frontend->>AWS S3: 5. Upload direto das imagens
    Frontend->>API: 6. Confirma upload completo
    API->>Database: 7. Salva refer�ncias das imagens
```

### **Endpoints de Imagens**

#### `POST /products/{productId}/images/upload-urls`

Gera URLs tempor�rias para upload direto ao S3.

**Roles:** `admin`, `moderator`

**Request Body:**

```json
{
  "files": [
    {
      "fileName": "product-image-1.jpg",
      "contentType": "image/jpeg"
    },
    {
      "fileName": "product-image-2.png",
      "contentType": "image/png"
    }
  ]
}
```

**Response:**

```json
[
  {
    "key": "products/uuid/image1.jpg",
    "uploadUrl": "https://bucket.s3.region.amazonaws.com/...",
    "fileName": "product-image-1.jpg",
    "sortOrder": 1
  }
]
```

---

#### `POST /products/{productId}/images/confirm`

Confirma upload e salva refer�ncias no banco.

**Roles:** `admin`, `moderator`

**Request Body:**

```json
{
  "uploads": [
    {
      "key": "products/uuid/image1.jpg",
      "altText": "Product main image"
    }
  ]
}
```

---

#### `GET /products/{productId}/images`

Lista imagens do produto (p�blico).

**Response:**

```json
[
  {
    "id": "uuid",
    "imageUrl": "https://bucket.s3.amazonaws.com/products/uuid/image1.jpg",
    "altText": "Product main image",
    "sortOrder": 1,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

#### `PATCH /products/{productId}/images/reorder`

Altera ordem de exibi��o das imagens.

**Roles:** `admin`, `moderator`

**Request Body:**

```json
{
  "imageOrders": [
    { "id": "uuid1", "sortOrder": 2 },
    { "id": "uuid2", "sortOrder": 1 }
  ]
}
```

---

#### `DELETE /products/{productId}/images/{imageId}`

Remove imagem do produto e do S3.

**Roles:** `admin`

### **Configura��o AWS S3**

#### **Vari�veis de Ambiente (.env)**

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET_NAME=your-bucket-name

# Upload Configuration (Customizable)
MAX_IMAGES_PER_PRODUCT=3
ALLOWED_FILE_TYPES="jpg,jpeg,png,webp"
MAX_FILE_SIZE_MB=5
```

#### **Estrutura de Pastas no S3**

```
your-bucket-name/
??? products/
?   ??? {productId}/
?   ?   ??? images/
?   ?       ??? {uuid1}.jpg
?   ?       ??? {uuid2}.png
?   ?       ??? {uuid3}.webp
??? users/
?   ??? {userId}/
?   ?   ??? profile/
?   ?       ??? {uuid}.jpg
??? materials/
    ??? {materialId}/
    ?   ??? images/
    ?       ??? {uuid}.jpg
```

#### **Configura��es Din�micas**

**Limite de Imagens por Produto:**

- Configur�vel via `MAX_IMAGES_PER_PRODUCT`
- Padr�o: 3 imagens
- Valida��o autom�tica no upload

**Tipos de Arquivo Permitidos:**

- Configur�vel via `ALLOWED_FILE_TYPES`
- Padr�o: "jpg,jpeg,png,webp"
- Separados por v�rgula

**Tamanho M�ximo:**

- Configur�vel via `MAX_FILE_SIZE_MB`
- Padr�o: 5MB
- Aplicado automaticamente

**Chaves Din�micas:**

```javascript
// Utiliza crypto.randomUUID() nativo do Node.js
import { randomUUID } from "crypto";

// Produtos: products/{productId}/images/{uuid}.{ext}
// Usu�rios: users/{userId}/profile/{uuid}.{ext}
// Materiais: materials/{materialId}/images/{uuid}.{ext}
const uniqueId = randomUUID(); // Substitui v4 as uuidv4
```

### **Depend�ncias Necess�rias**

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```