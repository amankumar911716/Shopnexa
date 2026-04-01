'use client';

import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';

export function BannerSlider() {
  const { banners, navigateTo, setFilters } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrentSlide(prev => (prev + 1) % banners.length), 5000);
  }, [banners.length]);

  useEffect(() => { startAutoPlay(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [startAutoPlay]);

  const handleClick = (link: string) => {
    if (link === 'flash') { setFilters({ search: '', inStock: true }); navigateTo('products'); }
    else { setFilters({ search: '', categoryId: link }); navigateTo('products'); }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <Carousel opts={{ loop: true, align: 'start' }}>
        <CarouselContent>
          {banners.map((banner, index) => (
            <CarouselItem key={banner.id}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="relative">
                <div className={`relative h-[220px] sm:h-[280px] md:h-[380px] rounded-2xl overflow-hidden bg-gradient-to-r ${banner.bgColor}`}>
                  <img src={`${banner.image}?v=20260331`} alt={banner.title} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" onError={(e) => { const el = e.target as HTMLImageElement; el.onerror = null; el.src = '/api/placeholder?text=' + encodeURIComponent(banner.title.slice(0, 20)) + '&w=1200&h=400'; }} />
                  <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10 md:px-16 text-white max-w-xl">
                    <motion.span initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-xs font-medium mb-3 backdrop-blur-sm">
                      <Zap className="h-3 w-3" /> Limited Time
                    </motion.span>
                    <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                      className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{banner.title}</motion.h2>
                    <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                      className="text-sm sm:text-base opacity-90 mb-5">{banner.subtitle}</motion.p>
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                      <Button variant="secondary" className="bg-white text-gray-900 hover:bg-white/90 font-semibold shadow-lg rounded-full"
                        onClick={() => handleClick(banner.link)}>
                        Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex bg-white/80 hover:bg-white shadow-lg" />
        <CarouselNext className="hidden sm:flex bg-white/80 hover:bg-white shadow-lg" />
      </Carousel>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {banners.map((_, index) => (
          <button key={index} onClick={() => { setCurrentSlide(index); startAutoPlay(); }}
            className={`h-1.5 rounded-full transition-all ${index === currentSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} />
        ))}
      </div>
    </div>
  );
}
