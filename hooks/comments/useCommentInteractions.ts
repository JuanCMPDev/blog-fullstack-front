import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@/lib/customFetch";
import { useAuth } from "@/lib/auth";
import type { Comment } from "@/lib/types";

interface UseCommentInteractionsProps {
  postId: number | null;
  getBaseApiUrl: () => string;
  updateCommentRecursively: (comments: Comment[], commentId: string, updateFn: (comment: Comment) => Comment) => Comment[];
  removeCommentRecursively: (comments: Comment[], commentId: string) => Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  setReplyingTo: React.Dispatch<React.SetStateAction<string | null>>;
  setReplyContent: React.Dispatch<React.SetStateAction<string>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Hook para operaciones de interacción con comentarios (like, respuesta, eliminación)
 */
export function useCommentInteractions({
  postId,
  getBaseApiUrl,
  updateCommentRecursively,
  removeCommentRecursively,
  setComments,
  setReplyingTo,
  setReplyContent,
  setIsLoading
}: UseCommentInteractionsProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  // Asegurar que cada comentario tenga la estructura correcta
  const ensureCommentStructure = useCallback((comment: Partial<Comment>): Comment => {
    if (!comment || typeof comment !== 'object') {
      // Si el comentario no es un objeto válido, devolver un objeto con estructura segura
      return {
        id: Math.random().toString(),
        author: {
          id: 'unknown',
          name: 'Usuario desconocido',
          avatar: ''
        },
        content: '',
        likes: 0,
        replies: [],
        createdAt: new Date().toISOString(),
        postId: undefined
      };
    }
  
    // Asegurar que el autor sea un objeto válido
    const author = comment.author && typeof comment.author === 'object' 
      ? {
          id: comment.author.id || 'unknown',
          name: comment.author.name || 'Usuario',
          avatar: comment.author.avatar || ''
        }
      : {
          id: 'unknown',
          name: 'Usuario',
          avatar: ''
        };
  
    // Devolver un comentario con todas las propiedades seguras
    return {
      ...comment as Partial<Comment>,
      id: comment.id || Math.random().toString(),
      author,
      content: typeof comment.content === 'string' ? comment.content : '',
      likes: typeof comment.likes === 'number' ? comment.likes : 0,
      replies: Array.isArray(comment.replies) 
        ? comment.replies.map(r => ensureCommentStructure(r as Partial<Comment>)) 
        : [],
      createdAt: comment.createdAt || new Date().toISOString(),
      postId: comment.postId || undefined
    };
  }, []);

  // Dar/quitar like a un comentario
  const handleLike = useCallback(async (commentId: string) => {
    if (!user) {
      toast({
        title: "Inicio de sesión requerido",
        description: "Debes iniciar sesión para dar like.",
        variant: "destructive",
      });
      return;
    }

    try {
      const apiUrl = getBaseApiUrl();
      const response = await customFetch(`${apiUrl}/likes/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId }),
      });
      
      if (!response.ok) {
        throw new Error(`Error al procesar like: ${response.statusText}`);
      }
      
      const responseJson = await response.json();
      
      // Extraer solo los valores que necesitamos de la respuesta
      let likesCount = 0;
      let liked = false;
      
      // Verificar qué estructura tiene la respuesta
      if (responseJson && typeof responseJson === 'object') {
        // Estructura de respuesta directa: { liked: boolean, likesCount: number }
        if (typeof responseJson.likesCount === 'number') {
          likesCount = responseJson.likesCount;
        } else if (typeof responseJson.count === 'number') {
          likesCount = responseJson.count;
        }
        
        if (typeof responseJson.liked === 'boolean') {
          liked = responseJson.liked;
        }
        
        // Estructura con data: { data: { liked: boolean, likesCount: number } }
        if (responseJson.data && typeof responseJson.data === 'object') {
          if (typeof responseJson.data.likesCount === 'number') {
            likesCount = responseJson.data.likesCount;
          } else if (typeof responseJson.data.count === 'number') {
            likesCount = responseJson.data.count;
          }
          
          if (typeof responseJson.data.liked === 'boolean') {
            liked = responseJson.data.liked;
          }
        }
      }
      
      // Actualizar el estado de comentarios con los valores extraídos
      setComments(prevComments => 
        updateCommentRecursively(prevComments, commentId, comment => ({
          ...comment,
          likes: likesCount,
          hasLiked: liked
        }))
      );
    } catch (error) {
      console.error('Error al dar like al comentario:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar el like. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    }
  }, [user, getBaseApiUrl, toast, setComments, updateCommentRecursively]);

  // Responder a un comentario
  const handleReply = useCallback((commentId: string) => {
    if (!user) {
      toast({
        title: "Inicio de sesión requerido",
        description: "Debes iniciar sesión para responder.",
        variant: "destructive",
      });
      return;
    }
    setReplyingTo(commentId);
    setReplyContent("");
  }, [user, toast, setReplyingTo, setReplyContent]);

  // Enviar una respuesta a un comentario
  const submitReply = useCallback(async (replyingTo: string | null, replyContent: string) => {
    if (!user || !replyingTo || !replyContent.trim() || !postId) {
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = getBaseApiUrl();
      const response = await customFetch(`${apiUrl}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyContent.trim(),
          postId,
          parentId: replyingTo
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error al crear respuesta: ${response.statusText}`);
      }
      
      const responseJson = await response.json();
      
      // Crear una estructura segura para la respuesta
      const replyData: Partial<Comment> = {
        id: '',
        content: replyContent.trim(),
        likes: 0,
        replies: [],
        createdAt: new Date().toISOString(),
        postId,
        parentId: replyingTo
      };
      
      // Extraer información de la respuesta
      if (responseJson) {
        // Si la respuesta tiene una estructura con data
        const source = responseJson.data || responseJson;
        
        if (source && typeof source === 'object') {
          if (source.id) replyData.id = source.id;
          if (typeof source.content === 'string') replyData.content = source.content;
          if (typeof source.likes === 'number') replyData.likes = source.likes;
          if (source.createdAt) replyData.createdAt = source.createdAt;
          
          // Manejar la información del autor
          if (source.author && typeof source.author === 'object') {
            replyData.author = {
              id: source.author.id || 'unknown',
              name: source.author.name || 'Usuario',
              avatar: source.author.avatar || ''
            };
          } else if (source.authorId && user) {
            // Si solo tenemos authorId pero conocemos al usuario
            replyData.author = {
              id: user.userId,
              name: user.name,
              avatar: user.avatar || ''
            };
          } else if (user) {
            // Usar la información del usuario actual como fallback
            replyData.author = {
              id: user.userId,
              name: user.name,
              avatar: user.avatar || ''
            };
          }
        }
      }
      
      // Asegurar que tenemos un ID válido
      if (!replyData.id) {
        replyData.id = Math.random().toString();
      }
      
      // Convertir a un comentario completo
      const newReply = replyData as Comment;
      
      // Asegurar que el nuevo comentario tenga la estructura correcta
      const structuredNewReply = ensureCommentStructure(newReply);
      
      // Actualizar el estado con la nueva respuesta
      setComments(prevComments => 
        updateCommentRecursively(prevComments, replyingTo, comment => ({
          ...comment,
          replies: [...comment.replies, structuredNewReply]
        }))
      );
      
      // Limpiar el formulario de respuesta
      setReplyingTo(null);
      setReplyContent("");
      
      toast({
        title: "Respuesta enviada",
        description: "Tu respuesta ha sido publicada correctamente."
      });
    } catch (error) {
      console.error('Error al responder al comentario:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar tu respuesta. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, postId, getBaseApiUrl, toast, setComments, setReplyingTo, setReplyContent, setIsLoading, updateCommentRecursively, ensureCommentStructure]);

  // Añadir un nuevo comentario principal
  const addNewComment = useCallback(async (newCommentContent: string) => {
    if (!user || !newCommentContent.trim() || !postId) {
      return false;
    }

    setIsLoading(true);

    try {
      const apiUrl = getBaseApiUrl();
      const response = await customFetch(`${apiUrl}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newCommentContent.trim(),
          postId,
          parentId: null
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error al crear comentario: ${response.statusText}`);
      }
      
      const responseJson = await response.json();
      
      // Extraer el nuevo comentario con una estructura segura
      const newCommentData: Partial<Comment> = {
        id: '',
        content: newCommentContent.trim(),
        likes: 0,
        replies: [],
        createdAt: new Date().toISOString(),
        postId
      };
      
      // Extraer información de la respuesta
      if (responseJson) {
        // Si la respuesta tiene una estructura con data
        const source = responseJson.data || responseJson;
        
        if (source && typeof source === 'object') {
          if (source.id) newCommentData.id = source.id;
          if (typeof source.content === 'string') newCommentData.content = source.content;
          if (typeof source.likes === 'number') newCommentData.likes = source.likes;
          if (source.createdAt) newCommentData.createdAt = source.createdAt;
          
          // Manejar la información del autor
          if (source.author && typeof source.author === 'object') {
            newCommentData.author = {
              id: source.author.id || 'unknown',
              name: source.author.name || 'Usuario',
              avatar: source.author.avatar || ''
            };
          } else if (source.authorId && user) {
            // Si solo tenemos authorId pero conocemos al usuario
            newCommentData.author = {
              id: user.userId,
              name: user.name,
              avatar: user.avatar || ''
            };
          } else if (user) {
            // Usar la información del usuario actual como fallback
            newCommentData.author = {
              id: user.userId,
              name: user.name,
              avatar: user.avatar || ''
            };
          }
        }
      }
      
      // Asegurar que tenemos un ID válido
      if (!newCommentData.id) {
        newCommentData.id = Math.random().toString();
      }
      
      // Convertir a un comentario completo
      const newComment = newCommentData as Comment;
      
      // Asegurar que la estructura sea segura
      const structuredNewComment = ensureCommentStructure(newComment);
      
      // Añadir el nuevo comentario al inicio de la lista
      setComments(prevComments => [structuredNewComment, ...prevComments]);
      
      toast({
        title: "Comentario enviado",
        description: "Tu comentario ha sido publicado correctamente."
      });
      
      return true;
    } catch (error) {
      console.error('Error al crear comentario:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar tu comentario. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, postId, getBaseApiUrl, toast, setComments, setIsLoading, ensureCommentStructure]);

  // Eliminar un comentario
  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) return;

    try {
      const apiUrl = getBaseApiUrl();
      const response = await customFetch(`${apiUrl}/comments/${commentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error al eliminar comentario: ${response.statusText}`);
      }
      
      // Eliminar el comentario del estado
      setComments(prevComments => removeCommentRecursively(prevComments, commentId));
      
      toast({
        title: "Comentario eliminado",
        description: "El comentario ha sido eliminado correctamente."
      });
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el comentario. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    }
  }, [user, getBaseApiUrl, toast, setComments, removeCommentRecursively]);

  return {
    handleLike,
    handleReply,
    submitReply,
    addNewComment,
    deleteComment
  };
} 