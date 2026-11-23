# Lucas Dias | Marketing Jurídico — Site + Blog com painel

Projeto pronto para substituir **o conteúdo** do site atual no Netlify sem precisar mudar seu endereço: `https://lucasdiasjuridicoads.netlify.app/`.

## O que foi entregue

- **Seu site original preservado:** logo, foto, WhatsApp (69) 98493-6584, serviços, resultados e galeria.
- **Aba Blog** no menu, mais 3 artigos recentes na página inicial.
- **Página do blog:** `/blog/` com pesquisa, filtro por categoria e artigos.
- **3 artigos completos de exemplo**, cada um com endereço próprio `/blog/nome-do-artigo/`.
- **Painel de publicação:** `/admin/` com editor visual do Sveltia CMS, depois de conectar o GitHub e a autenticação.
- **SEO:** título, descrição, canonical, redes sociais, dados estruturados e sitemap.xml individualizados.
- **Sitemap automático:** `https://lucasdiasjuridicoads.netlify.app/sitemap.xml`.
- **RSS:** `/feed.xml`.

> **Importante:** o painel ainda NÃO está conectado à sua conta. A publicação via CMS só funcionará após configurar o usuário/repositório GitHub e a autenticação de login no Netlify. Nenhum acesso às suas contas foi solicitado ou utilizado.

## Faça primeiro: mantenha seu site antigo no ar até completar o procedimento

Este pacote é o **código-fonte**, não deve ser enviado diretamente pelo “arrastar e soltar” do Netlify. Quando conectado ao GitHub, o Netlify executará um comando para gerar as páginas.

### PASSO 1 — Abra uma conta GitHub e crie o repositório

1. Acesse https://github.com/ e entre na sua conta (ou crie uma gratuitamente).
2. Crie um repositório, por exemplo: `lucas-dias-marketing-juridico`.
3. De preferência, deixe-o privado se não quiser divulgar o código; confira antes os limites gratuitos atuais de GitHub/Netlify. Se escolher público, as fotos e código do site estarão publicamente acessíveis no repositório.
4. No computador, descompacte este ZIP e envie **todos os arquivos e pastas do projeto** para a raiz desse repositório no branch `main`. Você pode usar GitHub Desktop (mais fácil para começar) ou Git no terminal.
5. Confirme que `package.json`, `netlify.toml`, `site.config.json`, `public/`, `content/` e `scripts/` aparecem na **raiz** do repositório.

### PASSO 2 — Configure o arquivo do painel

1. No repositório do GitHub, abra `public/admin/config.yml` e clique em editar.
2. Substitua `SEU_USUARIO_GITHUB` pelo seu usuário real do GitHub (não inclua `@`).
3. Se criou o repositório com outro nome, substitua também `lucas-dias-marketing-juridico`.
4. O valor final tem este formato:

   ```yaml
   backend:
     name: github
     repo: seuusuario/lucas-dias-marketing-juridico
     branch: main
   ```

5. Salve a alteração com **Commit changes**.

### PASSO 3 — Conecte o repositório AO MESMO SITE no Netlify

1. Entre em https://app.netlify.com/ e selecione o projeto existente `lucasdiasjuridicoads` (ou o nome que aparece no painel).
2. Localize a opção de **vincular repositório ao projeto existente** em configurações do projeto > Continuous deployment > Repository (os nomes podem variar conforme a interface atual). O site publicado por upload manual pode usar a opção de criar um repositório GitHub diretamente pelo Netlify; confira essa alternativa para preservar a URL.
3. Conecte o GitHub, selecione o repositório do passo 1 e a branch `main`.
4. Build command: `npm run build`.
5. Publish directory: `dist`.
6. Deploy. O arquivo `netlify.toml` já traz a configuração de build.
7. Confira `https://lucasdiasjuridicoads.netlify.app/` e `https://lucasdiasjuridicoads.netlify.app/blog/`.

> **Não crie outro site no Netlify sem necessidade.** Conecte o repositório ao site atual para conservar a URL, o histórico do Search Console e o projeto existente. A vinculação pode exigir permissões de proprietário.

### PASSO 4 — Habilite login do painel pelo GitHub (Sveltia CMS)

A documentação oficial do Sveltia CMS descreve esta integração com Netlify:

1. Abra **https://github.com/settings/developers** > OAuth Apps > **New OAuth App**.
2. Application name: `Lucas Dias Marketing Jurídico - Blog`.
3. Homepage URL: `https://lucasdiasjuridicoads.netlify.app`.
4. **Authorization callback URL:** `https://api.netlify.com/auth/done`.
5. Registre a aplicação e copie o Client ID e o **Client Secret** (este último é sensível).
6. No Netlify, abra o mesmo site > **Project configuration > Security > OAuth**, opção **Authentication providers**, **Install provider**, selecione **GitHub**.
7. Cole o Client ID e o Client Secret **no painel seguro do Netlify**, nunca em HTML, GitHub ou em mensagens públicas.
8. Agora acesse `https://lucasdiasjuridicoads.netlify.app/admin/` e faça login com sua conta GitHub autorizada.

Referência oficial: https://sveltiacms.app/en/docs/backends/github#using-netlify

### PASSO 5 — Publique seu primeiro artigo

1. No `/admin/`, abra **Artigos do Blog** e clique em **Novo artigo**.
2. Preencha título, data, descrição SEO, categoria, imagem de capa e conteúdo no editor.
3. Mantenha **Publicar agora?** ativado e salve/publice.
4. O Sveltia CMS salva o artigo no GitHub. O Netlify detecta a alteração no repositório, executa `npm run build` e publica a nova página automaticamente.
5. Após concluir o deploy, visite `https://lucasdiasjuridicoads.netlify.app/blog/`. O artigo aparece também na página inicial se estiver entre os três mais recentes.
6. Se desativar o campo **Publicar agora?**, o arquivo permanece salvo como rascunho e não aparece no site nem no sitemap.

### PASSO 6 — Peça a indexação do blog no Google

Seu Search Console já cobre o site principal, caso sua propriedade corresponda à URL publicada:

1. Confirme o novo arquivo `https://lucasdiasjuridicoads.netlify.app/sitemap.xml`.
2. Em Search Console > Sitemaps, envie `sitemap.xml`.
3. Na inspeção de URL, informe `/blog/` e as URLs dos artigos que foram publicados; peça indexação quando necessário.
4. Acompanhe o relatório de indexação e a performance nas pesquisas. O Google escolhe o que indexa; nenhuma posição é garantida.

## Estrutura simplificada

```text
lucas-dias-marketing-juridico/
├── public/
│   ├── index.html              ← seu site original, com aba Blog
│   ├── assets/                 ← suas fotos, logo e CSS
│   ├── admin/
│   │   ├── index.html          ← painel Sveltia CMS
│   │   └── config.yml          ← CONFIGURAR USER/REPO
│   └── uploads/                ← fotos enviadas pelo painel
├── content/posts/             ← artigos em arquivos JSON
├── scripts/build.mjs          ← gera o blog e SEO automaticamente
├── site.config.json           ← URL usada nos links canônicos
├── netlify.toml               ← configura publicação no Netlify
├── package.json               ← comando de build
└── LEIA-ME-PRIMEIRO.md
```

`dist/` é criado por `npm run build` e não precisa ser enviado ao GitHub. Não edite os arquivos em `dist/`: eles serão sobrescritos no próximo deploy.

## Para testar no computador

1. Instale Node.js 20 ou mais recente.
2. No terminal, entre na pasta do projeto.
3. Execute `npm run build`.
4. Para testar com URLs corretamente, rode um servidor HTTP dentro de `dist` (por exemplo `python -m http.server 8000`) e abra `http://localhost:8000/blog/`.
5. O painel exige autenticação GitHub/Netlify configurada; o HTML do blog funciona localmente.

## Personalização e manutenção

- WhatsApp: número **5569984936584** já está definido no site e no script `scripts/build.mjs`.
- Fotos e logo: `public/assets/`; são suas imagens enviadas nesta conversa.
- Redes sociais: link do Instagram `@juridico_ads`.
- Endereço canônico: `site.config.json`. Se no futuro comprar domínio próprio, altere o domínio nesse arquivo, reimplante e reconfigure o Google.
- Conteúdos: edite somente pelo painel depois de habilitado. Se quiser, também pode editar os `.json` manualmente no GitHub e o Netlify publica.
- Os artigos iniciais são rascunhos editoriais originais de exemplo, publicados no site de teste do pacote. **Revise o texto antes da publicação final**, especialmente referências a regras profissionais vigentes.

## Custo e limitações

Não há cobrança pelo código nem serviços pagos embutidos. GitHub, Netlify e Sveltia CMS oferecem recursos gratuitos sujeitos aos planos e limites atuais. Um repositório/conta GitHub e a configuração OAuth são necessários para editar pelo painel. O JavaScript do painel é carregado da CDN do Sveltia CMS quando acessado, ou seja, é necessário ter acesso à internet.

## Ajuda oficial

- Sveltia CMS: https://sveltiacms.app/en/docs/start
- Integração Sveltia/Netlify: https://sveltiacms.app/en/docs/backends/github#using-netlify
- Netlify e repositórios: https://docs.netlify.com/build/git-workflows/repo-permissions-linking/
- Netlify site manual > GitHub: https://docs.netlify.com/build/git-workflows/create-a-repo-from-netlify/
- Sitemap no Google: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=pt-BR
