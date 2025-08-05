# No de Duas API

Uma API RESTful constru�da com **NestJS**, **TypeScript** e **Prisma**, implementando autentica��o JWT, sistema de roles/permiss�es e tratamento de exce��es personalizado.

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
- ? **Exce��es customizadas** com logs estruturados
- ? **Refresh tokens** com revoga��o
- ? **Testes HTTP** automatizados
- ? **Documenta��o** completa
- ? **Filtros globais** de exce��o
- ? **Transa��es** de banco de dados
- ? **Hash de senhas** seguro

## ?? Pr�ximos Passos

- [ ] Implementar rate limiting
- [ ] Adicionar valida��o de for�a de senha
- [ ] Implementar 2FA (Two-Factor Authentication)
- [ ] Adicionar auditoria de a��es
- [ ] Implementar cache com Redis
- [ ] Adicionar testes unit�rios e e2e

---

**Desenvolvido com ?? usando NestJS + TypeScript**
