# Henrique VTR Bot

Bot Discord para servidor de skins/viaturas de MTA.

## Recursos
- Painel administrativo `/painel`
- Painel de tickets com Compra, Encomenda, Suporte e Outros
- Modal antes da abertura do ticket
- Canal privado automático para cliente + staff
- Logs de abertura/fechamento
- Cadastro de VTR/produto com `/produto-adicionar`
- Catálogo interativo
- Publicação automática nos canais configurados

## Canais já configurados
- `#abrir-ticket`: `1557098650960662578`
- `#como-comprar`: `1557098294080053309`

## Instalação
1. Instale Node.js 20+
2. Rode `npm install`
3. Copie `.env.example` para `.env`
4. Preencha token, IDs do bot/servidor, cargo da staff, categoria de tickets e logs
5. Rode `npm start`

> Nunca envie o arquivo `.env` com o token do bot para o GitHub.
