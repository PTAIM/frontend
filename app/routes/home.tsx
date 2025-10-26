import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "MediScan" },
    { name: "description", content: "Telemedicina para Análise de Imagens" },
  ];
}

export default function Home() {
  return (
    <section className="flex flex-col justify-center items-center my-8 mx-auto min-h-screen w-full">
      <h1>Home Page</h1>
    </section>
  );
}
