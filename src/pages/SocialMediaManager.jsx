import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, Send, Image, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const PLATFORMS = [
  {
    key: 'instagram',
    label: 'Instagram',
    color: 'from-pink-500 to-purple-600',
    textColor: 'text-pink-600',
    bgColor: 'bg-pink-50 border-pink-200',
    selectedBg: 'bg-pink-500',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    )
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    color: 'from-gray-900 to-gray-700',
    textColor: 'text-gray-800',
    bgColor: 'bg-gray-50 border-gray-200',
    selectedBg: 'bg-gray-900',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.78a4.85 4.85 0 01-1.01-.09z"/>
      </svg>
    )
  }
];

export default function SocialMediaManager() {
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram', 'tiktok']);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [results, setResults] = useState(null);

  const togglePlatform = (key) => {
    setSelectedPlatforms(prev =>
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    );
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImageUrl(file_url);
    setUploading(false);
    toast.success('Image uploaded!');
  };

  const handlePost = async () => {
    if (!caption.trim()) { toast.error('Please write a caption'); return; }
    if (selectedPlatforms.length === 0) { toast.error('Select at least one platform'); return; }
    if (!imageUrl) { toast.error('Please upload an image'); return; }

    setPosting(true);
    setResults(null);

    const res = {};

    for (const platform of selectedPlatforms) {
      try {
        const response = await base44.functions.invoke('postToSocial', {
          platform,
          caption,
          image_url: imageUrl,
        });
        res[platform] = { success: true, data: response.data };
      } catch (err) {
        res[platform] = { success: false, error: err.message || 'Failed to post' };
      }
    }

    setResults(res);
    setPosting(false);

    const allSuccess = Object.values(res).every(r => r.success);
    if (allSuccess) toast.success('Posted successfully!');
    else toast.error('Some posts failed — check results below');
  };

  const handleReset = () => {
    setCaption('');
    setImageUrl('');
    setImageFile(null);
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Social Media Manager</h1>
          <p className="text-gray-500 text-sm mt-1">Post directly to TikTok and Instagram</p>
        </div>

        <div className="space-y-5">
          {/* Platform selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Select Platforms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                {PLATFORMS.map(p => (
                  <button
                    key={p.key}
                    onClick={() => togglePlatform(p.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${
                      selectedPlatforms.includes(p.key)
                        ? `${p.selectedBg} text-white border-transparent`
                        : `${p.bgColor} ${p.textColor}`
                    }`}
                  >
                    {p.icon}
                    {p.label}
                    {selectedPlatforms.includes(p.key) && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Image upload */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Image className="w-4 h-4" /> Media</CardTitle>
            </CardHeader>
            <CardContent>
              {imageUrl ? (
                <div className="relative">
                  <img src={imageUrl} alt="Preview" className="w-full max-h-64 object-cover rounded-lg border border-gray-200" />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => { setImageUrl(''); setImageFile(null); }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <Label htmlFor="media-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
                    {uploading ? (
                      <Loader2 className="w-8 h-8 mx-auto text-gray-400 animate-spin mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    )}
                    <p className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Click to upload image'}</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF up to 10MB</p>
                  </div>
                  <input id="media-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </Label>
              )}
            </CardContent>
          </Card>

          {/* Caption */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Caption</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Write your caption here... #hashtags"
                rows={5}
                className="resize-none"
              />
              <p className="text-xs text-gray-400 mt-2 text-right">{caption.length} characters</p>
            </CardContent>
          </Card>

          {/* Results */}
          {results && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Post Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(results).map(([platform, result]) => {
                  const p = PLATFORMS.find(pl => pl.key === platform);
                  return (
                    <div key={platform} className={`flex items-center gap-3 p-3 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
                        {result.success
                          ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                          : <AlertCircle className="w-4 h-4 text-red-600" />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{p?.label}</p>
                        <p className="text-xs text-gray-500">{result.success ? 'Posted successfully' : result.error}</p>
                      </div>
                    </div>
                  );
                })}
                <Button variant="outline" size="sm" onClick={handleReset} className="mt-2">Create New Post</Button>
              </CardContent>
            </Card>
          )}

          {/* Post button */}
          {!results && (
            <Button
              onClick={handlePost}
              disabled={posting || uploading || !caption.trim() || !imageUrl || selectedPlatforms.length === 0}
              className="w-full h-12 text-base gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              {posting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {posting ? 'Posting...' : `Post to ${selectedPlatforms.length} platform${selectedPlatforms.length !== 1 ? 's' : ''}`}
            </Button>
          )}

          {/* Setup notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <strong>⚙️ Setup required:</strong> API credentials for TikTok and Instagram need to be configured before posting will work. Contact your developer to complete the setup.
          </div>
        </div>
      </div>
    </div>
  );
}