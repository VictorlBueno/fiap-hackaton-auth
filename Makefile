.PHONY: help install build start dev test lint clean

# Default target
help: ## Mostra esta mensagem de ajuda
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Instala as dependências
	npm ci

build: ## Compila o projeto
	npm run build

start: ## Inicia a aplicação em produção
	npm run start:prod

dev: ## Inicia a aplicação em modo desenvolvimento
	npm run start:dev

test: ## Executa os testes
	npm run test

test-watch: ## Executa os testes em modo watch
	npm run test:watch

test-coverage: ## Executa os testes com coverage
	npm run test:cov

lint: ## Executa o linter
	npm run lint

lint-fix: ## Executa o linter e corrige automaticamente
	npm run lint -- --fix

clean: ## Remove arquivos de build
	rm -rf dist/
	rm -rf node_modules/

setup: install ## Configuração inicial completa
	@echo "✅ Projeto configurado com sucesso!"
	@echo "📋 Próximos passos:"
	@echo "   1. Copie .env.example para .env"
	@echo "   2. Configure suas credenciais do AWS Cognito"
	@echo "   3. Execute 'make dev' para iniciar o desenvolvimento"

check: lint test ## Executa verificações (lint + test)

docker-build: ## Constrói a imagem Docker
	docker build -t cognito-auth-api .

docker-run: ## Executa o container Docker
	docker run -p 3000:3000 --env-file .env cognito-auth-api