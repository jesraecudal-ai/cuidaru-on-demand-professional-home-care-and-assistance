import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, ArrowLeft, MessageCircle, Send, User, Pencil } from 'lucide-react';
import { useUserProfile } from '@/lib/useUserProfile';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const CATEGORY_LABELS = {
  caregiving: 'Caregiving',
  nursing: 'Nursing & Health',
  'home-services': 'Home Services',
  platform: 'Cuidaru News',
  tips: 'Tips & Guides',
  stories: 'Success Stories',
};

const CATEGORY_COLORS = {
  caregiving: 'bg-blue-100 text-blue-700',
  nursing: 'bg-red-100 text-red-700',
  'home-services': 'bg-green-100 text-green-700',
  platform: 'bg-purple-100 text-purple-700',
  tips: 'bg-amber-100 text-amber-700',
  stories: 'bg-pink-100 text-pink-700',
};

export default function BlogPostPage() {
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const { user } = useUserProfile();
  const [commentForm, setCommentForm] = useState({ name: '', email: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['blog-post-by-slug', slug],
    queryFn: () => base44.entities.BlogPost.filter({ slug, published: true }),
  });

  const post = posts[0];

  const { data: comments = [], isLoading: loadingComments } = useQuery({
    queryKey: ['blog-comments', post?.id],
    queryFn: () => base44.entities.BlogComment.filter({ post_id: post.id, is_approved: true }, '-created_date', 50),
    enabled: !!post?.id,
  });

  const { data: relatedPosts = [] } = useQuery({
    queryKey: ['related-posts', post?.category],
    queryFn: () => base44.entities.BlogPost.filter({ published: true, category: post.category }, '-created_date', 4),
    enabled: !!post?.category,
  });

  // Increment view count
  useEffect(() => {
    if (post?.id) {
      base44.entities.BlogPost.update(post.id, { view_count: (post.view_count || 0) + 1 });
    }
  }, [post?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentForm.name.trim() || !commentForm.email.trim() || !commentForm.content.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(commentForm.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.BlogComment.create({
        post_id: post.id,
        post_slug: post.slug,
        commenter_name: commentForm.name.trim(),
        commenter_email: commentForm.email.trim().toLowerCase(),
        content: commentForm.content.trim(),
        is_approved: true,
      });
      toast.success('Comment posted!');
      setCommentForm({ name: '', email: '', content: '' });
      queryClient.invalidateQueries({ queryKey: ['blog-comments', post.id] });
    } catch {
      toast.error('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPosts) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Article not found</h2>
          <p className="text-gray-500 mb-6">The article you're looking for doesn't exist or was removed.</p>
          <Link to="/blog"><Button>Back to Blog</Button></Link>
        </div>
      </div>
    );
  }

  const related = relatedPosts.filter(p => p.id !== post.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* Cover image */}
      <div className="relative h-72 md:h-96 overflow-hidden bg-gray-200">
        <img
          src={post.cover_image || 'https://images.unsplash.com/photo-1576091160399-86c54dcb98fe?w=1200&h=600&fit=crop'}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-3xl mx-auto">
            <Badge className={`${CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-600'} border-0 mb-3`}>
              {CATEGORY_LABELS[post.category] || post.category}
            </Badge>
            <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight">{post.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-gray-100 text-sm text-gray-500">
          <Link to="/blog" className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium">
            <ArrowLeft className="w-4 h-4" /> Blog
          </Link>
          {user?.role === 'admin' && post && (
            <Link to={`/admin/blog/edit/${post.id}`} className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 text-xs border border-gray-200 px-3 py-1 rounded-full">
              <Pencil className="w-3 h-3" /> Edit Post
            </Link>
          )}
          <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {post.author_name || 'Cuidaru Team'}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {post.read_time_minutes || 8} min read</span>
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-gray-700 text-[17px] leading-[1.85]"
        >
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-3xl font-bold text-gray-900 mt-10 mb-4">{children}</h1>,
              h2: ({ children }) => <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">{children}</h3>,
              h4: ({ children }) => <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-2">{children}</h4>,
              p: ({ children }) => <p className="mb-6 leading-[1.85] text-gray-700">{children}</p>,
              ul: ({ children }) => <ul className="mb-6 ml-6 space-y-2 list-disc marker:text-blue-400">{children}</ul>,
              ol: ({ children }) => <ol className="mb-6 ml-6 space-y-2 list-decimal marker:text-blue-500 marker:font-semibold">{children}</ol>,
              li: ({ children }) => <li className="leading-[1.8] text-gray-700 pl-1">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
              em: ({ children }) => <em className="italic text-gray-600">{children}</em>,
              blockquote: ({ children }) => (
                <blockquote className="my-6 pl-5 border-l-4 border-blue-400 bg-blue-50 rounded-r-xl py-4 pr-4 text-gray-700 italic">
                  {children}
                </blockquote>
              ),
              a: ({ href, children }) => (
                <a href={href} className="text-blue-600 underline underline-offset-2 hover:text-blue-800" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
              code: ({ inline, children }) =>
                inline ? (
                  <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-[15px] font-mono">{children}</code>
                ) : (
                  <pre className="bg-gray-900 text-gray-100 rounded-xl p-5 my-6 overflow-x-auto text-sm font-mono leading-relaxed">
                    <code>{children}</code>
                  </pre>
                ),
              hr: () => <hr className="my-8 border-gray-200" />,
            }}
          >
            {post.content}
          </ReactMarkdown>
        </motion.div>

        {/* CTA Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white text-center"
        >
          <h3 className="text-xl font-bold mb-2">Ready to find a trusted professional?</h3>
          <p className="text-blue-100 mb-5">Join thousands of families and service providers on Cuidaru today.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/browse">
              <Button className="bg-white text-blue-700 hover:bg-blue-50">Find a Provider</Button>
            </Link>
            <Link to="/onboarding">
              <Button variant="outline" className="border-white text-white hover:bg-white/10">Become a Provider</Button>
            </Link>
          </div>
        </motion.div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-14">
            <h3 className="text-xl font-bold text-gray-900 mb-5">Related Articles</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map(rp => (
                <Link key={rp.id} to={`/blog/${rp.slug}`} className="group block rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="h-32 overflow-hidden">
                    <img
                      src={rp.cover_image || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop'}
                      alt={rp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">{rp.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comments section */}
        <div className="mt-14">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            Comments ({comments.length})
          </h3>

          {/* Comment form */}
          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-6 mb-8 space-y-4">
            <h4 className="font-semibold text-gray-800">Leave a comment</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <Input
                  placeholder="Your name"
                  value={commentForm.name}
                  onChange={e => setCommentForm(p => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email * <span className="text-xs text-gray-400">(not published)</span></label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={commentForm.email}
                  onChange={e => setCommentForm(p => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment *</label>
              <textarea
                className="w-full border border-input rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                rows={4}
                placeholder="Share your thoughts..."
                value={commentForm.content}
                onChange={e => setCommentForm(p => ({ ...p, content: e.target.value }))}
                required
              />
            </div>
            <Button type="submit" disabled={submitting} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4" />
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </form>

          {/* Comments list */}
          {loadingComments ? (
            <div className="space-y-3">
              {[1, 2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No comments yet. Be the first to share your thoughts!</p>
          ) : (
            <div className="space-y-4">
              {comments.map(c => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-100 rounded-xl p-5"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                      {c.commenter_name?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{c.commenter_name}</p>
                      <p className="text-xs text-gray-400">{new Date(c.created_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{c.content}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}