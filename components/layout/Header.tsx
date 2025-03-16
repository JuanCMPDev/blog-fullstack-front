"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon, Sun, Search, Code } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { UserMenu } from "@/components/auth/UserMenu";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const pathname = usePathname();
  const { user } = useAuth(); // Estado global del usuario
  const router = useRouter();
  
  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  if (!mounted) {
    return (
      <header className="h-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Placeholder */}
          </div>
        </div>
      </header>
    );
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? "bg-background/80 backdrop-blur-sm shadow-md"
          : "bg-background"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Code className="h-8 w-8 text-primary" />
            </motion.div>
            <span className="text-2xl font-bold text-foreground">
              JCDev<span className="text-primary">Blog</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {["Inicio", "Ejercicios", "Contacto"].map((item) => {
              const routeMap = {
                Inicio: "/",
                Ejercicios: "/exercises",
                Contacto: "/contact",
              };
              const route = routeMap[item as keyof typeof routeMap];
              return (
                <Link
                  key={item}
                  href={route}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(route) ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <Input
                type="search"
                placeholder="Buscar..."
                className="w-[200px] pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </form>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="hidden md:inline-flex"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {user ? (
              <div className="hidden md:inline-flex">
                {/* Asegurarse de pasar usuario completo con role y roleAsString */}
                <UserMenu user={{
                  name: user.name,
                  email: user.email,
                  avatar: user.avatar,
                  nick: user.nick,
                  role: user.roleAsString || user.role, // Usar roleAsString si disponible, sino role
                }} />
              </div>
            ) : (
              <div className="hidden md:flex space-x-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/signin">Iniciar sesión</Link>
                </Button>
                <Button asChild variant="default" size="sm">
                  <Link href="/signup">Registrarse</Link>
                </Button>
              </div>
            )}

            <MobileMenu theme={theme} setTheme={setTheme} user={user} />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
