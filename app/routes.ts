import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  layout("layouts/unprotected.tsx", [
    index("routes/landing.tsx"),
    route("login", "routes/auth/login.tsx"),
    route("cadastro", "routes/auth/register.tsx"),
  ]),
  layout("layouts/protected.tsx", [
    layout("layouts/navbar.tsx", [
      // Home (dashboard -> medico, dashboard -> staff, )
      route("home", "routes/home.tsx"),
      // Pacientes (index, criar e :id)
      ...prefix("pacientes", [
        index("routes/pacientes/index.tsx"),
        route("criar", "routes/pacientes/new.tsx"),
        route(":id", "routes/pacientes/details.tsx"),
      ]),
      // Exames (solicitacoes/index, solicitacoes/criar solicitacoes/:id )
      ...prefix("exames", [
        index("routes/exames/index.tsx"),
        route("upload", "routes/exames/upload.tsx"),
        route(":id", "routes/exames/details.tsx"),
        ...prefix("solicitacoes", [
          index("routes/exames/solicitacoes/index.tsx"),
          route(":id", "routes/exames/solicitacoes/details.tsx"),
          route("criar", "routes/exames/solicitacoes/new.tsx"),
        ]),
      ]),
      // Laudos (index, :id,criar)
      ...prefix("laudos", [
        index("routes/laudos/index.tsx"),
        route(":id", "routes/laudos/details.tsx"),
        route("criar", "routes/laudos/new.tsx"),
        route("atualizar/:id", "routes/laudos/update.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
