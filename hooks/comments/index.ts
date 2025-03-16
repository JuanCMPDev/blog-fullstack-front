// Re-export de los hooks modulares
export * from './useCommentState';
export * from './useCommentUtils';
export * from './useFetchComments';
export * from './useCommentInteractions';

// Export del hook principal refactorizado
export { useCommentsRefactored as useComments } from './useCommentsRefactored'; 