'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Bug, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-background px-4">
      <div className="text-center max-w-2xl mx-auto">
        <motion.h1
          className="text-6xl font-extrabold text-primary mb-6"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          404
        </motion.h1>
        <motion.div
          className="relative inline-block mb-6"
          initial={{ y: 0 }}
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Bug className="text-primary w-24 h-24" aria-label="Bug icon" />
        </motion.div>

        <motion.h2
          className="text-2xl font-semibold mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Esta página no existe, ¡Oops!
        </motion.h2>
        <motion.p
          className="text-lg text-muted-foreground mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          No te preocupes, a veces los errores suceden.
          Mientras tanto, ¿por qué no intentas una de estas opciones?
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Volver al inicio
            </Link>
          </Button>
          <Button variant="outline" size="lg" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Página anterior
          </Button>
        </motion.div>
        <motion.p
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          Si crees que esto es un error, por favor{' '}
          <Link href="/contact" className="text-primary hover:underline">
            contáctanos
          </Link>
          .
        </motion.p>
      </div>
    </div>
  );
}

