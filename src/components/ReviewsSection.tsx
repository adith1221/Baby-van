import React, { useState } from 'react';
import { Review, Product } from '../types';
import { Star, CheckCircle, User, PenTool, LayoutGrid } from 'lucide-react';

interface ReviewsSectionProps {
  product: Product;
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'date'>) => void;
  primaryColorId: string;
}

export default function ReviewsSection({
  product,
  reviews,
  onAddReview,
  primaryColorId
}: ReviewsSectionProps) {
  const [writeOpen, setWriteOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [success, setSuccess] = useState('');

  // Filter reviews for *this* product
  const productReviews = reviews.filter(r => r.productId === product.id);

  // Math summary
  const average = productReviews.length
    ? parseFloat((productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1))
    : product.rating;

  const count = productReviews.length || product.reviewsCount;

  // Star breakdown
  const starCounts = [0, 0, 0, 0, 0]; // 1, 2, 3, 4, 5
  productReviews.forEach(r => {
    const idx = Math.min(Math.max(r.rating - 1, 0), 4);
    starCounts[idx]++;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim() || !title.trim()) {
      alert('Please fill out all the fields.');
      return;
    }

    onAddReview({
      productId: product.id,
      userName,
      rating,
      title,
      comment,
      verified: true
    });

    setSuccess('Thank you! Your product review has been submitted successfully and listed below.');
    setUserName('');
    setTitle('');
    setComment('');
    setRating(5);
    setTimeout(() => {
      setSuccess('');
      setWriteOpen(false);
    }, 2500);
  };

  const currentTheme = primaryColorId === 'rose' ? 'text-rose-600 bg-rose-50 border-rose-100' :
                       primaryColorId === 'emerald' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                       primaryColorId === 'sky' ? 'text-sky-600 bg-sky-50 border-sky-100' :
                       'text-indigo-600 bg-indigo-50 border-indigo-100';

  const themeBtn = primaryColorId === 'rose' ? 'bg-rose-600 hover:bg-rose-700' :
                    primaryColorId === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' :
                    primaryColorId === 'sky' ? 'bg-sky-600 hover:bg-sky-700' :
                    'bg-indigo-600 hover:bg-indigo-700';

  return (
    <div id={`reviews-section-${product.id}`} className="mt-12 bg-white rounded-3xl border border-neutral-100 p-6 md:p-8 font-sans">
      <div className="flex flex-col lg:flex-row gap-8 justify-between">
        
        {/* Left column: Summary */}
        <div className="w-full lg:w-1/3 space-y-4">
          <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-zinc-900">Customer Ratings</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black text-zinc-900">{average}</span>
            <span className="text-zinc-400 text-sm">out of 5.0</span>
          </div>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={18}
                className={`${s <= Math.round(average) ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`}
              />
            ))}
          </div>

          <p className="text-zinc-500 text-xs">Based on {count} verified customer reviews</p>

          {/* Progress Bars */}
          <div className="space-y-2 pt-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const frequency = starCounts[stars - 1] || 0;
              const percent = productReviews.length ? Math.round((frequency / productReviews.length) * 100) : stars * 15;
              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-8 text-right font-medium text-zinc-600">{stars} Star</span>
                  <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="w-8 text-neutral-400 text-right">{percent}%</span>
                </div>
              );
            })}
          </div>

          <button
            id="write-review-btn"
            onClick={() => setWriteOpen(!writeOpen)}
            className={`w-full py-2.5 px-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 font-semibold text-xs text-zinc-800 transition flex items-center justify-center gap-2 cursor-pointer mt-4`}
          >
            <PenTool size={14} />
            Write a Buyer Review
          </button>
        </div>

        {/* Right column: Form & Listed reviews */}
        <div className="flex-1 space-y-6">
          
          {/* Write review portal */}
          {writeOpen && (
            <form onSubmit={handleSubmit} className="bg-neutral-50 rounded-2xl border border-neutral-200 p-5 space-y-4 animate-fade-in text-xs">
              <h4 className="font-bold text-zinc-900 text-sm pb-1 border-b">Add Your Certified Review</h4>
              
              {success && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-medium leading-relaxed">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-zinc-600 font-semibold">Your Display Name</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Priyal S."
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-zinc-800 placeholder-zinc-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-zinc-600 font-semibold">Overall Rating</label>
                  <div className="flex items-center gap-1 py-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className="hover:scale-110 active:scale-95 transition focus:outline-none cursor-pointer"
                      >
                        <Star
                          size={24}
                          className={`${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-zinc-600 font-semibold">Review Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Incredible fit, very comfortable textile!"
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-zinc-800 placeholder-zinc-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-zinc-600 font-semibold">Tell Us Your Feedback</label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details of your experience with the material, sizes, tags, or delivery speed..."
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-zinc-800 placeholder-zinc-400"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWriteOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-neutral-100 rounded-lg border text-zinc-700 cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded-lg cursor-pointer font-bold transition shadow-xs ${themeBtn}`}
                >
                  Submit Certified Review
                </button>
              </div>
            </form>
          )}

          {/* Listed reviews */}
          <div className="space-y-4">
            <h4 className="font-bold text-zinc-900 border-b pb-2 text-xs uppercase tracking-wide">
              Recent Reviews ({productReviews.length})
            </h4>

            {productReviews.length === 0 ? (
              <div className="text-center py-6 text-zinc-400 text-xs">
                No custom reviews submitted yet for this product. Be the very first to express feedback!
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-neutral-100">
                {productReviews.map((rev) => (
                  <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-zinc-600 text-[10px] font-bold">
                          {rev.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-800 text-xs flex items-center gap-1.5">
                            {rev.userName}
                            {rev.verified && (
                              <span className="inline-flex items-center text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full font-semibold gap-0.5 border border-emerald-100">
                                <CheckCircle size={10} className="fill-emerald-600 text-white" />
                                Verified Buyer
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-neutral-400">{rev.date}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={12}
                            className={`${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="font-bold text-zinc-900 text-xs">{rev.title}</p>
                    <p className="text-zinc-600 text-xs leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
