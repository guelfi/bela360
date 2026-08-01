import Link from 'next/link';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1695527081848-1e46c06e6458?auto=format&fit=crop&w=1200&q=80';
const FEATURE_IMAGE_1 =
  'https://images.unsplash.com/photo-1660505102581-85cffa4e6550?auto=format&fit=crop&w=800&q=80';
const FEATURE_IMAGE_2 =
  'https://images.unsplash.com/photo-1626383137804-ff908d2753a2?auto=format&fit=crop&w=1400&q=80';

const FEATURES = [
  {
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    title: 'Agenda que nao deixa furo',
    description:
      'Horarios organizados por profissional, confirmacao automatica e lista de espera pra nunca deixar um horario vago.',
  },
  {
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    title: 'Lembrete automatico no WhatsApp',
    description:
      'Sua cliente recebe o lembrete do horario sozinha, sem voce precisar mandar mensagem uma por uma.',
  },
  {
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    title: 'Fidelidade que traz cliente de volta',
    description:
      'Pontos por visita, recompensas e um motivo a mais pra ela voltar no seu salao em vez de experimentar outro.',
  },
  {
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    title: 'Estoque sob controle',
    description:
      'Saiba quando o produto ta acabando antes que ele acabe de verdade, sem planilha e sem susto.',
  },
  {
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    title: 'Financeiro sem mistério',
    description:
      'Quanto entrou, quanto saiu e quanto cada profissional rendeu no mes - tudo num lugar so, sem calculadora.',
  },
  {
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    title: 'Toda a equipe, um so sistema',
    description:
      'Cada profissional ve so a propria agenda e comissao; voce ve o salao inteiro. Sem confusao, sem planilha compartilhada.',
  },
];

const STEPS = [
  {
    number: '1',
    title: 'Cadastre seu negocio',
    description: 'Nome do salao e seu telefone. Menos de 2 minutos, sem cartao de credito.',
  },
  {
    number: '2',
    title: 'Configure equipe e servicos',
    description: 'Adicione seus profissionais, servicos e horarios de funcionamento.',
  },
  {
    number: '3',
    title: 'Comece a atender',
    description: 'Sua agenda ja esta pronta pra receber o primeiro agendamento.',
  },
];

const NAV_LINKS = [
  { label: 'Inicio', href: '#hero' },
  { label: 'Recursos', href: '#recursos' },
  { label: 'Como Usar', href: '#como-usar' },
  { label: 'Contato', href: '#footer' },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav fixo */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-6">
          <a href="#hero" className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent shrink-0">
            bela360
          </a>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-primary font-medium text-sm transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="text-gray-600 hover:text-primary font-medium text-sm"
            >
              Entrar
            </Link>
            <Link
              href="/onboarding"
              className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Cadastre seu negocio
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 pt-16 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Sua agenda cheia.
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Sua cabeca livre.
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              O bela360 organiza agenda, clientes, financeiro e WhatsApp do seu salao ou
              barbearia num so lugar - pra voce parar de administrar planilha e voltar a
              cuidar de gente.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/onboarding"
                className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
              >
                Cadastre seu negocio gratis
              </Link>
              <Link
                href="/login"
                className="bg-white text-primary px-8 py-4 rounded-lg font-semibold border border-primary/20 hover:bg-primary/5 transition-colors"
              >
                Ja tenho conta
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl aspect-[4/5]">
              <img
                src={HERO_IMAGE}
                alt="Profissional de beleza atendendo cliente em salao"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="max-w-6xl mx-auto px-4 py-20 scroll-mt-16">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Tudo que o seu negocio precisa, em um so lugar
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Sem planilha, sem caderno, sem sistema separado pra cada coisa.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Como Usar (banner de imagem + 3 passos, uma so secao) */}
      <section id="como-usar" className="scroll-mt-16">
        <div className="h-64 md:h-96 relative overflow-hidden">
          <img
            src={FEATURE_IMAGE_2}
            alt="Interior de salao de beleza organizado"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-secondary/50 flex items-center">
            <div className="max-w-6xl mx-auto px-4 w-full">
              <p className="text-white text-2xl md:text-3xl font-semibold max-w-lg">
                Feito pro ritmo de quem vive de agenda cheia e cliente satisfeita.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Comece em 3 passos</h2>
            <p className="text-gray-600">Do cadastro ao primeiro agendamento, sem complicacao.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {STEPS.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary text-white text-xl font-bold flex items-center justify-center mb-5">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Secondary showcase */}
      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="rounded-2xl overflow-hidden shadow-xl order-2 md:order-1">
            <img
              src={FEATURE_IMAGE_1}
              alt="Mesa de manicure organizada em salao de beleza"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Menos tempo administrando, mais tempo atendendo
            </h2>
            <p className="text-gray-600 mb-6">
              O bela360 foi pensado pra quem toca o salao no dia a dia - simples de usar entre
              um atendimento e outro, direto do celular ou do computador do balcao.
            </p>
            <Link
              href="/onboarding"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Quero organizar meu salao
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-primary to-secondary">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronta pra parar de administrar no caderno?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">
            Cadastre seu negocio agora e comece a usar o bela360 hoje mesmo.
          </p>
          <Link
            href="/onboarding"
            className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-colors shadow-lg"
          >
            Cadastre seu negocio gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-gray-900 text-white py-16 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Marca */}
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                bela360
              </span>
              <p className="text-gray-400 mt-4 mb-6">
                Automacao para negocios de beleza.
              </p>
              {/* TODO: trocar pelos links reais das redes sociais do bela360 */}
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Produto */}
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#recursos" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#como-usar" className="hover:text-white transition-colors">Como Usar</a></li>
                <li><Link href="/onboarding" className="hover:text-white transition-colors">Cadastre seu negocio</Link></li>
              </ul>
            </div>

            {/* Empresa */}
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Parceiros</a></li>
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              {/* TODO: trocar pelos dados reais de contato do bela360 */}
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>contato@bela360.com.br</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>(11) 99999-9999</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>Sao Paulo, Brasil</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              2026 bela360. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
