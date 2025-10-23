import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "MediScan" },
    { name: "description", content: "Telemedicina para Análise de Imagens" },
  ];
}

export default function Home() {
  return <section></section>;
}
