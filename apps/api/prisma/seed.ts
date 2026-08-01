import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ===========================================
  // NEGOCIO
  // ===========================================

  const business = await prisma.business.upsert({
    where: { slug: 'salao-bela-demo' },
    update: {},
    create: {
      name: 'Salao Bela Demo',
      slug: 'salao-bela-demo',
      phone: '11950000001',
      email: 'contato@salaobeladodemo.com.br',
      type: 'SALON',
      status: 'ACTIVE',
      address: 'Rua Augusta, 1500',
      city: 'Sao Paulo',
      state: 'SP',
      zipCode: '01305-100',
    },
  });

  console.log('Business created:', business.name);

  // ===========================================
  // USUARIOS (login e apenas via OTP - sem senha)
  // ===========================================

  const owner = await prisma.user.upsert({
    where: { businessId_phone: { businessId: business.id, phone: '11988880001' } },
    update: {},
    create: {
      businessId: business.id,
      name: 'Camila Fernandes',
      phone: '11988880001',
      email: 'camila@salaobeladodemo.com.br',
      role: 'PROPRIETARIO',
    },
  });

  const admin = await prisma.user.upsert({
    where: { businessId_phone: { businessId: business.id, phone: '11988880002' } },
    update: {},
    create: {
      businessId: business.id,
      name: 'Patricia Gomes',
      phone: '11988880002',
      email: 'patricia@salaobeladodemo.com.br',
      role: 'ADMINISTRADOR',
    },
  });

  const professional1 = await prisma.user.upsert({
    where: { businessId_phone: { businessId: business.id, phone: '11988880003' } },
    update: {},
    create: {
      businessId: business.id,
      name: 'Juliana Ramos',
      phone: '11988880003',
      email: 'juliana@salaobeladodemo.com.br',
      role: 'PROFISSIONAL',
      color: '#a855f7',
      commission: 30,
    },
  });

  const professional2 = await prisma.user.upsert({
    where: { businessId_phone: { businessId: business.id, phone: '11988880004' } },
    update: {},
    create: {
      businessId: business.id,
      name: 'Marcos Vieira',
      phone: '11988880004',
      email: 'marcos@salaobeladodemo.com.br',
      role: 'PROFISSIONAL',
      color: '#ec4899',
      commission: 25,
    },
  });

  const receptionist = await prisma.user.upsert({
    where: { businessId_phone: { businessId: business.id, phone: '11988880005' } },
    update: {},
    create: {
      businessId: business.id,
      name: 'Beatriz Lima',
      phone: '11988880005',
      email: 'beatriz@salaobeladodemo.com.br',
      role: 'RECEPCIONISTA',
    },
  });

  console.log('Users created: owner, admin, 2 professionals, receptionist (login via OTP, sem senha)');

  // ===========================================
  // SERVICOS
  // ===========================================

  const serviceCorteFeminino = await prisma.service.upsert({
    where: { id: 'service-corte-feminino' },
    update: {},
    create: {
      id: 'service-corte-feminino',
      businessId: business.id,
      name: 'Corte Feminino',
      description: 'Corte e finalizacao',
      duration: 60,
      price: 80,
    },
  });

  const serviceManicure = await prisma.service.upsert({
    where: { id: 'service-manicure' },
    update: {},
    create: {
      id: 'service-manicure',
      businessId: business.id,
      name: 'Manicure',
      description: 'Cuidado completo das unhas das maos',
      duration: 45,
      price: 40,
    },
  });

  const serviceColoracao = await prisma.service.upsert({
    where: { id: 'service-coloracao' },
    update: {},
    create: {
      id: 'service-coloracao',
      businessId: business.id,
      name: 'Coloracao',
      description: 'Coloracao completa com produtos profissionais',
      duration: 120,
      price: 150,
    },
  });

  const serviceBarba = await prisma.service.upsert({
    where: { id: 'service-barba' },
    update: {},
    create: {
      id: 'service-barba',
      businessId: business.id,
      name: 'Barba',
      description: 'Aparar e desenhar a barba',
      duration: 30,
      price: 35,
    },
  });

  const serviceCorteMasculino = await prisma.service.upsert({
    where: { id: 'service-corte-masculino' },
    update: {},
    create: {
      id: 'service-corte-masculino',
      businessId: business.id,
      name: 'Corte Masculino',
      description: 'Corte masculino tradicional',
      duration: 40,
      price: 45,
    },
  });

  console.log('Services created: 5');

  await Promise.all([
    prisma.serviceProfessional.upsert({
      where: { serviceId_professionalId: { serviceId: serviceCorteFeminino.id, professionalId: professional1.id } },
      update: {},
      create: { serviceId: serviceCorteFeminino.id, professionalId: professional1.id },
    }),
    prisma.serviceProfessional.upsert({
      where: { serviceId_professionalId: { serviceId: serviceManicure.id, professionalId: professional1.id } },
      update: {},
      create: { serviceId: serviceManicure.id, professionalId: professional1.id },
    }),
    prisma.serviceProfessional.upsert({
      where: { serviceId_professionalId: { serviceId: serviceColoracao.id, professionalId: professional1.id } },
      update: {},
      create: { serviceId: serviceColoracao.id, professionalId: professional1.id },
    }),
    prisma.serviceProfessional.upsert({
      where: { serviceId_professionalId: { serviceId: serviceBarba.id, professionalId: professional2.id } },
      update: {},
      create: { serviceId: serviceBarba.id, professionalId: professional2.id },
    }),
    prisma.serviceProfessional.upsert({
      where: { serviceId_professionalId: { serviceId: serviceCorteMasculino.id, professionalId: professional2.id } },
      update: {},
      create: { serviceId: serviceCorteMasculino.id, professionalId: professional2.id },
    }),
  ]);

  console.log('Service-professional links created');

  // ===========================================
  // CLIENTES
  // ===========================================

  const client1 = await prisma.client.upsert({
    where: { businessId_phone: { businessId: business.id, phone: '11977770001' } },
    update: {},
    create: {
      businessId: business.id,
      name: 'Fernanda Alves',
      phone: '11977770001',
      email: 'fernanda@email.com',
      birthDate: new Date('1990-06-15'),
    },
  });

  const client2 = await prisma.client.upsert({
    where: { businessId_phone: { businessId: business.id, phone: '11977770002' } },
    update: {},
    create: {
      businessId: business.id,
      name: 'Roberto Dias',
      phone: '11977770002',
      email: 'roberto@email.com',
      birthDate: new Date('1985-11-02'),
    },
  });

  const client3 = await prisma.client.upsert({
    where: { businessId_phone: { businessId: business.id, phone: '11977770003' } },
    update: {},
    create: {
      businessId: business.id,
      name: 'Vanessa Martins',
      phone: '11977770003',
      email: 'vanessa@email.com',
      birthDate: new Date('1995-02-20'),
    },
  });

  console.log('Clients created: 3');

  // ===========================================
  // AGENDA / HORARIOS
  // ===========================================

  const weekdays: Array<'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY'> = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
  ];

  for (const day of weekdays) {
    const existingHours = await prisma.workingHours.findFirst({
      where: { businessId: business.id, professionalId: null, dayOfWeek: day },
    });
    if (!existingHours) {
      await prisma.workingHours.create({
        data: {
          businessId: business.id,
          professionalId: null,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '18:00',
          breakStart: '12:00',
          breakEnd: '13:00',
        },
      });
    }
  }

  await prisma.workingHours.upsert({
    where: { businessId_professionalId_dayOfWeek: { businessId: business.id, professionalId: professional1.id, dayOfWeek: 'SATURDAY' } },
    update: {},
    create: {
      businessId: business.id,
      professionalId: professional1.id,
      dayOfWeek: 'SATURDAY',
      startTime: '09:00',
      endTime: '14:00',
    },
  });

  console.log('Working hours created');

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const in2Days = new Date(now);
  in2Days.setDate(now.getDate() + 2);
  const in4Days = new Date(now);
  in4Days.setDate(now.getDate() + 4);

  function withTime(base: Date, hours: number, minutes: number): Date {
    const d = new Date(base);
    d.setHours(hours, minutes, 0, 0);
    return d;
  }

  const appt1 = await prisma.appointment.upsert({
    where: { id: 'appt-fernanda-corte' },
    update: {},
    create: {
      id: 'appt-fernanda-corte',
      businessId: business.id,
      clientId: client1.id,
      professionalId: professional1.id,
      serviceId: serviceCorteFeminino.id,
      startTime: withTime(yesterday, 10, 0),
      endTime: withTime(yesterday, 11, 0),
      status: 'COMPLETED',
      confirmedAt: withTime(yesterday, 9, 0),
    },
  });

  const appt2 = await prisma.appointment.upsert({
    where: { id: 'appt-roberto-barba' },
    update: {},
    create: {
      id: 'appt-roberto-barba',
      businessId: business.id,
      clientId: client2.id,
      professionalId: professional2.id,
      serviceId: serviceBarba.id,
      startTime: withTime(yesterday, 15, 0),
      endTime: withTime(yesterday, 15, 30),
      status: 'COMPLETED',
      confirmedAt: withTime(yesterday, 14, 0),
    },
  });

  await prisma.appointment.upsert({
    where: { id: 'appt-vanessa-manicure' },
    update: {},
    create: {
      id: 'appt-vanessa-manicure',
      businessId: business.id,
      clientId: client3.id,
      professionalId: professional1.id,
      serviceId: serviceManicure.id,
      startTime: withTime(in2Days, 14, 0),
      endTime: withTime(in2Days, 14, 45),
      status: 'CONFIRMED',
      confirmedAt: now,
    },
  });

  await prisma.appointment.upsert({
    where: { id: 'appt-fernanda-coloracao' },
    update: {},
    create: {
      id: 'appt-fernanda-coloracao',
      businessId: business.id,
      clientId: client1.id,
      professionalId: professional1.id,
      serviceId: serviceColoracao.id,
      startTime: withTime(in4Days, 10, 0),
      endTime: withTime(in4Days, 12, 0),
      status: 'PENDING',
    },
  });

  console.log('Appointments created: 4');

  // ===========================================
  // MENSAGENS
  // ===========================================

  await prisma.message.upsert({
    where: { id: 'msg-001' },
    update: {},
    create: {
      id: 'msg-001',
      businessId: business.id,
      clientId: client1.id,
      remoteJid: '5511977770001@s.whatsapp.net',
      direction: 'OUTBOUND',
      content: 'Ola Fernanda! Confirmando seu corte amanha as 10h.',
      status: 'DELIVERED',
      sentAt: yesterday,
      deliveredAt: yesterday,
    },
  });

  await prisma.message.upsert({
    where: { id: 'msg-002' },
    update: {},
    create: {
      id: 'msg-002',
      businessId: business.id,
      clientId: client1.id,
      remoteJid: '5511977770001@s.whatsapp.net',
      direction: 'INBOUND',
      content: 'Perfeito, ate amanha!',
      status: 'READ',
      sentAt: yesterday,
      readAt: yesterday,
    },
  });

  await prisma.messageTemplate.upsert({
    where: { businessId_type: { businessId: business.id, type: 'confirmation' } },
    update: {},
    create: {
      businessId: business.id,
      name: 'Confirmacao de Agendamento',
      type: 'confirmation',
      content: 'Ola {{client_name}}! Seu horario de {{service_name}} esta confirmado para {{date}} as {{time}}.',
    },
  });

  await prisma.messageTemplate.upsert({
    where: { businessId_type: { businessId: business.id, type: 'reminder' } },
    update: {},
    create: {
      businessId: business.id,
      name: 'Lembrete de Agendamento',
      type: 'reminder',
      content: 'Oi {{client_name}}, passando para lembrar do seu horario amanha as {{time}}.',
    },
  });

  await prisma.messageTemplate.upsert({
    where: { businessId_type: { businessId: business.id, type: 'welcome' } },
    update: {},
    create: {
      businessId: business.id,
      name: 'Boas-vindas',
      type: 'welcome',
      content: 'Bem-vinda ao {{business_name}}! Estamos felizes em ter voce como cliente.',
    },
  });

  console.log('Messages and templates created');

  // ===========================================
  // ANALYTICS
  // ===========================================

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyStats.upsert({
    where: { businessId_date: { businessId: business.id, date: today } },
    update: {},
    create: {
      businessId: business.id,
      date: today,
      totalAppointments: 4,
      confirmedCount: 2,
      completedCount: 2,
      totalRevenue: 115,
      newClients: 1,
      returningClients: 2,
      messagesSent: 1,
      messagesReceived: 1,
    },
  });

  console.log('Daily stats created');

  // ===========================================
  // AUTOMACAO
  // ===========================================

  async function findOrCreateAutomation(data: Parameters<typeof prisma.automation.create>[0]['data']) {
    const existing = await prisma.automation.findFirst({
      where: { businessId: data.businessId as string, type: data.type, serviceId: null },
    });
    if (existing) return existing;
    return prisma.automation.create({ data });
  }

  const automationPostAppt = await findOrCreateAutomation({
    businessId: business.id,
    type: 'POST_APPOINTMENT',
    delayHours: 2,
    template: 'Oi {{nome}}! Esperamos que tenha gostado do seu {{servico}}. Nos conta o que achou?',
  });

  await findOrCreateAutomation({
    businessId: business.id,
    type: 'RETURN_REMINDER',
    delayDays: 30,
    sendTime: '09:00',
    template: 'Oi {{nome}}! Ja faz um tempo desde o seu ultimo {{servico}}. Que tal agendar um novo horario?',
  });

  await findOrCreateAutomation({
    businessId: business.id,
    type: 'BIRTHDAY',
    sendTime: '08:00',
    template: 'Feliz aniversario, {{nome}}! Preparamos um mimo especial pra voce no salao.',
  });

  await findOrCreateAutomation({
    businessId: business.id,
    type: 'REACTIVATION',
    delayDays: 60,
    sendTime: '10:00',
    template: 'Sentimos sua falta, {{nome}}! Volte pra cuidar de voce com a gente.',
  });

  console.log('Automations created: 4');

  await prisma.automationLog.upsert({
    where: { id: 'automation-log-001' },
    update: {},
    create: {
      id: 'automation-log-001',
      automationId: automationPostAppt.id,
      clientId: client1.id,
      appointmentId: appt1.id,
      status: 'SENT',
      scheduledFor: withTime(yesterday, 13, 0),
      sentAt: withTime(yesterday, 13, 0),
    },
  });

  console.log('Automation log created');

  // ===========================================
  // LISTA DE ESPERA
  // ===========================================

  await prisma.waitlist.upsert({
    where: { id: 'waitlist-001' },
    update: {},
    create: {
      id: 'waitlist-001',
      businessId: business.id,
      clientId: client3.id,
      serviceId: serviceCorteFeminino.id,
      desiredDate: in2Days,
      desiredPeriod: 'AFTERNOON',
      status: 'WAITING',
    },
  });

  console.log('Waitlist entry created');

  // ===========================================
  // FINANCEIRO
  // ===========================================

  async function findOrCreateCommissionConfig(businessIdArg: string, professionalId: string, rate: number) {
    const existing = await prisma.commissionConfig.findFirst({
      where: { businessId: businessIdArg, professionalId, serviceId: null },
    });
    if (existing) return existing;
    return prisma.commissionConfig.create({ data: { businessId: businessIdArg, professionalId, rate } });
  }

  await findOrCreateCommissionConfig(business.id, professional1.id, 30);
  await findOrCreateCommissionConfig(business.id, professional2.id, 25);

  console.log('Commission configs created');

  const payment1 = await prisma.payment.upsert({
    where: { id: 'payment-001' },
    update: {},
    create: {
      id: 'payment-001',
      businessId: business.id,
      appointmentId: appt1.id,
      clientId: client1.id,
      professionalId: professional1.id,
      amount: 80,
      finalAmount: 80,
      method: 'PIX',
      status: 'COMPLETED',
      commissionRate: 30,
      commissionAmount: 24,
      businessAmount: 56,
      registeredById: receptionist.id,
      paidAt: yesterday,
    },
  });

  await prisma.payment.upsert({
    where: { id: 'payment-002' },
    update: {},
    create: {
      id: 'payment-002',
      businessId: business.id,
      appointmentId: appt2.id,
      clientId: client2.id,
      professionalId: professional2.id,
      amount: 35,
      finalAmount: 35,
      method: 'CASH',
      status: 'COMPLETED',
      commissionRate: 25,
      commissionAmount: 8.75,
      businessAmount: 26.25,
      registeredById: receptionist.id,
      paidAt: yesterday,
    },
  });

  console.log('Payments created: 2');

  const payoutPeriodStart = new Date(yesterday);
  payoutPeriodStart.setDate(payoutPeriodStart.getDate() - 15);

  await prisma.commissionPayout.upsert({
    where: { id: 'payout-001' },
    update: {},
    create: {
      id: 'payout-001',
      businessId: business.id,
      professionalId: professional1.id,
      totalAmount: 24,
      paymentCount: 1,
      periodStart: payoutPeriodStart,
      periodEnd: yesterday,
      paymentMethod: 'PIX',
      status: 'PAID',
      paidAt: yesterday,
      processedById: owner.id,
    },
  });

  console.log('Commission payout created');

  await prisma.cashRegister.upsert({
    where: { businessId_date: { businessId: business.id, date: today } },
    update: {},
    create: {
      businessId: business.id,
      date: today,
      pixTotal: 80,
      cashTotal: 35,
      totalRevenue: 115,
      totalCommissions: 32.75,
      businessProfit: 82.25,
      appointmentCount: 2,
    },
  });

  console.log('Cash register created');

  // ===========================================
  // MARKETING
  // ===========================================

  const campaign = await prisma.campaign.upsert({
    where: { id: 'campaign-001' },
    update: {},
    create: {
      id: 'campaign-001',
      businessId: business.id,
      name: 'Promocao Coloracao de Inverno',
      segmentType: 'VIP',
      message: 'Cliente especial, 15% OFF em coloracao esse mes. Agende ja!',
      status: 'COMPLETED',
      startedAt: yesterday,
      completedAt: yesterday,
      totalRecipients: 1,
      sentCount: 1,
      respondedCount: 1,
    },
  });

  await prisma.campaignRecipient.upsert({
    where: { campaignId_clientId: { campaignId: campaign.id, clientId: client1.id } },
    update: {},
    create: {
      campaignId: campaign.id,
      clientId: client1.id,
      sentAt: yesterday,
      deliveredAt: yesterday,
      readAt: yesterday,
      respondedAt: yesterday,
    },
  });

  console.log('Campaign created');

  await prisma.clientRating.upsert({
    where: { appointmentId: appt1.id },
    update: {},
    create: {
      businessId: business.id,
      clientId: client1.id,
      appointmentId: appt1.id,
      professionalId: professional1.id,
      rating: 5,
      comment: 'Adorei o corte, super atenciosa!',
      response: 'Muito obrigada, Fernanda! Ate a proxima :)',
      respondedAt: yesterday,
    },
  });

  console.log('Client rating created');

  // ===========================================
  // FIDELIDADE
  // ===========================================

  const loyaltyProgram = await prisma.loyaltyProgram.upsert({
    where: { businessId: business.id },
    update: {},
    create: {
      businessId: business.id,
      pointsPerReal: 1,
    },
  });

  const loyaltyPoints = await prisma.loyaltyPoints.upsert({
    where: { clientId: client1.id },
    update: {},
    create: {
      businessId: business.id,
      clientId: client1.id,
      currentPoints: 80,
      totalEarned: 80,
      currentTier: 'BRONZE',
    },
  });

  await prisma.loyaltyTransaction.upsert({
    where: { id: 'loyalty-tx-001' },
    update: {},
    create: {
      id: 'loyalty-tx-001',
      loyaltyPointsId: loyaltyPoints.id,
      type: 'EARNED',
      points: 80,
      balance: 80,
      appointmentId: appt1.id,
      description: 'Pontos por Corte Feminino',
    },
  });

  const loyaltyReward = await prisma.loyaltyReward.upsert({
    where: { id: 'loyalty-reward-001' },
    update: {},
    create: {
      id: 'loyalty-reward-001',
      programId: loyaltyProgram.id,
      name: '10% de desconto',
      description: 'Desconto de 10% em qualquer servico',
      pointsCost: 100,
      type: 'DISCOUNT_PERCENT',
      discountPercent: 10,
    },
  });

  console.log('Loyalty program, points, transaction and reward created');

  // ===========================================
  // ESTOQUE
  // ===========================================

  const productEsmalte = await prisma.product.upsert({
    where: { id: 'product-esmalte' },
    update: {},
    create: {
      id: 'product-esmalte',
      businessId: business.id,
      name: 'Esmalte OPI Vermelho',
      brand: 'OPI',
      category: 'RESALE',
      costPrice: 18,
      salePrice: 35,
      currentStock: 25,
      minStock: 5,
      unit: 'un',
    },
  });

  const productShampoo = await prisma.product.upsert({
    where: { id: 'product-shampoo-prof' },
    update: {},
    create: {
      id: 'product-shampoo-prof',
      businessId: business.id,
      name: 'Shampoo Profissional 1L',
      brand: 'Kerastase',
      category: 'INTERNAL_USE',
      costPrice: 60,
      currentStock: 8,
      minStock: 2,
      unit: 'un',
    },
  });

  console.log('Products created: 2');

  for (const product of [productEsmalte, productShampoo]) {
    const hasMovement = await prisma.stockMovement.findFirst({ where: { productId: product.id } });
    if (!hasMovement) {
      await prisma.stockMovement.create({
        data: {
          businessId: business.id,
          productId: product.id,
          type: 'PURCHASE',
          quantity: product.currentStock,
          previousStock: 0,
          newStock: product.currentStock,
          unitCost: product.costPrice,
          totalCost: Number(product.costPrice) * Number(product.currentStock),
          userId: owner.id,
          notes: 'Estoque inicial (seed)',
        },
      });
    }
  }

  console.log('Initial stock movements created');

  await prisma.serviceProduct.upsert({
    where: { serviceId_productId: { serviceId: serviceManicure.id, productId: productEsmalte.id } },
    update: {},
    create: {
      serviceId: serviceManicure.id,
      productId: productEsmalte.id,
      quantityUsed: 0.1,
    },
  });

  console.log('Service-product link created');

  // ===========================================
  // PERFIL PROFISSIONAL & GAMIFICACAO
  // ===========================================

  const profile1 = await prisma.professionalProfile.upsert({
    where: { userId: professional1.id },
    update: {},
    create: {
      userId: professional1.id,
      slug: 'juliana-ramos',
      bio: 'Especialista em coloracao e cortes femininos, 8 anos de experiencia.',
      specialties: ['Coloracao', 'Corte Feminino', 'Escova'],
      isPublic: true,
      referralCode: 'JULIANA10',
    },
  });

  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  await prisma.professionalGoal.upsert({
    where: {
      profileId_type_month_year: {
        profileId: profile1.id,
        type: 'REVENUE',
        month: currentMonth,
        year: currentYear,
      },
    },
    update: {},
    create: {
      profileId: profile1.id,
      businessId: business.id,
      type: 'REVENUE',
      targetValue: 5000,
      currentValue: 1250,
      month: currentMonth,
      year: currentYear,
      bonusAmount: 200,
    },
  });

  await prisma.professionalBadge.upsert({
    where: { id: 'badge-001' },
    update: {},
    create: {
      id: 'badge-001',
      profileId: profile1.id,
      type: 'RATING',
      name: '5 Estrelas',
      description: 'Recebeu uma avaliacao 5 estrelas',
      requirement: 'Avaliacao 5 estrelas',
      achievedValue: '5',
    },
  });

  await prisma.professionalRanking.upsert({
    where: {
      businessId_userId_month_year: {
        businessId: business.id,
        userId: professional1.id,
        month: currentMonth,
        year: currentYear,
      },
    },
    update: {},
    create: {
      businessId: business.id,
      userId: professional1.id,
      month: currentMonth,
      year: currentYear,
      revenue: 80,
      appointments: 1,
      newClients: 1,
      averageRating: 5,
      position: 1,
    },
  });

  await prisma.professionalRanking.upsert({
    where: {
      businessId_userId_month_year: {
        businessId: business.id,
        userId: professional2.id,
        month: currentMonth,
        year: currentYear,
      },
    },
    update: {},
    create: {
      businessId: business.id,
      userId: professional2.id,
      month: currentMonth,
      year: currentYear,
      revenue: 35,
      appointments: 1,
      newClients: 0,
      position: 2,
    },
  });

  console.log('Professional profile, goal, badge and ranking created');

  // ===========================================
  // MARKETING INTELIGENTE
  // ===========================================

  await prisma.marketingSuggestion.upsert({
    where: { id: 'suggestion-001' },
    update: {},
    create: {
      id: 'suggestion-001',
      businessId: business.id,
      type: 'EMPTY_SLOT',
      title: 'Horarios vagos na sexta-feira',
      description: 'Voce tem 4 horarios livres na sexta a tarde. Que tal uma promocao relampago?',
      suggestedAction: 'Criar campanha de ultima hora',
    },
  });

  await prisma.contentTemplate.upsert({
    where: { id: 'content-template-001' },
    update: {},
    create: {
      id: 'content-template-001',
      businessId: business.id,
      name: 'Promo de Inverno',
      category: 'PROMO',
      occasion: 'WINTER',
      content: 'Chegou o inverno! {{promo_percent}}% OFF em coloracao ate o fim do mes.',
      variables: ['promo_percent'],
    },
  });

  console.log('Marketing suggestion and content template created');

  console.log('Seed completed successfully!');
  console.log('');
  console.log('Tenant demo (apenas telefone + OTP - sem senha):');
  console.log('  PROPRIETARIO   11988880001 (Camila Fernandes)');
  console.log('  ADMINISTRADOR  11988880002 (Patricia Gomes)');
  console.log('  PROFISSIONAL   11988880003 (Juliana Ramos)');
  console.log('  PROFISSIONAL   11988880004 (Marcos Vieira)');
  console.log('  RECEPCIONISTA  11988880005 (Beatriz Lima)');
  console.log('  O codigo OTP fica salvo no Redis em otp:<telefone> mesmo se o WhatsApp nao entregar.');
}

// ===========================================
// ADMINISTRADOR DA PLATAFORMA (cross-tenant)
// ===========================================

async function seedPlatformAdmin() {
  const passwordHash = await bcrypt.hash('PlatformAdmin@2026!', 10);

  await prisma.platformAdmin.upsert({
    where: { email: 'admin@plataforma.bela360.com.br' },
    update: { passwordHash },
    create: {
      name: 'Admin Plataforma',
      email: 'admin@plataforma.bela360.com.br',
      passwordHash,
    },
  });

  console.log('Platform admin created: admin@plataforma.bela360.com.br (senha: PlatformAdmin@2026!)');
}

// ===========================================
// TENANTS ADICIONAIS (multi-tenant, isolamento)
// ===========================================

interface ExtraTenantConfig {
  slug: string;
  name: string;
  phone: string;
  email: string;
  type: 'SALON' | 'BARBERSHOP' | 'AESTHETICS' | 'SPA';
  city: string;
  state: string;
  ownerName: string;
  ownerPhone: string;
  serviceName: string;
  servicePrice: number;
  clientName: string;
  clientPhone: string;
}

async function seedExtraTenant(config: ExtraTenantConfig) {
  const business = await prisma.business.upsert({
    where: { slug: config.slug },
    update: {},
    create: {
      name: config.name,
      slug: config.slug,
      phone: config.phone,
      email: config.email,
      type: config.type,
      status: 'ACTIVE',
      city: config.city,
      state: config.state,
    },
  });

  const owner = await prisma.user.upsert({
    where: { businessId_phone: { businessId: business.id, phone: config.ownerPhone } },
    update: {},
    create: {
      businessId: business.id,
      name: config.ownerName,
      phone: config.ownerPhone,
      role: 'PROPRIETARIO',
    },
  });

  const service = await prisma.service.upsert({
    where: { id: `service-${config.slug}` },
    update: {},
    create: {
      id: `service-${config.slug}`,
      businessId: business.id,
      name: config.serviceName,
      duration: 45,
      price: config.servicePrice,
    },
  });

  const client = await prisma.client.upsert({
    where: { businessId_phone: { businessId: business.id, phone: config.clientPhone } },
    update: {},
    create: {
      businessId: business.id,
      name: config.clientName,
      phone: config.clientPhone,
    },
  });

  const startTime = new Date();
  startTime.setDate(startTime.getDate() + 2);
  startTime.setHours(10, 0, 0, 0);
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + 45);

  await prisma.appointment.upsert({
    where: { id: `appt-${config.slug}` },
    update: {},
    create: {
      id: `appt-${config.slug}`,
      businessId: business.id,
      clientId: client.id,
      professionalId: owner.id,
      serviceId: service.id,
      startTime,
      endTime,
      status: 'PENDING',
    },
  });

  console.log(`Tenant "${config.name}" criado (slug: ${config.slug}, owner: ${config.ownerPhone})`);
}

async function seedExtraTenants() {
  await seedExtraTenant({
    slug: 'barbearia-vintage',
    name: 'Barbearia Vintage',
    phone: '11966660001',
    email: 'contato@barbeariavintage.com.br',
    type: 'BARBERSHOP',
    city: 'Sao Paulo',
    state: 'SP',
    ownerName: 'Diego Martins',
    ownerPhone: '11966660002',
    serviceName: 'Corte + Barba',
    servicePrice: 70,
    clientName: 'Lucas Ferreira',
    clientPhone: '11966660003',
  });

  await seedExtraTenant({
    slug: 'studio-unhas-cia',
    name: 'Studio Unhas & Cia',
    phone: '11977760001',
    email: 'contato@studiounhasecia.com.br',
    type: 'AESTHETICS',
    city: 'Rio de Janeiro',
    state: 'RJ',
    ownerName: 'Larissa Nunes',
    ownerPhone: '11977760002',
    serviceName: 'Alongamento em Gel',
    servicePrice: 90,
    clientName: 'Patricia Souza',
    clientPhone: '11977760003',
  });

  await seedExtraTenant({
    slug: 'espaco-bella-hair',
    name: 'Espaco Bella Hair',
    phone: '11988860001',
    email: 'contato@espacobellahair.com.br',
    type: 'SPA',
    city: 'Belo Horizonte',
    state: 'MG',
    ownerName: 'Renata Castro',
    ownerPhone: '11988860002',
    serviceName: 'Hidratacao Profunda',
    servicePrice: 110,
    clientName: 'Amanda Torres',
    clientPhone: '11988860003',
  });
}

async function runAll() {
  await seedPlatformAdmin();
  await main();
  await seedExtraTenants();

  console.log('');
  console.log('=== RESUMO FINAL ===');
  console.log('Admin de Plataforma: admin@plataforma.bela360.com.br / PlatformAdmin@2026!');
  console.log('Tenant demo: salao-bela-demo (OTP, telefones acima)');
  console.log('Tenant 2: barbearia-vintage (owner OTP: 11966660002)');
  console.log('Tenant 3: studio-unhas-cia (owner OTP: 11977760002)');
  console.log('Tenant 4: espaco-bella-hair (owner OTP: 11988860002)');
}

runAll()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
