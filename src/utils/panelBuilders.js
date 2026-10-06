const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');

function buildTicketPanel() {
  const embed = new EmbedBuilder()
    .setTitle(`🎫 ${config.panels.ticketTitle}`)
    .setDescription(config.panels.ticketDescription)
    .setColor(config.brand.color)
    .addFields(
      { name: '💸 Compra', value: 'Comprar uma VTR, skin ou produto pronto.', inline: true },
      { name: '🎨 Encomenda', value: 'Solicitar uma skin personalizada.', inline: true },
      { name: '🛠️ Suporte', value: 'Problemas com arquivo, instalação ou produto.', inline: true },
      { name: '📦 Outros', value: 'Dúvidas gerais e parcerias.', inline: true }
    )
    .setFooter({ text: config.brand.footer });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_compra').setLabel('Comprar').setEmoji('🛒').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('ticket_encomenda').setLabel('Encomenda').setEmoji('🎨').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('ticket_suporte').setLabel('Suporte').setEmoji('🛠️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('ticket_outros').setLabel('Outros').setEmoji('📦').setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row] };
}

function buildHowToBuyPanel() {
  const embed = new EmbedBuilder()
    .setTitle('🛒 Como comprar')
    .setDescription(
      [
        '**1.** Veja as viaturas e produtos disponíveis no catálogo.',
        '**2.** Quando escolher, vá até <#1557098650960662578> e clique em **Comprar**.',
        '**3.** Informe o nome/código do produto e tire suas dúvidas no ticket.',
        '**4.** A equipe confirma o valor e o pagamento.',
        '**5.** Após a confirmação, seu pedido entra em produção ou é entregue, conforme o produto.',
        '',
        '⚠️ **Não envie pagamentos antes da confirmação da equipe dentro do ticket.**'
      ].join('\n')
    )
    .setColor(config.brand.color)
    .setFooter({ text: config.brand.footer });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_compra')
      .setLabel('Abrir ticket de compra')
      .setEmoji('🛒')
      .setStyle(ButtonStyle.Success)
  );

  return { embeds: [embed], components: [row] };
}

function buildProductsPanel() {
  const file = path.join(__dirname, '../../data/products.json');
  const products = JSON.parse(fs.readFileSync(file, 'utf8')).filter(p => p.active !== false);

  const embed = new EmbedBuilder()
    .setTitle('🚔 Catálogo Henrique VTR')
    .setDescription(
      products.length
        ? 'Escolha abaixo a viatura ou produto que deseja visualizar/comprar.'
        : 'O catálogo ainda não possui produtos cadastrados.'
    )
    .setColor(config.brand.color)
    .setFooter({ text: config.brand.footer });

  if (!products.length) return { embeds: [embed], components: [] };

  const menu = new StringSelectMenuBuilder()
    .setCustomId('product_select')
    .setPlaceholder('Selecione uma viatura/produto')
    .addOptions(products.slice(0, 25).map(p => ({
      label: p.name.slice(0, 100),
      description: `${p.category} • R$ ${Number(p.price).toFixed(2)}`.slice(0, 100),
      value: p.id
    })));

  return {
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(menu)]
  };
}

module.exports = { buildTicketPanel, buildHowToBuyPanel, buildProductsPanel };
