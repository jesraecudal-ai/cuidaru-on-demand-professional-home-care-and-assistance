import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserProfile } from '@/lib/useUserProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AUTHOR_NAME = 'Jesrae Cudal';

const CATEGORIES = [
  { value: 'caregiving', label: 'Caregiving' },
  { value: 'nursing', label: 'Nursing & Health' },
  { value: 'home-services', label: 'Home Services' },
  { value: 'platform', label: 'Cuidaru News' },
  { value: 'tips', label: 'Tips & Guides' },
  { value: 'stories', label: 'Success Stories' },
];

const EMPTY = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image: '',
  category: 'platform',
  tags: [],
  author_name: AUTHOR_NAME,
  read_time_minutes: 8,
  published: true,
  featured: false,
  seo_title: '',
  seo_description: '',
};

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

export default function AdminBlogEditor() {
  const { id } = useParams(); // undefined = new post
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useUserProfile();
  const [form, setForm] = useState(EMPTY);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/blog');
    }
  }, [user]);

  const { data: existing } = useQuery({
    queryKey: ['blog-post-edit', id],
    queryFn: () => base44.entities.BlogPost.filter({ id }),
    enabled: !!id,
  });

  useEffect(() => {
    if (existing?.[0]) {
      setForm({ ...EMPTY, ...existing[0] });
    }
  }, [existing]);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleTitleChange = (val) => {
    set('title', val);
    if (!id) set('slug', slugify(val));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) {
      set('tags', [...form.tags, t]);
    }
    setTagInput('');
  };

  const removeTag = (tag) => set('tags', form.tags.filter(t => t !== tag));

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
      toast.error('Title, slug, and content are required');
      return;
    }
    setSaving(true);
    try {
      const data = { ...form, author_name: AUTHOR_NAME };
      if (id) {
        await base44.entities.BlogPost.update(id, data);
        toast.success('Post updated!');
      } else {
        const created = await base44.entities.BlogPost.create(data);
        toast.success('Post created!');
        navigate(`/admin/blog/edit/${created.id}`);
      }
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    } catch {
      toast.error('Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post permanently?')) return;
    await base44.entities.BlogPost.delete(id);
    toast.success('Post deleted');
    queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    navigate('/blog');
  };

  if (user && user.role !== 'admin') return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <Link to="/blog" className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
        <div className="flex gap-2">
          {id && (
            <Link to={`/blog/${form.slug}`} target="_blank">
              <Button variant="outline" size="sm" className="gap-1.5"><Eye className="w-4 h-4" /> Preview</Button>
            </Link>
          )}
          {id && (
            <Button variant="outline" size="sm" onClick={handleDelete} className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving} className="gap-1.5 bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Post'}
          </Button>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">{id ? 'Edit Post' : 'New Blog Post'}</h1>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <Input value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="Post title..." className="text-lg" />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL) *</label>
          <Input value={form.slug} onChange={e => set('slug', slugify(e.target.value))} placeholder="post-url-slug" />
          <p className="text-xs text-gray-400 mt-1">cuidaru.com/blog/{form.slug || 'your-slug'}</p>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
          <textarea
            className="w-full border border-input rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            rows={3}
            value={form.excerpt}
            onChange={e => set('excerpt', e.target.value)}
            placeholder="Short summary shown in the blog listing..."
          />
        </div>

        {/* Cover image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
          <Input value={form.cover_image} onChange={e => set('cover_image', e.target.value)} placeholder="https://..." />
          {form.cover_image && <img src={form.cover_image} alt="cover" className="mt-2 h-32 rounded-lg object-cover" />}
        </div>

        {/* Category + Read time */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <Select value={form.category} onValueChange={v => set('category', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Read Time (minutes)</label>
            <Input type="number" value={form.read_time_minutes} onChange={e => set('read_time_minutes', parseInt(e.target.value) || 5)} />
          </div>
        </div>

        {/* Author (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
          <Input value={AUTHOR_NAME} disabled className="bg-gray-50 text-gray-600" />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {form.tags.map(tag => (
              <span key={tag} className="bg-blue-100 text-blue-700 px-3 py-0.5 rounded-full text-sm flex items-center gap-1">
                #{tag}
                <button onClick={() => removeTag(tag)} className="hover:text-red-500 ml-1 font-bold">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Add tag..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} className="max-w-xs" />
            <Button type="button" variant="outline" size="sm" onClick={addTag}>Add</Button>
          </div>
        </div>

        {/* Flags */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)} className="w-4 h-4 rounded" />
            <span className="text-sm font-medium text-gray-700">Published</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 rounded" />
            <span className="text-sm font-medium text-gray-700">Featured</span>
          </label>
        </div>

        {/* SEO */}
        <div className="bg-gray-50 rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-gray-800 text-sm">SEO Settings</h3>
          <div>
            <label className="block text-xs text-gray-600 mb-1">SEO Title</label>
            <Input value={form.seo_title} onChange={e => set('seo_title', e.target.value)} placeholder="SEO page title..." />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">SEO Description</label>
            <textarea
              className="w-full border border-input rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={2}
              value={form.seo_description}
              onChange={e => set('seo_description', e.target.value)}
              placeholder="Meta description for search engines..."
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content * (Markdown supported)</label>
          <textarea
            className="w-full border border-input rounded-lg p-3 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring"
            rows={25}
            value={form.content}
            onChange={e => set('content', e.target.value)}
            placeholder="Write your post in Markdown..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          {id && (
            <Button variant="outline" onClick={handleDelete} className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
              <Trash2 className="w-4 h-4" /> Delete Post
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving} className="gap-1.5 bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Post'}
          </Button>
        </div>
      </div>
    </div>
  );
}