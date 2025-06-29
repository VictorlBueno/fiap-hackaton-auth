# Cognito Auth API

API robusta para autenticação usando AWS Cognito com **Clean Architecture** e **Arquitetura Hexagonal**.

## 🏗️ Arquitetura

Este projeto segue rigorosamente os princípios da **Clean Architecture** e **Arquitetura Hexagonal**, organizando o código em camadas bem definidas:

```
src/
├── domain/                 # Camada de Domínio (Regras de Negócio)
│   ├── entities/          # Entidades de negócio
│   └── ports/             # Contratos/Interfaces
│       └── gateways/      # Interfaces para recursos externos
├── application/           # Camada de Aplicação (Casos de Uso)
│   ├── ports/            # Interfaces dos controllers
│   └── usecases/         # Implementação dos casos de uso
└── infrastructure/       # Camada de Infraestrutura (Detalhes)
    ├── adapters/         # Implementações dos contratos
    │   ├── controllers/  # Controllers REST
    │   └── gateways/     # Integrações externas (Cognito)
    ├── config/           # Configurações
    ├── http/            # Ponto de entrada HTTP
    └── modules/         # Módulos do NestJS
```

### 🎯 Princípios Aplicados

- **Dependency Inversion**: Dependências apontam para abstrações, não implementações
- **Single Responsibility**: Cada classe tem uma única responsabilidade
- **Open/Closed**: Extensível para novos recursos sem modificar código existente
- **Interface Segregation**: Interfaces específicas para cada necessidade
- **Separation of Concerns**: Separação clara entre domínio, aplicação e infraestrutura

## 🚀 Funcionalidades

### ✅ Criação de Usuário
- Criação direta com senha definitiva
- Email marcado como verificado automaticamente
- Uso de métodos admin do Cognito (`adminCreateUser`, `adminSetUserPassword`)
- Validação robusta de entrada

### ✅ Login de Usuário
- Autenticação via usuário/senha
- Retorno de tokens JWT (access, refresh, id)
- Tratamento completo de erros
- Rate limiting automático do Cognito

## 🛠️ Tecnologias

- **NestJS** - Framework Node.js com TypeScript
- **AWS Cognito** - Serviço de autenticação da AWS
- **AWS SDK v3** - Cliente oficial da AWS
- **Swagger/OpenAPI** - Documentação automática da API
- **Class Validator** - Validação de DTOs
- **TypeScript** - Tipagem estática

## 📋 Pré-requisitos

- Node.js 18+
- Conta AWS com Cognito configurado
- User Pool e App Client criados no Cognito

## ⚙️ Configuração

### 1. Instalação
```bash
# Clone o repositório
git clone <repo-url>
cd cognito-auth-api

# Instale as dependências
make install
# ou
npm install
```

### 2. Configuração do Ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env
```

Configure as variáveis no arquivo `.env`:
```env
# Server
PORT=3000
NODE_ENV=development

# AWS Cognito
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
COGNITO_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxx

# AWS Credentials (se necessário)
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Configuração do Cognito

No AWS Console, configure seu User Pool com:

1. **App Client Settings**:
    - ✅ Enable SRP (Secure Remote Password) protocol based authentication
    - ✅ Enable username-password auth for admin APIs

2. **Policies**:
    - Password minimum length: 8 characters
    - Require uppercase, lowercase, numbers, special characters

3. **MFA**: Desabilitado (conforme requisitos)

## 🚦 Executando

### Desenvolvimento
```bash
make dev
# ou
npm run start:dev
```

### Produção
```bash
make build
make start
# ou
npm run build
npm run start:prod
```

### Docker
```bash
make docker-build
make docker-run
# ou
docker build -t cognito-auth-api .
docker run -p 3000:3000 --env-file .env cognito-auth-api
```

## 📚 Documentação da API

Após iniciar o servidor, acesse:

- **Swagger UI**: http://localhost:3000/api/docs
- **OpenAPI JSON**: http://localhost:3000/api/docs-json

## 🧪 Endpoints

### POST /api/v1/auth/register
Cria um novo usuário.

```json
{
  "email": "user@example.com",
  "password": "MinhaSenh@123",
  "name": "João Silva"
}
```

**Resposta (201)**:
```json
{
  "id": "uuid-4",
  "email": "user@example.com",
  "name": "João Silva",
  "createdAt": "2024-01-01T00:00:00Z",
  "isEmailVerified": true
}
```

### POST /api/v1/auth/login
Autentica um usuário.

```json
{
  "email": "user@example.com",
  "password": "MinhaSenh@123"
}
```

**Resposta (200)**:
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIs...",
  "refreshToken": "eyJjdHkiOiJKV1Qi...",
  "idToken": "eyJhbGciOiJSUzI1NiIs...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

## 🔧 Comandos Úteis

```bash
# Configuração inicial
make setup

# Desenvolvimento
make dev

# Testes
make test
make test-coverage

# Linting
make lint
make lint-fix

# Build
make build

# Verificações (lint + test)
make check

# Limpeza
make clean
```

## 🚨 Tratamento de Erros

A API trata todos os cenários de erro com respostas estruturadas:

| Status | Cenário |
|--------|---------|
| 400 | Dados inválidos, senha fraca |
| 401 | Credenciais inválidas |
| 409 | Usuário já existe |
| 429 | Muitas tentativas |
| 500 | Erro interno |

**Formato de erro**:
```json
{
  "statusCode": 400,
  "message": "Email deve ter formato válido",
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/v1/auth/register"
}
```

## 🏭 Estrutura de Produção

### Healthcheck
```bash
curl http://localhost:3000/api/v1/health
```

### Logging
- Logs estruturados para produção
- Correlation IDs para rastreamento
- Métricas de performance

### Segurança
- Validação rigorosa de entrada
- Rate limiting do Cognito
- Headers de segurança configurados
- CORS configurado

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes com watch
npm run test:watch

# Coverage
npm run test:cov

# Testes e2e
npm run test:e2e
```

## 📈 Monitoramento

- **Swagger UI** para documentação interativa
- **Health checks** para monitoramento de saúde
- **Logs estruturados** para observabilidade
- **Métricas** de performance integradas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.