import type { Route } from "./+types/landing";

import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion"; // Importando a framer-motion

export function meta({}: Route.MetaArgs) {
  return [
    { title: "MediScan" },
    { name: "description", content: "Telemedicina para Análise de Imagens" },
  ];
}

import {
  HeartPulse,
  FileText,
  Upload,
  FileCheck,
  LayoutDashboard,
  User,
  Building,
  Check,
  Stethoscope,
  Workflow,
  ClipboardCheck,
  KeyRound,
  UploadCloud,
  Activity,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

// --- Animação ---

// Efeito de "fade in" subindo
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

// Container para animar filhos em cascata (stagger)
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// Configurações da viewport para disparar a animação ao rolar
const viewportProps = {
  once: true,
  amount: 0.2,
};

const scrollToSection = (sectionId: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  const section = document.getElementById(sectionId);
  if (!section) return;

  // Offset para compensar o header fixo
  const headerOffset = 56; // altura do header em pixels
  const elementPosition = section.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });
};

/**
 * Seção: Header (Cabeçalho)
 */
const Header = () => (
  // Animação simples de fade-in no carregamento
  <motion.header
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
  >
    <div className="container mx-auto px-4 flex h-14 items-center justify-between flex-wrap">
      <Link to="/" className="flex items-center space-x-2">
        <HeartPulse className="h-6 w-6 text-primary" />
        <span className="font-bold text-xl">MediScan</span>
      </Link>
      <nav className="hidden items-center space-x-6 font-medium md:flex gap-6">
        <a
          href="#como-funciona"
          onClick={scrollToSection("como-funciona")}
          className="transition-colors hover:text-primary"
        >
          Como Funciona
        </a>
        <a
          href="#recursos"
          className="transition-colors hover:text-primary"
          onClick={scrollToSection("recursos")}
        >
          Recursos
        </a>
        <a
          href="#planos"
          className="transition-colors hover:text-primary"
          onClick={scrollToSection("planos")}
        >
          Planos
        </a>
      </nav>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" asChild>
          <Link to="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link to="/cadastro">Cadastro</Link>
        </Button>
      </div>
    </div>
  </motion.header>
);

/**
 * Seção: Hero (Principal)
 */
const Hero = () => (
  <section className="bg-gradient-to-b from-[#EFF6FF] to-[#FFFFFF]">
    <div className="container grid grid-cols-1 gap-12 py-20 md:grid-cols-2 md:py-32 px-4 mx-auto">
      {/* Coluna Esquerda: Texto (Animação em cascata) */}
      <motion.div
        className="flex flex-col justify-center space-y-6"
        initial="hidden"
        animate="visible"
        variants={staggerContainer} // Aplica a cascata
      >
        <motion.span
          variants={fadeInUp} // Anima cada filho
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary"
        >
          Telemedicina para
        </motion.span>
        <motion.h1
          variants={fadeInUp}
          className="text-4xl font-bold tracking-tighter text-blue-500 md:text-5xl lg:text-6xl"
        >
          Análise de Imagens
        </motion.h1>
        <motion.p
          variants={fadeInUp}
          className="max-w-[600px] text-lg text-muted-foreground"
        >
          Plataforma completa que conecta médicos, pacientes e clínicas para
          solicitação e análise de exames médicos com segurança e eficiência.
        </motion.p>
        <motion.div
          variants={fadeInUp}
          className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
        >
          <Button size="lg" asChild>
            <Link to="/cadastro">Começar Agora</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#como-funciona">Saber Mais</a>
          </Button>
        </motion.div>
      </motion.div>

      {/* Coluna Direita: Imagem (Slide-in da direita) */}
      <motion.div
        className="flex items-center justify-center"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      >
        <img
          className="object-cover h-full w-full shadow-xl rounded-2xl"
          src="landing_hero.jpg"
          alt="Dashboard da MediScan"
        />
      </motion.div>
    </div>
  </section>
);

/**
 * Seção: Como Funciona
 */
const HowItWorks = () => (
  <section id="como-funciona" className="w-full py-20 md:py-32">
    <div className="container space-y-12 px-4 mx-auto">
      <motion.div
        className="flex flex-col items-center justify-center space-y-4 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={viewportProps}
        variants={fadeInUp}
      >
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Como Funciona
        </h2>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Nossa plataforma simplifica todo o processo de análise de exames
          médicos.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-8 md:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={viewportProps}
        variants={staggerContainer}
      >
        {/* Item 1: Solicite Exames */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col items-center space-y-4 text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-theme1 text-theme1-foreground">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold">Solicite Exames</h3>
          <p className="text-muted-foreground">
            O médico solicita o exame e a plataforma é notificada, por email com
            todas as informações necessárias.
          </p>
        </motion.div>
        {/* Item 2: Clínicas Enviam */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col items-center space-y-4 text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-theme2 text-theme2-foreground">
            <Upload className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold">Clínicas Enviam</h3>
          <p className="text-muted-foreground">
            As clínicas parceiras realizam o exame e fazem upload do arquivo
            DICOM e laudo em texto.
          </p>
        </motion.div>
        {/* Item 3: Crie Laudos */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col items-center space-y-4 text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-theme1 text-theme1-foreground">
            <FileCheck className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold">Crie Laudos</h3>
          <p className="text-muted-foreground">
            Especialistas cadastrados criam os laudos detalhados que ficam
            disponíveis para o paciente.
          </p>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

/**
 * Seção: Recursos da Plataforma
 */
const Features = () => {
  const featuresList = [
    {
      icon: LayoutDashboard,
      color: "bg-theme1 text-theme1-foreground",
      title: "Dashboard de Gestão Médica",
      desc: "Acompanhe o status de todas as solicitações, veja quais exames aguardam resultado e gerencie seus pacientes facilmente.",
    },
    {
      icon: Workflow,
      color: "bg-theme2 text-theme2-foreground",
      title: "Fluxo de Exames Integrado",
      desc: "Conectamos médicos, pacientes e clínicas. Solicite exames, envie resultados e receba laudos, tudo em um único lugar.",
    },
    {
      icon: ClipboardCheck,
      color: "bg-theme1 text-theme1-foreground",
      title: "Plataforma de Laudagem Avançada",
      desc: "Médicos analisam imagens e criam laudos detalhados, com visualização prática dos exames e suporte opcional de IA.",
    },
    {
      icon: KeyRound,
      color: "bg-theme2 text-theme2-foreground",
      title: "Acesso Simplificado ao Paciente",
      desc: "Pacientes recebem um login automático por e-mail para acompanhar o status das solicitações e visualizar seus laudos.",
    },
    {
      icon: UploadCloud,
      color: "bg-theme1 text-theme1-foreground",
      title: "Envio Seguro por Código",
      desc: "Clínicas e laboratórios enviam os resultados dos exames de forma rápida e segura, usando apenas um código único por solicitação.",
    },
    {
      icon: Activity,
      color: "bg-theme2 text-theme2-foreground",
      title: "Acompanhamento em Tempo Real",
      desc: "Visualize o status de cada solicitação de exame instantaneamente, sabendo exatamente quando foi solicitado, enviado e laudado.",
    },
  ];

  return (
    <section
      id="recursos"
      className="w-full py-20 md:py-32 bg-gradient-to-b from-[#EFF6FF] to-[#FFFFFF]"
    >
      <div className="container px-4 mx-auto space-y-12">
        {/* Título da Seção */}
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={viewportProps}
          variants={fadeInUp}
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Recursos da Plataforma
          </h2>
          <p className="max-w-[700px] text-lg text-muted-foreground">
            Funcionalidades poderosas para focar no seu trabalho.
          </p>
        </motion.div>

        {/* Grid de Cards (Animação em cascata) */}
        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={viewportProps}
          variants={staggerContainer}
        >
          {featuresList.map((feature, index) => (
            // Envolve o Card com motion.div para aplicar a animação da variante
            <motion.div key={index} variants={fadeInUp}>
              <Card className="h-full">
                <CardHeader>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${feature.color}`}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="pt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

/**
 * Seção: Para Quem é a Plataforma
 */
const TargetAudience = () => (
  <section id="planos" className="w-full py-20 md:py-32">
    <div className="container mx-auto px-4 space-y-12">
      {/* Título da Seção */}
      <motion.div
        className="flex flex-col items-center justify-center space-y-4 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={viewportProps}
        variants={fadeInUp}
      >
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Para Quem é a Plataforma ?
        </h2>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Solução completa para todo o ecossistema de processamento de análise
          de imagens médicas.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-8 md:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={viewportProps}
        variants={staggerContainer}
      >
        {/* Card: Médicos */}
        <motion.div variants={fadeInUp}>
          <Card className="flex flex-col h-full hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-theme1 text-theme1-foreground">
                <Stethoscope className="h-6 w-6" />
              </div>
              <CardTitle className="mt-4">Médicos</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              <li className="flex items-start space-x-2">
                <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                <span className="text-muted-foreground">
                  Solicitar exames facilmente
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                <span className="text-muted-foreground">
                  Centralizar laudos
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                <span className="text-muted-foreground">
                  Gestão de pacientes
                </span>
              </li>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card: Clínicas (Destaque) */}
        <motion.div variants={fadeInUp}>
          <Card className="flex flex-col h-full hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-theme2 text-theme2-foreground">
                <Building className="h-6 w-6" />
              </div>
              <CardTitle className="mt-4">Clínicas</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              <li className="flex items-start space-x-2">
                <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                <span className="text-muted-foreground">
                  Validação segura por código único
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                <span className="text-muted-foreground">
                  Submissão com 1-click
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                <span className="text-muted-foreground">
                  Interface focada em upload
                </span>
              </li>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card: Pacientes */}
        <motion.div variants={fadeInUp}>
          <Card className="flex flex-col h-full hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-theme1 text-theme1-foreground">
                <User className="h-6 w-6" />
              </div>
              <CardTitle className="mt-4">Pacientes</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              <li className="flex items-start space-x-2">
                <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                <span className="text-muted-foreground">Ver seus exames</span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                <span className="text-muted-foreground">
                  Acessar seus laudos
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                <span className="text-muted-foreground">
                  Login automático por e-mail
                </span>
              </li>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

/**
 * Seção: CTA
 */
const CTA = () => (
  <section className="w-full bg-primary text-primary-foreground py-20 md:py-32">
    <div className="container mx-auto p-4 text-center flex flex-col items-center space-y-6">
      <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
        Pronto para começar?
      </h2>
      <p className="max-w-[600px] text-lg text-primary-foreground/80">
        Cadastre-se agora e transforme a forma como você gerencia exames
        médicos.
      </p>
      <Button size="lg" variant="secondary" className="p-8" asChild>
        <Link to="/cadastro">
          <p className="text-lg">Criar Conta Gratuita</p>
        </Link>
      </Button>
    </div>
  </section>
);

/**
 * Seção: Footer  */
const Footer = () => (
  <footer className="w-full bg-gray-900 text-gray-400 py-12">
    <div className="container mx-auto p-4 mt-8 pt-8 border-t border-gray-800 text-center text-sm">
      <p>&copy; 2025 MediScan. Todos os direitos reservados.</p>
    </div>
  </footer>
);

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <TargetAudience />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
