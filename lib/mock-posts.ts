import type { Post } from "./types"

export const mockPosts: Post[] = [
  {
    id: 1,
    title: "Cómo Aprender TypeScript en 2024",
    excerpt: "Guía completa para dominar TypeScript desde cero",
    image: "/placeholder-post-image.jpeg",
    tags: ["programación", "typescript", "web development"],
    likes: 45,
    comments: 12,
    content: `
      <h2>Tipado Estático en TypeScript</h2>
      <pre><code class="language-typescript">
      interface Usuario {
        id: number;
        nombre: string;
        email: string;
        roles: string[];
      }
      
      function crearUsuario(usuario: Usuario): void {
        console.log('Creando usuario:', usuario.nombre);
      }
      </code></pre>
    `,
    author: {
      id: "usr-001",
      name: "Carlos Martínez",
      avatar: "/placeholder-post-image.jpeg",
    },
    coverImage: "/placeholder-post-image.jpeg",
    date: "2024-03-15",
    publishDate: "2024-03-15",
    readTime: 8,
  },
  {
    id: 2,
    title: "Mejores Prácticas de React en 2024",
    excerpt: "Optimiza tus componentes React con estas técnicas",
    image: "/placeholder-post-image.jpeg",
    tags: ["react", "frontend", "javascript"],
    likes: 89,
    comments: 24,
    content: `
      <h2>Custom Hook para Fetching</h2>
      <pre><code class="language-jsx">
      function useFetch(url) {
        const [data, setData] = useState(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
          fetch(url)
            .then(res => res.json())
            .then(data => {
              setData(data);
              setLoading(false);
            });
        }, [url]);

        return { data, loading };
      }
      </code></pre>
    `,
    author: {
      id: "usr-002",
      name: "Ana López",
      avatar: "/placeholder-post-image.jpeg",
    },
    coverImage: "/placeholder-post-image.jpeg",
    date: "2024-04-02",
    publishDate: "2024-04-02",
    readTime: 6,
  },
  {
    id: 3,
    title: "Guía de Accesibilidad Web",
    excerpt: "Cómo crear sitios inclusivos para todos los usuarios",
    image: "/placeholder-post-image.jpeg",
    tags: ["accesibilidad", "web", "buenas prácticas"],
    likes: 34,
    comments: 8,
    content: `
      <h2>Uso de ARIA Labels</h2>
      <pre><code class="language-html">
      &lt;button 
        aria-label="Cerrar menú"
        class="icon-close" 
        onclick="closeMenu()"&gt;
      &lt;/button&gt;
      </code></pre>
    `,
    author: {
      id: "usr-003",
      name: "Pedro Sánchez",
      avatar: "/placeholder-post-image.jpeg",
    },
    coverImage: "/placeholder-post-image.jpeg",
    date: "2024-04-18",
    publishDate: "2024-04-18",
    readTime: 10,
  },
  {
    id: 4,
    title: "Introducción a Next.js 14",
    excerpt: "Novedades y características principales",
    image: "/placeholder-post-image.jpeg",
    tags: ["nextjs", "react", "ssr"],
    likes: 127,
    comments: 45,
    content: `
      <h2>Generación de Rutas Estáticas</h2>
      <pre><code class="language-jsx">
      export async function getStaticProps() {
        const res = await fetch('https://api.example.com/posts');
        const posts = await res.json();

        return {
          props: { posts },
          revalidate: 60 
        };
      }
      </code></pre>
    `,
    author: {
      id: "usr-004",
      name: "Marta Rodríguez",
      avatar: "/placeholder-post-image.jpeg",
    },
    coverImage: "/placeholder-post-image.jpeg",
    date: "2024-05-01",
    publishDate: "2024-05-01",
    readTime: 12,
  },
  {
    id: 5,
    title: "Patrones de Diseño en JavaScript",
    excerpt: "Principales patrones para código mantenible",
    image: "/placeholder-post-image.jpeg",
    tags: ["javascript", "patrones", "programación"],
    likes: 67,
    comments: 19,
    content: `
      <h2>Implementación de Singleton</h2>
      <pre><code class="language-javascript">
      class DatabaseConnection {
        static instance = null;
        
        constructor() {
          if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = this;
          }
          return DatabaseConnection.instance;
        }
      }
      </code></pre>
    `,
    author: {
      id: "usr-005",
      name: "Javier Gómez",
      avatar: "/placeholder-post-image.jpeg",
    },
    coverImage: "/placeholder-post-image.jpeg",
    date: "2024-05-12",
    publishDate: "2024-05-12",
    readTime: 9,
  },
  {
    id: 6,
    title: "Optimización de API REST",
    excerpt: "Técnicas para mejorar el rendimiento de tus APIs",
    image: "/placeholder-post-image.jpeg",
    tags: ["backend", "api", "rendimiento"],
    likes: 92,
    comments: 31,
    content: `
      <h2>Implementación de Cache con Redis</h2>
      <pre><code class="language-javascript">
      const redis = require('redis');
      const client = redis.createClient();

      async function cacheMiddleware(req, res, next) {
        const key = req.originalUrl;
        const data = await client.get(key);
        
        if (data) {
          return res.json(JSON.parse(data));
        }
        
        next();
      }
      </code></pre>
    `,
    author: {
      id: "usr-006",
      name: "Laura Fernández",
      avatar: "/placeholder-post-image.jpeg",
    },
    coverImage: "/placeholder-post-image.jpeg",
    date: "2024-05-25",
    publishDate: "2024-05-25",
    readTime: 11,
  },
  {
    id: 7,
    title: "GraphQL vs REST",
    excerpt: "Comparativa detallada de ambas tecnologías",
    image: "/placeholder-post-image.jpeg",
    tags: ["graphql", "api", "comparativas"],
    likes: 78,
    comments: 22,
    content: `
      <h2>Query Básica en GraphQL</h2>
      <pre><code class="language-graphql">
      query GetUser($id: ID!) {
        user(id: $id) {
          name
          email
          posts {
            title
            createdAt
          }
        }
      }
      </code></pre>
    `,
    author: {
      id: "usr-007",
      name: "Diego Pérez",
      avatar: "/placeholder-post-image.jpeg",
    },
    coverImage: "/placeholder-post-image.jpeg",
    date: "2024-06-07",
    publishDate: "2024-06-07",
    readTime: 7,
  },
  {
    id: 8,
    title: "Seguridad en Aplicaciones Web",
    excerpt: "Principales vulnerabilidades y cómo evitarlas",
    image: "/placeholder-post-image.jpeg",
    tags: ["seguridad", "web", "OWASP"],
    likes: 115,
    comments: 38,
    content: `
      <h2>Sanitización de Inputs</h2>
      <pre><code class="language-javascript">
      function sanitizeInput(input) {
        return input.replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;')
                   .replace(/"/g, '&quot;');
      }
      </code></pre>
    `,
    author: {
      id: "usr-008",
      name: "Sofía Castro",
      avatar: "/placeholder-post-image.jpeg",
    },
    coverImage: "/placeholder-post-image.jpeg",
    date: "2024-06-15",
    publishDate: "2024-06-15",
    readTime: 14,
  },
  {
    id: 9,
    title: "Introducción a Deno",
    excerpt: "El runtime de JavaScript moderno",
    image: "/placeholder-post-image.jpeg",
    tags: ["deno", "javascript", "backend"],
    likes: 56,
    comments: 15,
    content: `
      <h2>Servidor HTTP Básico</h2>
      <pre><code class="language-typescript">
      import { serve } from "https://deno.land/std/http/server.ts";

      const handler = (request: Request) => {
        return new Response("Hola desde Deno!");
      };

      serve(handler, { port: 8000 });
      </code></pre>
    `,
    author: {
      id: "usr-009",
      name: "Raúl Navarro",
      avatar: "/placeholder-post-image.jpeg",
    },
    coverImage: "/placeholder-post-image.jpeg",
    date: "2024-06-22",
    publishDate: "2024-06-22",
    readTime: 8,
  },
  {
    id: 10,
    title: "Testing con Jest y React",
    excerpt: "Guía completa de testing en aplicaciones React",
    image: "/placeholder-post-image.jpeg",
    tags: ["testing", "react", "jest"],
    likes: 142,
    comments: 52,
    content: `
      <h2>Prueba de Componente</h2>
      <pre><code class="language-jsx">
      test('Renderiza el componente correctamente', () => {
        const { getByText } = render(&lt;Welcome name="Ana" /&gt;);
        expect(getByText('Hola Ana!')).toBeInTheDocument();
      });

      test('Maneja clic en botón', () => {
        const mockFn = jest.fn();
        const { getByRole } = render(&lt;Button onClick={mockFn}&gt;Click&lt;/Button&gt;);
        fireEvent.click(getByRole('button'));
        expect(mockFn).toHaveBeenCalledTimes(1);
      });
      </code></pre>
    `,
    author: {
      id: "usr-010",
      name: "Elena Morales",
      avatar: "/placeholder-post-image.jpeg",
    },
    coverImage: "/placeholder-post-image.jpeg",
    date: "2024-07-01",
    publishDate: "2024-07-01",
    readTime: 15,
  },
]

export function getRecommendedPosts(): Post[] {
  return [...mockPosts].sort((a, b) => b.likes - a.likes).slice(0, 3)
}

