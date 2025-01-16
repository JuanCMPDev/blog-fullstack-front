import React from 'react';
import { BlogPost } from './BlogPost';

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
}

export function BlogList({ posts }: BlogListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
                <BlogPost key={post.id} {...post} />
            ))}
        </div>
    );
}

