# Vyracare App Shell

Shell orquestrador da plataforma Vyracare, responsavel por autenticacao, navegacao principal e carregamento dos micro-frontends via Module Federation.

## Objetivo

O `vyracare-app-shell` centraliza:

- fluxo de login, registro, primeiro acesso e recuperacao de senha
- protecao de rotas autenticadas
- layout principal da aplicacao com `vc-navbar` e `vc-sidebar`
- carregamento dos MFEs remotos
- configuracao dos endpoints de autenticacao e dos `remoteEntry.js`

## Arquitetura

O shell e uma aplicacao Angular standalone que atua como host dos micro-frontends.

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

As rotas estao definidas em [app.routes.ts](C:/Users/lenin/OneDrive/Desktop/GitHub/Vyracare/vyracare-app-shell/src/app/app.routes.ts).

## Estrutura principal

- `src/app/pages`
  telas locais do shell, principalmente autenticacao e tela de erro
- `src/app/components/wrapper`
  casca principal da aplicacao autenticada
- `src/app/guards`
  guardas de autenticacao
- `src/app/services/auth`
  integracao com login e sessao
- `src/environments`
  URLs da API de autenticacao e dos micro-frontends

## Layout e Design System

O shell utiliza `@vyracare/design-system` como base visual.

Os componentes principais do layout sao:

- `vc-navbar`
- `vc-sidebar`
- `vc-button`
- `vc-heading`
- `vc-text`

O wrapper tambem monta a sidebar dinamicamente com base nas rotas realmente disponiveis no shell, evitando exibir itens sem rota correspondente.

Arquivo principal do wrapper:

- [wrapper.component.ts](C:/Users/lenin/OneDrive/Desktop/GitHub/Vyracare/vyracare-app-shell/src/app/components/wrapper/wrapper.component.ts)

## Configuracao de ambiente

Os arquivos de ambiente concentram:

- URL base da API de autenticacao
- `remoteEntry` de cada MFE

Valores atuais da API de autenticacao:

- `dev`: `https://axswteu0u1.execute-api.us-east-1.amazonaws.com/api/auth`
- `hml`: `https://jkvfvgsw4l.execute-api.us-east-1.amazonaws.com/api/auth`
- `prod`: `https://bj6riwfeni.execute-api.us-east-1.amazonaws.com/api/auth`

Arquivos:

- [environments.ts](C:/Users/lenin/OneDrive/Desktop/GitHub/Vyracare/vyracare-app-shell/src/environments/environments.ts)
- [environments.dev.ts](C:/Users/lenin/OneDrive/Desktop/GitHub/Vyracare/vyracare-app-shell/src/environments/environments.dev.ts)
- [environments.hml.ts](C:/Users/lenin/OneDrive/Desktop/GitHub/Vyracare/vyracare-app-shell/src/environments/environments.hml.ts)
- [environments.prod.ts](C:/Users/lenin/OneDrive/Desktop/GitHub/Vyracare/vyracare-app-shell/src/environments/environments.prod.ts)

Em desenvolvimento local, os remotos apontam para `localhost`.

No `environment.dev.ts`, os remotos e a API apontam para os endpoints publicados do ambiente `dev`.

Em `hml` e `prod`, os remotos apontam para dominios CloudFront publicados por cada MFE.

## Execucao local

Antes de instalar dependencias, autentique no CodeArtifact:

```bash
npm run codeartifact:login
```

Depois:

```bash
npm install
npm start
```

Aplicacao local:

```text
http://localhost:4200
```

## Executar com os MFEs

Para o shell funcionar completamente em desenvolvimento, os remotos esperados sao:

- `dashboard` em `http://localhost:4201`
- `user` em `http://localhost:4202`
- `profile` em `http://localhost:4203`
- `proceedings` em `http://localhost:4204`

Se algum remoto nao estiver disponivel, o shell trata a falha e redireciona para a tela local de erro.

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

Os testes unitarios usam Jest.

```bash
npm test
```

## Deploy

O projeto publica a partir da branch `develop`, utilizando a esteira Angular reutilizavel do repositorio `vyracare-infra-pipes-angular`.

O deploy de producao depende de:

- build Angular
- bucket S3
- distribuicao CloudFront
- atualizacao dos artefatos publicados

## Integracao com novos MFEs

Quando um novo MFE precisar ser incorporado ao shell, o fluxo esperado e:

1. publicar o novo `remoteEntry.js`
2. adicionar a nova propriedade no `environment`
3. mapear a nova rota em `app.routes.ts`
4. incluir o item correspondente na navegacao do wrapper, se necessario

No fluxo mais recente do template Angular, a propria esteira do MFE pode atualizar automaticamente o `remoteEntry` no shell consumidor quando o repositorio do orquestrador estiver configurado.

## Convencao de commits

Os commits deste repositorio devem ser escritos em portugues.

Padrao recomendado:

- `feat: adiciona carregamento do mfe de perfil`
- `fix: corrige url de autenticacao no ambiente de homologacao`
- `docs: atualiza explicacao do fluxo de deploy`
