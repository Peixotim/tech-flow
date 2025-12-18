import { PlaybookType } from '../enums/playbook-type.enum';

export const DEFAULT_PLAYBOOKS = [
  {
    title: 'Quebra de Gelo (Ligação Fria)',
    category: 'Abordagem',
    type: PlaybookType.SCRIPT,
    content:
      'Olá [Nome], tudo bem? Aqui é o [Seu Nome] da TechFlow. Vi que você baixou nosso ebook sobre gestão e queria entender: hoje sua maior dificuldade é organizar a equipe ou escalar as vendas?',
    tips: 'Seja energético e espere a resposta. Não atropele.',
    isPrivate: false,
  },
  {
    title: "Contorno: 'Está muito caro'",
    category: 'Objeção',
    type: PlaybookType.SCRIPT,
    content:
      'Entendo perfeitamente, [Nome]. Mas se a gente dividir esse valor pelo número de horas que sua equipe perde hoje com processos manuais, o custo é menor que um café por dia. Você prefere economizar dinheiro ou ganhar tempo?',
    tips: 'Use tom de consultoria, não de defesa.',
    isPrivate: false,
  },
  {
    title: 'Fechamento Direto',
    category: 'Fechamento',
    type: PlaybookType.SCRIPT,
    content:
      'Faz sentido para você começarmos a implementação na próxima segunda-feira? Assim você já pega o ciclo de faturamento deste mês.',
    tips: 'Fale e cale-se. O primeiro que falar, perde.',
    isPrivate: false,
  },

  {
    title: 'Primeiro Contato (Indicação)',
    category: 'Prospecção',
    type: PlaybookType.WHATSAPP,
    content:
      'Olá {{nome}}, tudo bem? 👋\n\nMe chamo [Seu Nome], sou consultor na TechFlow. O {{indicador}} me passou seu contato e disse que você está buscando melhorar sua gestão.\n\nPodemos falar rapidinho?',
    isPrivate: false,
  },
  {
    title: 'Follow-up (Oi Sumido)',
    category: 'Acompanhamento',
    type: PlaybookType.WHATSAPP,
    content:
      'Oi {{nome}}, a correria deve estar grande por aí! 😅\n\nSó para não deixar o assunto esfriar: conseguiram avaliar a proposta? Estou segurando aquela condição especial até sexta.',
    isPrivate: false,
  },
  {
    title: 'Cobrança Amigável',
    category: 'Financeiro',
    type: PlaybookType.WHATSAPP,
    content:
      'Fala {{nome}}, bom dia!\n\nVi aqui que o boleto venceu ontem. Acontece! Precisa que eu reenvie ou prefere um Pix copia e cola? 👊',
    isPrivate: false,
  },
];
