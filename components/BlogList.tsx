import React from 'react';
import { BlogPost } from './BlogPost';
import { SkeletonCard } from './SkeletonCard';

interface BlogPostData {
    id: number;
    title: string;
    excerpt: string;
    votes: number;
    comments: number;
    image: string;
    tags: string[];
}

interface BlogListProps {
    posts: BlogPostData[];
    isLoading: boolean;
}

export function BlogList({ posts, isLoading }: BlogListProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                    <SkeletonCard key={index} />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
                <BlogPost key={post.id} {...post} />
            ))}
        </div>
    );
}

