# Vyracare App Shell

Shell orquestrador da plataforma Vyracare, responsável por autenticação, navegação principal e carregamento dos micro-frontends via Module Federation.

## Objetivo

O `vyracare-app-shell` centraliza:

- fluxo de login, registro, primeiro acesso e recuperação de senha
- proteção de rotas autenticadas
- layout principal da aplicação com `vc-navbar` e `vc-sidebar`
- carregamento dos MFEs remotos
- configuração dos endpoints de autenticação e dos `remoteEntry.js`

## Arquitetura

O shell é uma aplicação Angular standalone que atua como host dos micro-frontends.

Hoje ele carrega os seguintes remotos:

- `dashboard`
  caminho: `/dashboard`
  remote entry: `dashboardRemoteEntry`
- `cadastro de pacientes`
  caminho: `/cadastro/pacientes`
  remote entry: `userRemoteEntry`
- `cadastro de funcionarios`
  caminho: `/cadastro/funcionarios`
  remote entry: `profileRemoteEntry`
- `cadastro de procedimentos`
  caminho: `/cadastro/procedimentos`
  remote entry: `proceedingsRemoteEntry`

As rotas estão definidas em [app.routes.ts](C:/Users/lenin/OneDrive/Desktop/GitHub/Vyracare/vyracare-app-shell/src/app/app.routes.ts).

## Estrutura principal

- `src/app/pages`
  telas locais do shell, principalmente autenticação e tela de erro
- `src/app/components/wrapper`
  casca principal da aplicação autenticada
- `src/app/guards`
  guardas de autenticação
- `src/app/services/auth`
  integração com login e sessão
- `src/environments`
  URLs da API de autenticação e dos micro-frontends

## Layout e Design System

O shell utiliza `@vyracare/design-system` como base visual.

Os componentes principais do layout são:

- `vc-navbar`
- `vc-sidebar`
- `vc-button`
- `vc-heading`
- `vc-text`

O wrapper também monta a sidebar dinamicamente com base nas rotas realmente disponíveis no shell, evitando exibir itens sem rota correspondente.

Arquivo principal do wrapper:

- [wrapper.component.ts](C:/Users/lenin/OneDrive/Desktop/GitHub/Vyracare/vyracare-app-shell/src/app/components/wrapper/wrapper.component.ts)

## Configuração de ambiente

Os arquivos de ambiente concentram:

- URL base da API de autenticação
- `api_id`
- `remoteEntry` de cada MFE

Arquivos:

- [environments.ts](C:/Users/lenin/OneDrive/Desktop/GitHub/Vyracare/vyracare-app-shell/src/environments/environments.ts)
- [environments.prod.ts](C:/Users/lenin/OneDrive/Desktop/GitHub/Vyracare/vyracare-app-shell/src/environments/environments.prod.ts)

Em desenvolvimento, os remotos apontam para `localhost`.

Em produção, os remotos apontam para domínios CloudFront publicados por cada MFE.

## Execução local

Antes de instalar dependências, autentique no CodeArtifact:

```bash
npm run codeartifact:login
```

Depois:

```bash
npm install
npm start
```

Aplicação local:

```text
http://localhost:4200
```

## Executar com os MFEs

Para o shell funcionar completamente em desenvolvimento, os remotos esperados são:

- `dashboard` em `http://localhost:4201`
- `user` em `http://localhost:4202`
- `profile` em `http://localhost:4203`
- `proceedings` em `http://localhost:4204`

Se algum remoto não estiver disponível, o shell trata a falha e redireciona para a tela local de erro.

## Scripts principais

```bash
npm start
npm run build
npm test
npm run watch
```

Script adicional:

```bash
npm run run:all
```

Esse comando pode ser usado quando o ecossistema local estiver preparado para subir host e remotos em conjunto.

## Testes

Os testes unitários usam Jest.

```bash
npm test
```

## Deploy

O projeto publica a partir da branch `develop`, utilizando a esteira Angular reutilizável do repositório `vyracare-infra-pipes-angular`.

O deploy de produção depende de:

- build Angular
- bucket S3
- distribuição CloudFront
- atualização dos artefatos publicados

## Integração com novos MFEs

Quando um novo MFE precisar ser incorporado ao shell, o fluxo esperado é:

1. publicar o novo `remoteEntry.js`
2. adicionar a nova propriedade no `environment`
3. mapear a nova rota em `app.routes.ts`
4. incluir o item correspondente na navegação do wrapper, se necessário

No fluxo mais recente do template Angular, a própria esteira do MFE pode atualizar automaticamente o `remoteEntry` no shell consumidor quando o repositório do orquestrador estiver configurado.
