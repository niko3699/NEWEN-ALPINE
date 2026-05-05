/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { useDropzone } from 'react-dropzone';
import { Plus, X, Play, Image as ImageIcon, Video as VideoIcon, Move } from 'lucide-react';

// --- Types ---
interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
}

// --- Components ---

const EditableText = ({ 
  value, 
  onChange, 
  className, 
  multiline = false 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  className?: string;
  multiline?: boolean;
}) => {
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange(e.currentTarget.textContent || '')}
      onKeyDown={(e) => {
        if (!multiline && e.key === 'Enter') {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      className={`outline-hidden focus:ring-1 focus:ring-white/20 hover:bg-white/5 cursor-text transition-all ${className}`}
    >
      {value}
    </div>
  );
};

const MediaSlot = ({ 
  id, 
  onMediaDrop, 
  currentMedia, 
  onRemove,
  label 
}: { 
  id: string; 
  onMediaDrop: (id: string, media: MediaItem) => void; 
  currentMedia?: MediaItem;
  onRemove: (id: string) => void;
  label: string;
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    
    onMediaDrop(id, {
      id: Math.random().toString(36).substr(2, 9),
      url,
      type,
      name: file.name
    });
  }, [id, onMediaDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [] as string[],
      'video/*': [] as string[]
    },
    multiple: false
  } as any);

  return (
    <div className="relative group">
      <div className="absolute -top-6 left-0 text-[10px] uppercase tracking-widest opacity-40 font-medium">
        {label}
      </div>
      <div 
        {...getRootProps()} 
        className={`relative aspect-[4/5] md:aspect-square w-full bg-[#111] border border-white/10 overflow-hidden transition-all duration-500 cursor-pointer
          ${isDragActive ? 'border-white/40 bg-[#1a1a1a] scale-[0.98]' : 'hover:border-white/20'}
          ${currentMedia ? 'border-none' : 'flex items-center justify-center'}
        `}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {currentMedia ? (
            <motion.div 
              key={currentMedia.url}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              {currentMedia.type === 'image' ? (
                <img 
                  src={currentMedia.url} 
                  alt={currentMedia.name} 
                  className="w-full h-full object-cover transition-all duration-700"
                />
              ) : (
                <video 
                  src={currentMedia.url} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-full object-cover transition-all duration-700"
                />
              )}
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(id);
                }}
                className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-500/80"
              >
                <X size={14} />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="p-4 rounded-full border border-white/5 bg-white/[0.02] group-hover:bg-white/[0.05] transition-colors">
                <Plus size={24} className="opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] opacity-30 group-hover:opacity-60 transition-opacity">
                Drop content
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload indicator overlays */}
        {isDragActive && (
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] flex items-center justify-center z-20">
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }} 
              transition={{ repeat: Infinity, duration: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <Move size={32} className="text-white" />
              <span className="text-xs uppercase font-bold tracking-widest">Release to add</span>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [media, setMedia] = useState<Record<string, MediaItem>>({
    // You can pre-set your paths here once you upload files to /public/media/
    // Example: 'main-ski': { id: 'default', url: '/media/my-ski.png', type: 'image', name: 'my-ski.png' }
  });
  const [content, setContent] = useState({
    heroTitle: 'Freestyle',
    detailsTitle: 'Built for the Bold.',
    detailsDesc: 'Our Core Series is engineered for maximum pop and durability. Lightweight aspen wood core reinforced with carbon stringers.',
    footerTitle: 'Be the storm.',
    navLogo: 'CORE_STUDIO',
    navTagline: 'NEXT GEN SKIS',
    navItems: ['Shop', 'Team', 'Stories', 'Cart (0)'],
    techSpecsLabel: 'Tech Specs',
    specs: [
      { label: 'Core', value: 'Aspen / Carbon' },
      { label: 'Flex', value: '7 / 10' },
      { label: 'Weight', value: '1750g @ 181cm' },
      { label: 'Profile', value: 'Twin Tip Rocker' },
    ],
    journeyTitle: 'The Journey',
    journeySubtitle: 'Full Screen Immersion',
    footerSignature: 'Designed in Chamonix, France.',
    footerCTA: 'Pre-Order Series',
    socials: ['Instagram', 'Vimeo', 'Contact'],
    dropSkiMsg: 'Drop new ski design',
    dropHeroMsg: 'Drop Background',
    changeHeroMsg: 'Change Background',
    action1Label: 'Action Preview',
    action2Label: 'Technical View',
    journeyMediaLabel: 'Interactive Hero Media'
  });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll();
  
  // Transform values for scroll animations
  const skiRotation = useTransform(scrollYProgress, [0, 1], [0, 720]);
  const skiScale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1, 0.8, 0.8, 1.2]);
  const skiOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [0.9, 0, 0]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -50]);

  const handleMediaDrop = useCallback((id: string, item: MediaItem) => {
    setMedia(prev => ({ ...prev, [id]: item }));
  }, []);

  const updateContent = (key: keyof typeof content, val: any) => {
    setContent(prev => ({ ...prev, [key]: val }));
  };

  const updateNavItem = (index: number, val: string) => {
    const newItems = [...content.navItems];
    newItems[index] = val;
    updateContent('navItems', newItems);
  };

  const updateSpec = (index: number, field: 'label' | 'value', val: string) => {
    const newSpecs = [...content.specs];
    newSpecs[index] = { ...newSpecs[index], [field]: val };
    updateContent('specs', newSpecs);
  };

  const updateSocial = (index: number, val: string) => {
    const newSocials = [...content.socials];
    newSocials[index] = val;
    updateContent('socials', newSocials);
  };

  const { getRootProps: getSkiRootProps, getInputProps: getSkiInputProps, isDragActive: isSkiDragActive } = useDropzone({
    onDrop: (files) => {
      const file = files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        handleMediaDrop('main-ski', {
          id: 'main-ski',
          url,
          type: 'image',
          name: file.name
        });
      }
    },
    accept: { 'image/*': [] as string[] },
    multiple: false
  } as any);

  const { getRootProps: getHeroRootProps, getInputProps: getHeroInputProps, isDragActive: isHeroDragActive } = useDropzone({
    onDrop: (files) => {
      const file = files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        handleMediaDrop('hero-bg', {
          id: 'hero-bg',
          url,
          type: 'image',
          name: file.name
        });
      }
    },
    accept: { 'image/*': [] as string[] },
    multiple: false
  } as any);

  const handleRemoveMedia = useCallback((id: string) => {
    setMedia(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen font-sans selection:bg-white selection:text-black">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full p-8 md:p-12 flex justify-between items-end z-[100] mix-blend-difference pointer-events-none">
        <div className="flex flex-col gap-1 pointer-events-auto cursor-pointer group">
          <EditableText 
            value={content.navLogo} 
            onChange={(val) => updateContent('navLogo', val)} 
            className="text-xl font-black tracking-tighter leading-none"
          />
          <EditableText 
            value={content.navTagline} 
            onChange={(val) => updateContent('navTagline', val)} 
            className="text-[10px] font-medium tracking-[0.3em] opacity-60 group-hover:opacity-100 transition-opacity"
          />
        </div>
        <div className="flex gap-8 md:gap-16 pointer-events-auto">
          {content.navItems.map((item, i) => (
            <a key={i} href="#" className="text-[10px] uppercase font-semibold tracking-widest hover:opacity-50 transition-opacity">
              <EditableText 
                value={item} 
                onChange={(val) => updateNavItem(i, val)} 
              />
            </a>
          ))}
        </div>
      </nav>

      {/* Persistent Product Visual (The Ski) */}
      <div className={`fixed inset-0 pointer-events-none flex items-center justify-center z-50 overflow-hidden transition-colors duration-500 ${isSkiDragActive ? 'bg-white/5' : ''}`}>
        <motion.div 
          style={{ rotate: skiRotation, scale: skiScale, opacity: skiOpacity }}
          className="relative w-40 h-[120vh] md:w-56 md:h-[140vh] flex items-center justify-center pointer-events-auto cursor-pointer group/ski"
          {...getSkiRootProps()}
        >
          <input {...getSkiInputProps()} />

          {/* Main Ski Image Asset */}
          <div className="relative w-full h-full overflow-hidden rounded-full">
            <img 
              src={media['main-ski']?.url || "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&q=80&w=400&h=1600"} 
              alt="Core Series Ski"
              className={`w-full h-full object-cover transition-all duration-700
                ${isSkiDragActive ? 'scale-[1.05]' : ''}
              `}
            />
            
            {/* Glow effect when active */}
            {isSkiDragActive && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 bg-white/20 blur-xl"
              />
            )}
          </div>
          
          {/* Drop Indicator Overlay */}
          <div className={`absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center z-30 rounded-full border-4 border-dashed border-white/60
            ${isSkiDragActive ? 'opacity-100' : 'opacity-0 group-hover/ski:opacity-100'}
          `}>
             <div className="flex flex-col items-center gap-3 text-white text-center p-4">
                <Plus size={32} className={isSkiDragActive ? 'animate-bounce' : ''} />
                <EditableText 
                  value={content.dropSkiMsg} 
                  onChange={(val) => updateContent('dropSkiMsg', val)} 
                  className="text-[10px] font-black uppercase tracking-[0.3em] leading-tight"
                  multiline
                />
             </div>
          </div>
        </motion.div>
      </div>

      {/* Section 1: Hero */}
      <section 
        {...getHeroRootProps()}
        className="relative h-screen flex items-center justify-center overflow-hidden cursor-pointer group/hero"
      >
        <input {...getHeroInputProps()} />
        
        {/* Hero Background Image */}
        <AnimatePresence>
          {media['hero-bg'] && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-0"
            >
              <img 
                src={media['hero-bg'].url} 
                className="w-full h-full object-cover" 
                alt="Background" 
              />
              <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/60" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Visual Feedback */}
        <div className={`absolute inset-0 border-4 border-dashed border-white/20 transition-opacity duration-300 z-10 flex items-center justify-center
          ${isHeroDragActive ? 'opacity-100 bg-white/5' : 'opacity-0 group-hover/hero:opacity-40'}
        `}>
          <div className="flex flex-col items-center gap-2">
            <Plus size={48} className={`text-white transition-transform duration-500 ${isHeroDragActive ? 'scale-110' : 'opacity-40'}`} />
            <EditableText 
              value={isHeroDragActive ? content.dropHeroMsg : content.changeHeroMsg} 
              onChange={(val) => updateContent(isHeroDragActive ? 'dropHeroMsg' : 'changeHeroMsg', val)} 
              className="text-[10px] font-black uppercase tracking-[0.4em] text-white"
            />
          </div>
        </div>

        <motion.div 
          style={{ opacity: heroOpacity, y: heroY }}
          className="text-center relative z-[60] pointer-events-none"
        >
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-[6vw] font-black leading-[0.8] tracking-tighter uppercase mb-4 pointer-events-auto"
          >
            <EditableText 
              value={content.heroTitle} 
              onChange={(val) => updateContent('heroTitle', val)} 
            />
          </motion.h1>

        </motion.div>
      </section>

      {/* Section 2: Details & Slots */}
      <section className="relative min-h-screen py-32 px-8 md:px-24 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 z-20">
        <div className="md:col-span-4 flex flex-col justify-center space-y-12">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">
              <EditableText 
                value={content.detailsTitle} 
                onChange={(val) => updateContent('detailsTitle', val)} 
                multiline
              />
            </h2>
            <div className="text-sm md:text-base text-gray-400 max-w-sm leading-relaxed">
              <EditableText 
                value={content.detailsDesc} 
                onChange={(val) => updateContent('detailsDesc', val)} 
                multiline
              />
            </div>
          </div>

          {/* First Media Slot */}
          <div className="max-w-[320px]">
            <MediaSlot 
              id="action-1" 
              label={content.action1Label}
              currentMedia={media['action-1']}
              onMediaDrop={handleMediaDrop}
              onRemove={handleRemoveMedia}
            />
            <EditableText 
              value={content.action1Label} 
              onChange={(val) => updateContent('action1Label', val)} 
              className="mt-1 text-[8px] uppercase tracking-widest opacity-20 hover:opacity-100"
            />
          </div>
        </div>

        <div className="md:col-span-4 md:col-start-9 flex flex-col justify-center space-y-12">
           <div className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold py-1 px-2 border border-white/20">01</span>
                <EditableText 
                  value={content.techSpecsLabel} 
                  onChange={(val) => updateContent('techSpecsLabel', val)} 
                  className="text-[10px] font-bold uppercase tracking-widest"
                />
              </div>
              <ul className="space-y-4 border-t border-white/10 pt-8">
                {content.specs.map((spec, i) => (
                  <li key={i} className="flex justify-between items-end border-b border-white/5 pb-2">
                    <EditableText 
                      value={spec.label} 
                      onChange={(val) => updateSpec(i, 'label', val)} 
                      className="text-[10px] uppercase opacity-40 font-bold"
                    />
                    <EditableText 
                      value={spec.value} 
                      onChange={(val) => updateSpec(i, 'value', val)} 
                      className="text-xs font-mono font-medium"
                    />
                  </li>
                ))}
              </ul>
           </div>

           {/* Second Media Slot */}
           <div className="max-w-[320px] self-end w-full">
            <MediaSlot 
              id="action-2" 
              label={content.action2Label}
              currentMedia={media['action-2']}
              onMediaDrop={handleMediaDrop}
              onRemove={handleRemoveMedia}
            />
            <EditableText 
              value={content.action2Label} 
              onChange={(val) => updateContent('action2Label', val)} 
              className="mt-1 text-right text-[8px] uppercase tracking-widest opacity-20 hover:opacity-100"
            />
          </div>
        </div>
      </section>

      {/* Section 3: Full Width Story Slot */}
      <section className="relative py-32 px-8 md:px-24 z-20">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-end">
            <EditableText 
              value={content.journeyTitle} 
              onChange={(val) => updateContent('journeyTitle', val)} 
              className="text-xl font-black uppercase tracking-tighter"
            />
            <EditableText 
              value={content.journeySubtitle} 
              onChange={(val) => updateContent('journeySubtitle', val)} 
              className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em]"
            />
          </div>
          <div className="w-[90%] mx-auto aspect-video md:aspect-[21/9]">
            <MediaSlot 
              id="main-story" 
              label={content.journeyMediaLabel}
              currentMedia={media['main-story']}
              onMediaDrop={handleMediaDrop}
              onRemove={handleRemoveMedia}
            />
            <EditableText 
              value={content.journeyMediaLabel} 
              onChange={(val) => updateContent('journeyMediaLabel', val)} 
              className="mt-2 text-[8px] uppercase tracking-widest opacity-20 hover:opacity-100"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-24 px-8 md:px-24 bg-white text-black z-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
        <div className="space-y-4">
          <h4 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8]">
            <EditableText 
              value={content.footerTitle} 
              onChange={(val) => updateContent('footerTitle', val)} 
              multiline
            />
          </h4>
          <EditableText 
            value={content.footerSignature} 
            onChange={(val) => updateContent('footerSignature', val)} 
            className="text-xs uppercase font-bold tracking-widest opacity-50"
          />
        </div>
        
        <div className="flex flex-col gap-6 items-start md:items-end w-full md:w-auto">
          <button className="w-full md:w-auto px-12 py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-gray-900 transition-colors">
            <EditableText 
              value={content.footerCTA} 
              onChange={(val) => updateContent('footerCTA', val)} 
            />
          </button>
          <div className="flex gap-8">
            {content.socials.map((link, i) => (
              <a key={i} href="#" className="text-[10px] font-bold uppercase tracking-widest hover:opacity-40 transition-opacity">
                <EditableText 
                  value={link} 
                  onChange={(val) => updateSocial(i, val)} 
                />
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* Background elements */}
      <div className="fixed inset-0 bg-[#0a0a0a] -z-10" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 h-full w-[1px] bg-white/[0.03] -z-10" />
      <div className="fixed inset-0 pointer-events-none -z-5 opacity-20 transition-opacity duration-1000">
         <div className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] bg-white/5 rounded-full blur-[120px]" />
         <div className="absolute bottom-[20%] right-[10%] w-[30vw] h-[30vw] bg-white/5 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
