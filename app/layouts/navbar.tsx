import { HeartPulse, LogOut, User } from "lucide-react";
import { Link, Outlet, useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import useAuth from "~/hooks/useAuth";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50">
      {/* --- Navbar --- */}
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/home" className="flex items-center space-x-2">
            <img src="./name_logo2.png" className="w-48 h-10 object-cover" />
          </Link>

          <div className="flex items-center space-x-4">
            {/* Informações do Perfil */}
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar ?? ""} alt="" />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium leading-none">
                  {user && user.nome}
                </span>
                <span className="text-xs leading-none text-muted-foreground">
                  {user && user.email}
                </span>
              </div>
            </div>

            {/* Botão de Logout */}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* --- Conteúdo da Página --- */}
      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
