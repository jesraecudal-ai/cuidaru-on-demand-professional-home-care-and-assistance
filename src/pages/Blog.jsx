import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Clock, Search, ArrowRight, BookOpen, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/lib/useUserProfile';

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

export default function Blog() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const { user } = useUserProfile();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }, '-created_date', 50),
  });

  const filtered = useMemo(() => {
    return posts.filter(p => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch = !search || p.title?.toLowerCase().includes(q) || p.excerpt?.toLowerCase().includes(q) || p.tags?.some(t => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [posts, search, activeCategory]);

  const featured = filtered.find(p => p.featured);
  const rest = filtered.filter(p => !p.featured);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4 text-center"
      >
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-7 h-7" />
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-200">Cuidaru Blog</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Care, Health & Home</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Expert guides, stories, and tips about caregiving, home services, and making the most of Cuidaru.
          </p>
          <div className="mt-8 max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-11 h-12 bg-white text-gray-900 border-0 rounded-xl shadow-lg"
            />
          </div>
        </motion.div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Admin actions */}
        {user?.role === 'admin' && (
          <div className="flex justify-end mb-6">
            <Link to="/admin/blog/new">
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" /> New Post
              </Button>
            </Link>
          </div>
        )}

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {['all', ...Object.keys(CATEGORY_LABELS)].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'All Posts' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                <Link to={`/blog/${featured.slug}`} className="group block">
                  <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="relative h-64 md:h-auto overflow-hidden">
                      <img
                        src={featured.cover_image || 'https://images.unsplash.com/photo-1576091160399-86c54dcb98fe?w=800&h=500&fit=crop'}
                        alt={featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-amber-400 text-amber-900 border-0">⭐ Featured</Badge>
                      </div>
                    </div>
                    <div className="p-8 flex flex-col justify-center bg-white">
                      <Badge className={`${CATEGORY_COLORS[featured.category]} border-0 mb-3 self-start`}>
                        {CATEGORY_LABELS[featured.category]}
                      </Badge>
                      <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{featured.title}</h2>
                      <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">{featured.excerpt}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{featured.read_time_minutes} min read</span>
                        </div>
                        <span className="text-blue-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read more <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Grid */}
            {rest.length === 0 && !featured ? (
              <div className="text-center py-20 text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No articles found.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
                  >
                    <Link to={`/blog/${post.slug}`} className="group block h-full">
                      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all h-full flex flex-col">
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={post.cover_image || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop'}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <Badge className={`${CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-600'} border-0 mb-2 self-start text-xs`}>
                            {CATEGORY_LABELS[post.category] || post.category}
                          </Badge>
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{post.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2 flex-1">{post.excerpt}</p>
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <Clock className="w-3.5 h-3.5" />
                              {post.read_time_minutes} min
                            </div>
                            <span className="text-blue-600 text-xs font-semibold flex items-center gap-1">
                              Read <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}