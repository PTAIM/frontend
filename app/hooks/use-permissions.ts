import type { UserType } from "~/types/auth";
import useAuth from "./useAuth";

export function usePermissions() {
  const { user } = useAuth();

  const hasRole = (roles: UserType | UserType[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.tipo);
  };

  const can = (action: string, resource: string): boolean => {
    if (!user) return false;

    const permissions: Record<UserType, Record<string, string[]>> = {
      medico: {
        pacientes: ["create", "read", "delete"],
        solicitacoes: ["create", "read", "update", "delete"],
        laudos: ["create", "read", "update", "delete"],
        exames: ["read"],
      },
      paciente: {
        solicitacoes: ["read"],
        laudos: ["read"],
        exames: ["read"],
      },
      funcionario: {
        exames: ["create", "read", "delete"],
      },
    };

    const userPermissions = permissions[user.tipo]?.[resource] || [];
    return userPermissions.includes(action);
  };

  return {
    hasRole,
    can,
    isMedico: user?.tipo === "medico",
    isPaciente: user?.tipo === "paciente",
    isFuncionario: user?.tipo === "funcionario",
  };
}
