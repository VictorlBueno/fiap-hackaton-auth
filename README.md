# FIAP Hackathon - Auth Service

API de autenticação serverless usando AWS Lambda, NestJS e AWS Cognito com **Clean Architecture** e **Arquitetura Hexagonal**.

## 🏗️ Arquitetura

```
src/
├── domain/                 # Camada de Domínio (Regras de Negócio)
│   ├── entities/          # Entidades de negócio
│   └── ports/             # Contratos/Interfaces
│       ├── controllers/   # Interfaces dos controllers
│       └── gateways/      # Interfaces para recursos externos
├── application/           # Camada de Aplicação (Casos de Uso)
│   └── usecases/         # Implementação dos casos de uso
└── infrastructure/       # Camada de Infraestrutura (Detalhes)
    ├── adapters/         # Implementações dos contratos
    │   ├── controllers/  # Controllers REST + DTOs
    │   └── gateways/     # Integrações externas (Cognito)
    ├── config/           # Configurações
    ├── http/            # Ponto de entrada HTTP (Lambda handler)
    └── modules/         # Módulos do NestJS
```

### 🎯 Princípios Aplicados

- **Dependency Inversion**: Dependências apontam para abstrações, não implementações
- **Single Responsibility**: Cada classe tem uma única responsabilidade
- **Open/Closed**: Extensível para novos recursos sem modificar código existente
- **Interface Segregation**: Interfaces específicas para cada necessidade
- **Separation of Concerns**: Separação clara entre domínio, aplicação e infraestrutura

## 🚀 Tecnologias

- **AWS Lambda** - Computação serverless
- **Serverless Framework** - Deploy e gerenciamento de infraestrutura
- **NestJS** - Framework Node.js com TypeScript
- **AWS Cognito** - Serviço de autenticação da AWS
- **AWS SDK v3** - Cliente oficial da AWS
- **Swagger/OpenAPI** - Documentação automática da API
- **Class Validator** - Validação de DTOs
- **TypeScript** - Tipagem estática

## 📋 Pré-requisitos

- Node.js 18+
- AWS CLI configurado
- Serverless Framework instalado globalmente
- Conta AWS com Cognito configurado
- User Pool e App Client criados no Cognito

## ⚙️ Configuração

### 1. Instalação
```bash
# Clone o repositório
git clone <repo-url>
cd fiap-hack/auth

# Instale as dependências
npm install
```

### 2. Configuração do Ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env
```

Configure as variáveis no arquivo `.env`:
```env
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

### Desenvolvimento Local
```bash
# Desenvolvimento com hot reload
npm run start:dev

# Debug mode
npm run start:debug

# Build para produção
npm run build
```

### Deploy Serverless

```bash
# Deploy para desenvolvimento
serverless deploy --stage dev

# Deploy para produção
serverless deploy --stage prod

# Deploy apenas de uma função específica
serverless deploy function --function api

# Remover deploy
serverless remove --stage dev
```

### Comandos Úteis

```bash
# Testes
npm run test
npm run test:watch
npm run test:cov

# Linting
npm run lint

# Build
npm run build

# Formatação
npm run format
```

## 📚 Documentação da API

### Swagger UI
Após o deploy, acesse a documentação interativa:

- **Desenvolvimento**: https://[api-gateway-url]/dev/api/docs
- **Produção**: https://[api-gateway-url]/prod/api/docs

### Endpoints Disponíveis

#### POST /api/v1/auth/register
Cria um novo usuário no Cognito.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "MinhaSenh@123",
  "name": "João Silva"
}
```

**Response (201):**
```json
{
  "id": "uuid-4",
  "email": "user@example.com",
  "name": "João Silva",
  "createdAt": "2024-01-01T00:00:00Z",
  "isEmailVerified": true
}
```

**Validações:**
- Email deve ter formato válido
- Senha deve ter pelo menos 8 caracteres
- Nome deve ter pelo menos 2 caracteres

#### POST /api/v1/auth/login
Autentica um usuário e retorna tokens JWT.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "MinhaSenh@123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIs...",
  "refreshToken": "eyJjdHkiOiJKV1Qi...",
  "idToken": "eyJhbGciOiJSUzI1NiIs...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

## 🔧 Configuração Serverless

O arquivo `serverless.yml` define:

- **Runtime**: Node.js 18.x
- **Region**: us-east-1
- **IAM Permissions**: Permissões específicas para Cognito
- **API Gateway**: Proxy para todas as rotas
- **Handler**: `dist/src/infrastructure/http/main.handler`

### Estrutura do Deploy

```
AWS Lambda Function
├── Handler: main.handler
├── Runtime: nodejs18.x
├── Memory: 1024MB (padrão)
├── Timeout: 30s (padrão)
└── Environment Variables
    ├── AWS_REGION
    ├── COGNITO_USER_POOL_ID
    ├── COGNITO_CLIENT_ID
    └── COGNITO_CLIENT_SECRET
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

**Formato de erro:**
```json
{
  "statusCode": 400,
  "message": "Email deve ter formato válido",
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/v1/auth/register"
}
```

## 🏭 Monitoramento e Observabilidade

### CloudWatch Logs
- Logs estruturados automaticamente
- Correlation IDs para rastreamento
- Métricas de performance integradas

### Health Check
```bash
curl https://[api-gateway-url]/dev/api/v1/health
```

### Métricas Disponíveis
- Invocações da função
- Duração das execuções
- Taxa de erro
- Throttles

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

### Estrutura de Testes
```
src/
├── application/usecases/__tests__/
├── domain/entities/__tests__/
├── infrastructure/adapters/__tests__/
└── test/
    └── setup.ts
```

## 🔄 Git Flow

O projeto segue o padrão Git Flow:

```
main (produção)
├── develop (desenvolvimento)
├── feature/auth-register
├── feature/auth-login
├── hotfix/critical-fix
└── release/v1.0.0
```

### Branches Principais
- **main**: Código em produção
- **develop**: Código em desenvolvimento
- **feature/***: Novas funcionalidades
- **hotfix/***: Correções críticas
- **release/***: Preparação para release

### Workflow de Desenvolvimento
1. Criar branch feature a partir de `develop`
2. Desenvolver e testar
3. Criar Pull Request para `develop`
4. Code review e merge
5. Criar Pull Request de `develop` para `main` (release)

## 📈 CI/CD

### Pipeline Sugerido
1. **Build**: Compilação TypeScript
2. **Test**: Execução de testes unitários
3. **Lint**: Verificação de código
4. **Deploy Dev**: Deploy automático para ambiente de desenvolvimento
5. **Deploy Prod**: Deploy manual para produção

### Variáveis de Ambiente por Stage
- **dev**: Configurações de desenvolvimento
- **prod**: Configurações de produção
- **test**: Configurações para testes

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Commit
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação de código
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Tarefas de build/configuração

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🔗 Links Úteis

- [NestJS Documentation](https://docs.nestjs.com/)
- [Serverless Framework](https://www.serverless.com/)
- [AWS Lambda](https://aws.amazon.com/lambda/)
- [AWS Cognito](https://aws.amazon.com/cognito/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)