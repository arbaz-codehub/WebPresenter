import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Plus, Image as ImageIcon, Type, Layout, 
  Settings, X, ChevronRight, ChevronLeft, Trash2, 
  Copy, Maximize, Move, Layers, MonitorPlay, Palette,
  PanelLeft, PanelRight, PanelLeftClose, PanelRightClose,
  Square, Circle, Shapes, List, TextQuote, Heading1, Heading2,
  Globe, Download, Upload, Video
} from 'lucide-react';
import localforage from 'localforage';

// --- UTILITIES ---

const getDirectImageUrl = (url) => {
  if (!url) return url;
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    const match = url.match(/(?:file\/d\/|id=)([\w-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }
  return url;
};

// --- CONFIGURATION & PRESETS ---

const FONTS = [
  { name: 'Inter', family: "'Inter', sans-serif" },
  { name: 'Playfair Display', family: "'Playfair Display', serif" },
  { name: 'Cinzel', family: "'Cinzel', serif" },
  { name: 'Montserrat', family: "'Montserrat', sans-serif" },
  { name: 'Poppins', family: "'Poppins', sans-serif" },
  { name: 'Roboto', family: "'Roboto', sans-serif" },
  { name: 'Open Sans', family: "'Open Sans', sans-serif" },
  { name: 'Lato', family: "'Lato', sans-serif" },
  { name: 'Oswald', family: "'Oswald', sans-serif" },
  { name: 'Merriweather', family: "'Merriweather', serif" },
  { name: 'Roboto Mono', family: "'Roboto Mono', monospace" },
  { name: 'Pacifico', family: "'Pacifico', cursive" },
];

const TEXT_PRESETS = [
  { name: 'Elegant Title', props: { fontFamily: "'Playfair Display', serif", fontWeight: '700', fontStyle: 'normal' } },
  { name: 'Modern Header', props: { fontFamily: "'Poppins', sans-serif", fontWeight: '700', fontStyle: 'normal' } },
  { name: 'Subtle Italic', props: { fontFamily: "'Merriweather', serif", fontWeight: '300', fontStyle: 'italic' } },
  { name: 'Code Snippet', props: { fontFamily: "'Roboto Mono', monospace", fontWeight: '400', fontStyle: 'normal' } },
  { name: 'Playful Script', props: { fontFamily: "'Pacifico', cursive", fontWeight: '400', fontStyle: 'normal' } },
  { name: 'Impact Bold', props: { fontFamily: "'Oswald', sans-serif", fontWeight: '700', fontStyle: 'normal' } },
];

const THEMES = {
  'luxury-black': {
    name: 'Luxury Black',
    background: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)',
    color: '#d4af37', // Gold
    fontFamily: "'Playfair Display', serif",
  },
  'minimal-white': {
    name: 'Minimal White',
    background: '#ffffff',
    color: '#111827',
    fontFamily: "'Inter', sans-serif",
  },
  'modern-gradient': {
    name: 'Modern Gradient',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    fontFamily: "'Montserrat', sans-serif",
  },
  'dark-tech': {
    name: 'Dark Tech',
    background: '#0f172a',
    color: '#38bdf8',
    fontFamily: "'Inter', sans-serif",
  }
};

const ANIMATIONS = [
  { id: 'none', name: 'None' },
  { id: 'fade-in', name: 'Fade In' },
  { id: 'slide-up', name: 'Slide Up' },
  { id: 'zoom-in', name: 'Zoom In' },
  { id: 'zoom-out', name: 'Zoom Out' },
];

const TRANSITIONS = [
  { id: 'fade', name: 'Fade' },
  { id: 'slide', name: 'Slide Left' },
  { id: 'slide-right', name: 'Slide Right' },
  { id: 'slide-up', name: 'Slide Up' },
  { id: 'slide-down', name: 'Slide Down' },
  { id: 'zoom', name: 'Zoom In' },
  { id: 'zoom-out', name: 'Zoom Out' },
  { id: 'flip', name: 'Flip' },
  { id: 'rotate', name: 'Rotate' },
  { id: 'blur', name: 'Blur Fade' },
];

const ELEMENTS_MENU = [
  { category: 'Text', items: [
    { id: 'heading', name: 'Heading', icon: <Heading1 size={14}/> },
    { id: 'subheading', name: 'Subheading', icon: <Heading2 size={14}/> },
    { id: 'body', name: 'Body Text', icon: <Type size={14}/> },
    { id: 'quote', name: 'Quote', icon: <TextQuote size={14}/> },
    { id: 'list', name: 'Bulleted List', icon: <List size={14}/> },
  ]},
  { category: 'Media', items: [
    { id: 'image', name: 'Image', icon: <ImageIcon size={14}/> },
    { id: 'video', name: 'Video', icon: <Video size={14}/> },
  ]},
  { category: 'Shapes', items: [
    { id: 'shape-rect', name: 'Rectangle', icon: <Square size={14}/> },
    { id: 'shape-circle', name: 'Circle / Oval', icon: <Circle size={14}/> },
    { id: 'shape-triangle', name: 'Triangle', icon: <Shapes size={14}/> },
    { id: 'shape-line', name: 'Line', icon: <Move size={14}/> },
  ]}
];

const SLIDE_TEMPLATES = [
  {
    name: 'Title Slide',
    elements: [
      { id: 'e1', type: 'text', content: 'PRESENTATION TITLE', x: 10, y: 40, width: 80, height: 15, fontSize: 6, fontWeight: '700', textAlign: 'center', animation: 'zoom-in', delay: 0 },
      { id: 'e2', type: 'text', content: 'Subtitle or descriptive text goes here', x: 20, y: 55, width: 60, height: 10, fontSize: 2, fontWeight: '400', textAlign: 'center', animation: 'fade-in', delay: 0.5 }
    ]
  },
  {
    name: 'Image Right',
    elements: [
      { id: 'e1', type: 'text', content: 'Key Concept', x: 10, y: 20, width: 40, height: 10, fontSize: 4, fontWeight: '700', textAlign: 'left', animation: 'slide-up', delay: 0 },
      { id: 'e2', type: 'text', content: 'Elaborate on the key concept here. Add bullet points or a short paragraph detailing the main ideas.', x: 10, y: 35, width: 35, height: 40, fontSize: 1.5, fontWeight: '400', textAlign: 'left', animation: 'fade-in', delay: 0.3 },
      { id: 'e3', type: 'image', content: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80', objectFit: 'cover', x: 50, y: 20, width: 40, height: 60, animation: 'zoom-out', delay: 0.6 }
    ]
  },
  {
    name: 'Big Quote',
    elements: [
      { id: 'e1', type: 'text', content: '"Design is not just what it looks like and feels like. Design is how it works."', x: 15, y: 30, width: 70, height: 30, fontSize: 4, fontWeight: '400', fontStyle: 'italic', textAlign: 'center', animation: 'fade-in', delay: 0 },
      { id: 'e2', type: 'text', content: '- Steve Jobs', x: 15, y: 65, width: 70, height: 10, fontSize: 2, fontWeight: '700', textAlign: 'center', animation: 'slide-up', delay: 0.5 }
    ]
  },
  {
    name: 'Two Columns',
    elements: [
      { id: 'e1', type: 'text', content: 'Comparing Strategies', x: 10, y: 15, width: 80, height: 10, fontSize: 5, fontWeight: '700', textAlign: 'center', animation: 'slide-down', delay: 0 },
      { id: 'e2', type: 'text', content: 'Strategy A\n\n• Focus on growth\n• High marketing spend\n• Rapid expansion', x: 10, y: 35, width: 35, height: 50, fontSize: 2, fontWeight: '400', textAlign: 'left', animation: 'slide-right', delay: 0.3 },
      { id: 'e3', type: 'text', content: 'Strategy B\n\n• Focus on retention\n• High product investment\n• Steady growth', x: 55, y: 35, width: 35, height: 50, fontSize: 2, fontWeight: '400', textAlign: 'left', animation: 'slide-left', delay: 0.5 }
    ]
  },
  {
    name: 'Section Break',
    elements: [
      { id: 'e1', type: 'shape', shapeType: 'line', content: '', x: 20, y: 50, width: 60, height: 1, color: '#d4af37', animation: 'zoom-in', delay: 0 },
      { id: 'e2', type: 'text', content: '02. Financial Overview', x: 10, y: 35, width: 80, height: 12, fontSize: 6, fontWeight: '700', textAlign: 'center', animation: 'slide-up', delay: 0.2 }
    ]
  },
  {
    name: 'Image Gallery',
    elements: [
      { id: 'e1', type: 'image', content: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80', objectFit: 'cover', x: 10, y: 20, width: 25, height: 60, borderRadius: 12, animation: 'fade-in', delay: 0 },
      { id: 'e2', type: 'image', content: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80', objectFit: 'cover', x: 37.5, y: 20, width: 25, height: 60, borderRadius: 12, animation: 'fade-in', delay: 0.2 },
      { id: 'e3', type: 'image', content: 'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&q=80', objectFit: 'cover', x: 65, y: 20, width: 25, height: 60, borderRadius: 12, animation: 'fade-in', delay: 0.4 }
    ]
  }
];

// --- CSS STYLES ---
const PRESENTATION_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@300;400;600;700&family=Lato:wght@300;400;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&family=Montserrat:wght@300;400;600;700&family=Open+Sans:wght@300;400;600;700&family=Oswald:wght@400;600;700&family=Pacifico&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Poppins:wght@300;400;600;700&family=Roboto+Mono:wght@400;700&family=Roboto:wght@300;400;500;700&display=swap');

  /* Element Animations */
  .anim-fade-in { animation: fadeIn 1s cubic-bezier(0.4, 0, 0.2, 1) forwards; opacity: 0; }
  .anim-slide-up { animation: slideUp 1s cubic-bezier(0.4, 0, 0.2, 1) forwards; opacity: 0; transform: translateY(30px); }
  .anim-zoom-in { animation: zoomIn 1s cubic-bezier(0.4, 0, 0.2, 1) forwards; opacity: 0; transform: scale(0.8); }
  .anim-zoom-out { animation: zoomOut 1s cubic-bezier(0.4, 0, 0.2, 1) forwards; opacity: 0; transform: scale(1.2); }
  .anim-none { opacity: 1; }

  @keyframes fadeIn { to { opacity: 1; } }
  @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
  @keyframes zoomIn { to { opacity: 1; transform: scale(1); } }
  @keyframes zoomOut { to { opacity: 1; transform: scale(1); } }

  /* Slide Transitions */
  .slide-transition { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
  
  @keyframes transFadeEnter { from { opacity: 0; } to { opacity: 1; } }
  @keyframes transFadeExit { from { opacity: 1; } to { opacity: 0; } }
  .trans-fade-enter { animation: transFadeEnter 0.8s forwards; z-index: 10; }
  .trans-fade-exit { animation: transFadeExit 0.8s forwards; z-index: 1; }

  @keyframes transSlideEnter { from { transform: translateX(100%); } to { transform: translateX(0); } }
  @keyframes transSlideExit { from { transform: translateX(0); } to { transform: translateX(-100%); } }
  .trans-slide-enter { animation: transSlideEnter 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; z-index: 10; }
  .trans-slide-exit { animation: transSlideExit 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; z-index: 1; }

  @keyframes transSlideRightEnter { from { transform: translateX(-100%); } to { transform: translateX(0); } }
  @keyframes transSlideRightExit { from { transform: translateX(0); } to { transform: translateX(100%); } }
  .trans-slide-right-enter { animation: transSlideRightEnter 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; z-index: 10; }
  .trans-slide-right-exit { animation: transSlideRightExit 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; z-index: 1; }

  @keyframes transSlideUpEnter { from { transform: translateY(100%); } to { transform: translateY(0); } }
  @keyframes transSlideUpExit { from { transform: translateY(0); } to { transform: translateY(-100%); } }
  .trans-slide-up-enter { animation: transSlideUpEnter 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; z-index: 10; }
  .trans-slide-up-exit { animation: transSlideUpExit 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; z-index: 1; }

  @keyframes transSlideDownEnter { from { transform: translateY(-100%); } to { transform: translateY(0); } }
  @keyframes transSlideDownExit { from { transform: translateY(0); } to { transform: translateY(100%); } }
  .trans-slide-down-enter { animation: transSlideDownEnter 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; z-index: 10; }
  .trans-slide-down-exit { animation: transSlideDownExit 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; z-index: 1; }

  @keyframes transZoomEnter { from { opacity: 0; transform: scale(1.1); } to { opacity: 1; transform: scale(1); } }
  @keyframes transZoomExit { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); } }
  .trans-zoom-enter { animation: transZoomEnter 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; z-index: 10; }
  .trans-zoom-exit { animation: transZoomExit 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; z-index: 1; }

  @keyframes transZoomOutEnter { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
  @keyframes transZoomOutExit { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(1.2); } }
  .trans-zoom-out-enter { animation: transZoomOutEnter 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; z-index: 10; }
  .trans-zoom-out-exit { animation: transZoomOutExit 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; z-index: 1; }

  @keyframes transFlipEnter { from { opacity: 0; transform: rotateY(90deg); } to { opacity: 1; transform: rotateY(0deg); } }
  @keyframes transFlipExit { from { opacity: 1; transform: rotateY(0deg); } to { opacity: 0; transform: rotateY(-90deg); } }
  .trans-flip-enter { animation: transFlipEnter 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; z-index: 10; backface-visibility: hidden; }
  .trans-flip-exit { animation: transFlipExit 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; z-index: 1; backface-visibility: hidden; }

  @keyframes transRotateEnter { from { opacity: 0; transform: rotate(-90deg) scale(0.5); } to { opacity: 1; transform: rotate(0) scale(1); } }
  @keyframes transRotateExit { from { opacity: 1; transform: rotate(0) scale(1); } to { opacity: 0; transform: rotate(90deg) scale(0.5); } }
  .trans-rotate-enter { animation: transRotateEnter 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; z-index: 10; }
  .trans-rotate-exit { animation: transRotateExit 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; z-index: 1; }

  @keyframes transBlurEnter { from { opacity: 0; filter: blur(20px); } to { opacity: 1; filter: blur(0); } }
  @keyframes transBlurExit { from { opacity: 1; filter: blur(0); } to { opacity: 0; filter: blur(20px); } }
  .trans-blur-enter { animation: transBlurEnter 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; z-index: 10; }
  .trans-blur-exit { animation: transBlurExit 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; z-index: 1; }

  /* Container Queries for responsive scaling */
  .slide-container { container-type: inline-size; container-name: slide; }

  /* Utilities */
  .canvas-container { aspect-ratio: 16/9; position: relative; overflow: hidden; }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

const injectStyles = () => {
  if (document.getElementById('presentation-styles')) return;
  const style = document.createElement('style');
  style.id = 'presentation-styles';
  style.innerHTML = PRESENTATION_CSS;
  document.head.appendChild(style);
};

// --- HTML GENERATOR FOR EXPORT ---
const getStandaloneScript = (themeJson, dataStr) => `
  const { useState, useEffect, useCallback } = React;
  const THEMES = ${themeJson};
  const data = ${dataStr};

  const getDirectImageUrl = (url) => {
    if (!url) return url;
    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
      const match = url.match(/(?:file\\/d\\/|id=)([\\w-]+)/);
      if (match && match[1]) {
        return 'https://drive.google.com/uc?export=view&id=' + match[1];
      }
    }
    return url;
  };

  function Presenter({ slides, startIndex, brandSettings }) {
    const [currentIndex, setCurrentIndex] = useState(startIndex || 0);
    const [prevIndex, setPrevIndex] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const goToNext = useCallback(() => {
      if (isTransitioning || currentIndex === slides.length - 1) return;
      setPrevIndex(currentIndex);
      setCurrentIndex(c => c + 1);
      setIsTransitioning(true);
      setTimeout(() => setIsTransitioning(false), 800);
    }, [currentIndex, isTransitioning, slides.length]);

    const goToPrev = useCallback(() => {
      if (isTransitioning || currentIndex === 0) return;
      setPrevIndex(currentIndex);
      setCurrentIndex(c => c - 1);
      setIsTransitioning(true);
      setTimeout(() => setIsTransitioning(false), 800);
    }, [currentIndex, isTransitioning]);

    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === 'ArrowRight' || e.key === 'Space') goToNext();
        if (e.key === 'ArrowLeft') goToPrev();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToNext, goToPrev]);

    const renderBrandingOverlay = (themeConfig) => {
      if (!brandSettings || (!brandSettings.logoUrl && !brandSettings.websiteUrl)) return null;
      let posClasses = "bottom-6 right-6 flex-row";
      if (brandSettings.position === 'bottom-left') posClasses = "bottom-6 left-6 flex-row-reverse";
      if (brandSettings.position === 'top-right') posClasses = "top-6 right-6 flex-row";
      if (brandSettings.position === 'top-left') posClasses = "top-6 left-6 flex-row-reverse";

      return React.createElement('div', {
        className: "absolute " + posClasses + " z-[60] flex items-center gap-4 pointer-events-none opacity-90",
        style: { color: themeConfig.color, fontFamily: themeConfig.fontFamily }
      },
        brandSettings.websiteUrl && React.createElement('span', { className: "text-2xl font-semibold drop-shadow-lg tracking-wider" }, brandSettings.websiteUrl),
        brandSettings.logoUrl && React.createElement('img', { src: getDirectImageUrl(brandSettings.logoUrl), alt: "Logo", className: "h-12 object-contain drop-shadow-lg" })
      );
    };

    return React.createElement('div', { className: "fixed inset-0 bg-black z-50 overflow-hidden font-sans" },
      React.createElement('div', { className: "relative w-full h-full" },
        renderBrandingOverlay(THEMES[slides[currentIndex].theme]),
        slides.map((slide, idx) => {
          let transClass = '';
          const transType = slide.transition || 'fade';
          if (idx === currentIndex) {
             transClass = isTransitioning ? 'trans-' + transType + '-enter' : 'z-10 opacity-100 transform-none';
          } else if (idx === prevIndex) {
             transClass = isTransitioning ? 'trans-' + transType + '-exit' : 'hidden';
          } else {
             return null;
          }

          return React.createElement('div', {
            key: slide.id,
            className: "slide-transition slide-container " + transClass,
            style: { background: THEMES[slide.theme].background }
          },
            React.createElement('div', { className: "w-full h-full relative" },
              slide.elements.map(el => {
                const animationClass = idx === currentIndex && !isTransitioning ? 'anim-' + (el.animation || 'none') : 'opacity-0';
                const elStyle = {
                  position: 'absolute', left: el.x + '%', top: el.y + '%', width: el.width + '%', height: el.height + '%',
                  color: el.color || THEMES[slide.theme].color, fontFamily: el.fontFamily || THEMES[slide.theme].fontFamily,
                  fontSize: el.fontSize + 'cqw', fontWeight: el.fontWeight || '400', fontStyle: el.fontStyle || 'normal',
                  textAlign: el.textAlign || 'left', animationDelay: (el.delay || 0) + 's', display: 'flex', flexDirection: 'column',
                  justifyContent: el.type === 'text' ? 'flex-start' : 'center'
                };

                let content;
                if (el.type === 'text') {
                  content = React.createElement('div', { className: "w-full h-full whitespace-pre-wrap break-words p-[2%]", style: { lineHeight: 1.2 } }, el.content);
                } else if (el.type === 'video') {
                  content = React.createElement('div', { className: "w-full h-full p-[2%]" },
                    React.createElement('video', { 
                      src: getDirectImageUrl(el.content), 
                      className: "w-full h-full shadow-2xl", 
                      style: { 
                        objectFit: el.objectFit || 'cover',
                        borderRadius: el.borderRadius !== undefined 
                          ? (el.borderRadius >= 50 ? el.borderRadius + '%' : el.borderRadius + 'px') 
                          : '8px' 
                      },
                      autoPlay: el.autoPlay !== false,
                      muted: el.autoPlay !== false,
                      loop: el.loop,
                      controls: el.controls
                    })
                  );
                } else if (el.type === 'image') {
                  content = React.createElement('div', { className: "w-full h-full p-[2%]" },
                    React.createElement('img', { 
                      src: getDirectImageUrl(el.content), 
                      alt: "", 
                      className: "w-full h-full shadow-2xl", 
                      style: { 
                        objectFit: el.objectFit || 'cover',
                        borderRadius: el.borderRadius !== undefined 
                          ? (el.borderRadius >= 50 ? el.borderRadius + '%' : el.borderRadius + 'px') 
                          : '8px' 
                      } 
                    })
                  );
                } else if (el.type === 'shape') {
                  let shapeContent;
                  if (el.shapeType === 'rect') shapeContent = React.createElement('div', { className: "w-full h-full shadow-2xl", style: { backgroundColor: el.color, borderRadius: '8px' } });
                  else if (el.shapeType === 'circle') shapeContent = React.createElement('div', { className: "w-full h-full shadow-2xl", style: { backgroundColor: el.color, borderRadius: '50%' } });
                  else if (el.shapeType === 'triangle') shapeContent = React.createElement('svg', { width: "100%", height: "100%", viewBox: "0 0 100 100", preserveAspectRatio: "none", className: "drop-shadow-2xl" }, React.createElement('polygon', { points: "50,0 100,100 0,100", fill: el.color }));
                  else if (el.shapeType === 'line') shapeContent = React.createElement('div', { className: "w-full h-[4px]", style: { backgroundColor: el.color, borderRadius: '2px' } });
                  content = React.createElement('div', { className: "w-full h-full p-[2%] flex items-center justify-center" }, shapeContent);
                }

                return React.createElement('div', { key: el.id, className: animationClass, style: elStyle }, content);
              })
            )
          );
        })
      ),
      React.createElement('div', { className: "absolute bottom-4 left-0 right-0 flex justify-between px-6 z-50 opacity-0 hover:opacity-100 transition-opacity duration-300" },
        React.createElement('div', { className: "text-white/50 text-sm font-medium bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md" },
          (currentIndex + 1) + " / " + slides.length
        ),
        React.createElement('div', { className: "flex gap-2" },
          React.createElement('button', { onClick: goToPrev, disabled: currentIndex === 0, className: "p-2 bg-black/40 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all disabled:opacity-30" }, "←"),
          React.createElement('button', { onClick: goToNext, disabled: currentIndex === slides.length - 1, className: "p-2 bg-black/40 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all disabled:opacity-30" }, "→")
        ),
        React.createElement('div', { className: "w-[88px]" })
      )
    );
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement(Presenter, { slides: data.slides, brandSettings: data.brandSettings, startIndex: 0 }));
`;

// --- HELPER FUNCTIONS ---
const generateId = () => Math.random().toString(36).substr(2, 9);

const createNewSlide = (theme = 'luxury-black', templateIndex = 0) => {
  const template = SLIDE_TEMPLATES[templateIndex];
  return {
    id: generateId(),
    theme: theme,
    transition: 'fade',
    elements: template.elements.map(el => ({ ...el, id: generateId() }))
  };
};

// --- MAIN APPLICATION ---
export default function App() {
  const [mode, setMode] = useState('editor'); // 'editor' | 'presenter'
  const [slides, setSlides] = useState([createNewSlide('luxury-black', 0)]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [brandSettings, setBrandSettings] = useState({ logoUrl: '', websiteUrl: '', position: 'bottom-right' });
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    injectStyles();
    localforage.getItem('webpresent_data').then((data) => {
      if (data) {
        if (data.slides) setSlides(data.slides);
        if (data.brandSettings) setBrandSettings(data.brandSettings);
      }
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localforage.setItem('webpresent_data', { slides, brandSettings });
    }
  }, [slides, brandSettings, isLoading]);

  const clearData = () => {
    if (window.confirm("Are you sure you want to clear all saved presentation data and start fresh?")) {
      localforage.removeItem('webpresent_data').then(() => {
        window.location.reload();
      });
    }
  };

  const currentSlide = slides[currentSlideIndex];
  const selectedElement = currentSlide?.elements.find(e => e.id === selectedElementId);

  if (isLoading) {
    return <div className="fixed inset-0 bg-black flex items-center justify-center text-white z-50">Loading Data...</div>;
  }

  // --- ACTIONS ---
  const addSlide = (templateIndex = 0) => {
    const newSlide = createNewSlide(currentSlide.theme, templateIndex);
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
    setSelectedElementId(null);
  };

  const deleteSlide = (index) => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    setCurrentSlideIndex(Math.min(currentSlideIndex, newSlides.length - 1));
    setSelectedElementId(null);
  };

  const duplicateSlide = (index) => {
    const slideToCopy = slides[index];
    const newSlide = {
      ...slideToCopy,
      id: generateId(),
      elements: slideToCopy.elements.map(e => ({ ...e, id: generateId() }))
    };
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, newSlide);
    setSlides(newSlides);
    setCurrentSlideIndex(index + 1);
  };

  const updateSlide = (updates) => {
    setSlides(prevSlides => {
      const newSlides = [...prevSlides];
      if (!newSlides[currentSlideIndex]) return prevSlides;
      newSlides[currentSlideIndex] = { ...newSlides[currentSlideIndex], ...updates };
      return newSlides;
    });
  };

  const addElement = (elementType) => {
    const defaultColor = THEMES[currentSlide.theme].color;
    const defaultFont = THEMES[currentSlide.theme].fontFamily;
    
    let newElement = {
      id: generateId(),
      x: 30, y: 30, width: 40, height: 20,
      fontFamily: defaultFont,
      color: defaultColor,
      animation: 'fade-in',
      delay: 0,
      textAlign: 'left'
    };

    switch(elementType) {
      case 'heading':
        newElement = { ...newElement, type: 'text', content: 'Heading', fontSize: 6, fontWeight: '700', textAlign: 'center' };
        break;
      case 'subheading':
        newElement = { ...newElement, type: 'text', content: 'Subheading', fontSize: 3.5, fontWeight: '600', textAlign: 'center' };
        break;
      case 'body':
        newElement = { ...newElement, type: 'text', content: 'Add your body text here.', fontSize: 2, fontWeight: '400' };
        break;
      case 'quote':
        newElement = { ...newElement, type: 'text', content: '"Insert inspiring quote here"', fontSize: 3, fontWeight: '400', fontStyle: 'italic', textAlign: 'center' };
        break;
      case 'list':
        newElement = { ...newElement, type: 'text', content: '• First Point\n• Second Point\n• Third Point', fontSize: 2, fontWeight: '400' };
        break;
      case 'image':
        newElement = { ...newElement, type: 'image', content: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80', objectFit: 'cover', fontSize: 2, fontWeight: '400', borderRadius: 8 };
        break;
      case 'video':
        newElement = { ...newElement, type: 'video', content: 'https://cdn.pixabay.com/vimeo/32828822/water-24651.mp4?width=640', objectFit: 'cover', fontSize: 2, fontWeight: '400', borderRadius: 8, autoPlay: true, loop: true, controls: false };
        break;
      case 'shape-rect':
        newElement = { ...newElement, type: 'shape', shapeType: 'rect', color: defaultColor, fontSize: 2, fontWeight: '400', content: '' };
        break;
      case 'shape-circle':
        newElement = { ...newElement, type: 'shape', shapeType: 'circle', color: defaultColor, fontSize: 2, fontWeight: '400', content: '', width: 20, height: 20 * (16/9) };
        break;
      case 'shape-triangle':
        newElement = { ...newElement, type: 'shape', shapeType: 'triangle', color: defaultColor, width: 20, height: 20 * (16/9), content: '' };
        break;
      case 'shape-line':
        newElement = { ...newElement, type: 'shape', shapeType: 'line', color: defaultColor, width: 30, height: 1, content: '' };
        break;
      default:
        newElement = { ...newElement, type: 'text', content: 'New Element', fontSize: 2, fontWeight: '400' };
    }
    
    updateSlide({ elements: [...currentSlide.elements, newElement] });
    setSelectedElementId(newElement.id);
  };

  const updateElement = (id, updates) => {
    setSlides(prevSlides => {
      const currentSlideRef = prevSlides[currentSlideIndex];
      if (!currentSlideRef) return prevSlides;
      const newElements = currentSlideRef.elements.map(el => 
        el.id === id ? { ...el, ...updates } : el
      );
      const newSlides = [...prevSlides];
      newSlides[currentSlideIndex] = { ...currentSlideRef, elements: newElements };
      return newSlides;
    });
  };

  const deleteElement = (id) => {
    updateSlide({ elements: currentSlide.elements.filter(e => e.id !== id) });
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const handleImageUpload = (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      // Return the base64 string
      callback(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({ slides, brandSettings }).replace(/<\/script>/g, '<\\/script>');
    const themeJson = JSON.stringify(THEMES);
    
    const scriptContent = getStandaloneScript(themeJson, dataStr);

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Presentation</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>${PRESENTATION_CSS}</style>
</head>
<body class="bg-black overflow-hidden font-sans text-white m-0 p-0">
  <div id="root" class="w-screen h-screen"></div>
  <script id="presentation-data" type="application/json">${dataStr}</script>
  <script>${scriptContent}</script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const html = event.target.result;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const scriptTag = doc.getElementById('presentation-data');
      
      if (scriptTag) {
        try {
          const data = JSON.parse(scriptTag.textContent);
          if (data.slides) setSlides(data.slides);
          if (data.brandSettings) setBrandSettings(data.brandSettings);
          setCurrentSlideIndex(0);
          setSelectedElementId(null);
        } catch (err) {
          alert("Invalid presentation file format.");
        }
      } else {
        alert("Could not find presentation data in this HTML file.");
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const renderBrandingOverlay = (themeConfig) => {
    if (!brandSettings.logoUrl && !brandSettings.websiteUrl) return null;
    let posClasses = "bottom-4 right-4 flex-row";
    if (brandSettings.position === 'bottom-left') posClasses = "bottom-4 left-4 flex-row-reverse";
    if (brandSettings.position === 'top-right') posClasses = "top-4 right-4 flex-row";
    if (brandSettings.position === 'top-left') posClasses = "top-4 left-4 flex-row-reverse";

    return (
      <div className={`absolute ${posClasses} z-[45] flex items-center gap-4 pointer-events-none opacity-90`} style={{ color: themeConfig.color, fontFamily: themeConfig.fontFamily }}>
        {brandSettings.websiteUrl && <span className="text-[1.8cqw] font-semibold drop-shadow-md tracking-wider">{brandSettings.websiteUrl}</span>}
        {brandSettings.logoUrl && <img src={getDirectImageUrl(brandSettings.logoUrl)} alt="Logo" className="h-[5cqw] object-contain drop-shadow-md" />}
      </div>
    );
  };

  // --- RENDERERS ---

  if (mode === 'presenter') {
    return (
      <Presenter 
        slides={slides} 
        onExit={() => setMode('editor')} 
        startIndex={currentSlideIndex}
        brandSettings={brandSettings}
      />
    );
  }

  return (
    <div className="flex h-screen w-full bg-neutral-900 text-neutral-200 font-sans overflow-hidden relative">
      {/* LEFT SIDEBAR - SLIDES */}
      <div className={`${leftPanelOpen ? 'w-64 border-r border-neutral-800' : 'w-0 border-r-0 border-transparent'} overflow-hidden transition-[width,border-color] duration-300 ease-in-out bg-neutral-950 flex flex-col z-40 shrink-0 h-full absolute md:relative left-0 top-0 shadow-2xl md:shadow-none`}>
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center min-w-[16rem]">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-blue-500" />
            <span className="font-semibold text-sm uppercase tracking-wider">Slides</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => addSlide()} className="p-1 hover:bg-neutral-800 rounded-md transition-colors" title="Add Slide">
              <Plus size={18} />
            </button>
            <button onClick={() => setLeftPanelOpen(false)} className="p-1 hover:bg-neutral-800 rounded-md transition-colors text-neutral-400" title="Close Panel">
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar min-w-[16rem]">
          {slides.map((slide, idx) => (
            <div 
              key={slide.id}
              className={`relative group cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${currentSlideIndex === idx ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-transparent hover:border-neutral-700'}`}
              onClick={() => { setCurrentSlideIndex(idx); setSelectedElementId(null); }}
            >
              <div className="absolute top-2 left-2 z-20 bg-black/60 px-2 py-0.5 rounded text-xs backdrop-blur-sm">
                {idx + 1}
              </div>
              
              {/* Slide Thumbnail Preview */}
              <div className="w-full aspect-video pointer-events-none transform scale-100 origin-top-left slide-container relative" style={{ background: THEMES[slide.theme].background }}>
                 {renderBrandingOverlay(THEMES[slide.theme])}
                 {slide.elements.map(el => (
                    <div
                      key={el.id}
                      style={{
                        position: 'absolute',
                        left: `${el.x}%`, top: `${el.y}%`,
                        width: `${el.width}%`, height: `${el.height}%`,
                        color: el.color || THEMES[slide.theme].color,
                        fontFamily: el.fontFamily || THEMES[slide.theme].fontFamily,
                        fontSize: `${el.fontSize}cqw`, 
                        fontWeight: el.fontWeight,
                        textAlign: el.textAlign,
                        fontStyle: el.fontStyle,
                        opacity: 0.8,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: el.type === 'text' ? 'flex-start' : 'center',
                      }}
                    >
                      {el.type === 'text' && (
                        <div className="w-full h-full whitespace-pre-wrap break-words px-[2%]" style={{ lineHeight: 1.2 }}>
                          {el.content}
                        </div>
                      )}
                      {el.type === 'video' && (
                        <video 
                          src={getDirectImageUrl(el.content)} 
                          autoPlay={el.autoPlay !== false} muted={el.autoPlay !== false} loop={el.loop} controls={el.controls}
                          className="w-full h-full px-[2%]" 
                          style={{ 
                            objectFit: el.objectFit || 'cover',
                            borderRadius: el.borderRadius !== undefined 
                              ? (el.borderRadius >= 50 ? `${el.borderRadius}%` : `${el.borderRadius}px`) 
                              : '8px' 
                          }} 
                        />
                      )}
                      {el.type === 'image' && (
                        <img 
                          src={getDirectImageUrl(el.content)} 
                          alt="" 
                          className="w-full h-full px-[2%]" 
                          style={{ 
                            objectFit: el.objectFit || 'cover',
                            borderRadius: el.borderRadius !== undefined 
                              ? (el.borderRadius >= 50 ? `${el.borderRadius}%` : `${el.borderRadius}px`) 
                              : '8px' 
                          }} 
                        />
                      )}
                      {el.type === 'shape' && (
                        <div className="w-full h-full px-[2%] flex items-center justify-center">
                          {el.shapeType === 'rect' && <div className="w-full h-full" style={{ backgroundColor: el.color, borderRadius: '8px' }} />}
                          {el.shapeType === 'circle' && <div className="w-full h-full" style={{ backgroundColor: el.color, borderRadius: '50%' }} />}
                          {el.shapeType === 'triangle' && (
                            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <polygon points="50,0 100,100 0,100" fill={el.color} />
                            </svg>
                          )}
                          {el.shapeType === 'line' && <div className="w-full h-[4px]" style={{ backgroundColor: el.color, borderRadius: '2px' }} />}
                        </div>
                      )}
                    </div>
                 ))}
              </div>

              {/* Thumbnail Actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button onClick={(e) => { e.stopPropagation(); duplicateSlide(idx); }} className="p-1.5 bg-neutral-800/80 hover:bg-blue-600 rounded text-white backdrop-blur-md">
                  <Copy size={12} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); deleteSlide(idx); }} className="p-1.5 bg-neutral-800/80 hover:bg-red-600 rounded text-white backdrop-blur-md">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER - CANVAS */}
      <div className="flex-1 flex flex-col relative bg-neutral-900 min-w-0 h-full">
        {/* Top Toolbar */}
        <div className="min-h-[3.5rem] py-2 border-b border-neutral-800 flex items-center justify-between px-2 md:px-4 bg-neutral-950/50 backdrop-blur-md z-30 shrink-0 flex-wrap gap-2">
          <div className="flex gap-2 items-center">
            <button 
              onClick={() => setLeftPanelOpen(!leftPanelOpen)} 
              className={`p-2 rounded-md transition-colors ${leftPanelOpen ? 'text-blue-400 bg-blue-500/10' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`} 
              title="Toggle Slides"
            >
              {leftPanelOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
            </button>
            
            <div className="w-px h-6 bg-neutral-700 mx-1 hidden md:block" />

            <input type="file" accept=".html" ref={fileInputRef} className="hidden" onChange={handleImport} />
            <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 px-3 py-1.5 text-xs md:text-sm bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors border border-neutral-700 whitespace-nowrap" title="Import HTML">
              <Upload size={16} /> <span className="hidden sm:inline">Import</span>
            </button>
            <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 text-xs md:text-sm bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors border border-neutral-700 whitespace-nowrap" title="Export HTML">
              <Download size={16} /> <span className="hidden sm:inline">Export</span>
            </button>
            <button onClick={clearData} className="flex items-center gap-2 px-3 py-1.5 text-xs md:text-sm bg-red-900/40 hover:bg-red-800 text-red-500 hover:text-white rounded-md transition-colors border border-red-800/50 whitespace-nowrap" title="Clear Saved Data">
              <Trash2 size={16} /> <span className="hidden sm:inline">Clear Data</span>
            </button>

            <div className="w-px h-6 bg-neutral-700 mx-1 md:mx-2" />

            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 text-xs md:text-sm bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors border border-neutral-700 whitespace-nowrap">
                <Shapes size={16} /> <span className="hidden sm:inline">Elements</span>
              </button>
              <div className="absolute top-full left-0 mt-2 w-56 bg-neutral-800 border border-neutral-700 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden flex flex-col">
                {ELEMENTS_MENU.map((category, idx) => (
                  <div key={idx} className="border-b border-neutral-700 last:border-0 pb-1 mb-1 last:pb-0 last:mb-0">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-widest bg-neutral-900/50">{category.category}</div>
                    {category.items.map(item => (
                      <button 
                        key={item.id} 
                        onClick={() => addElement(item.id)} 
                        className="w-full text-left px-4 py-2 text-sm hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-3"
                      >
                        {item.icon} {item.name}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="w-px h-6 bg-neutral-700 mx-1 md:mx-2" />
            
            <button 
              onClick={() => setIsTemplateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 text-xs md:text-sm bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-md transition-colors border border-blue-600/50 whitespace-nowrap"
            >
              <Layout size={16} /> <span className="hidden sm:inline font-medium">Templates</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2 ml-auto pl-4 min-w-max">
            <button 
              onClick={() => setMode('presenter')} 
              className="flex items-center gap-2 px-4 md:px-5 py-1.5 md:py-2 text-xs md:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors shadow-[0_0_15px_rgba(59,130,246,0.4)] whitespace-nowrap"
            >
              <MonitorPlay size={16} /> <span className="hidden sm:inline">Present</span>
            </button>
            <div className="w-px h-6 bg-neutral-700 mx-1 hidden md:block" />
            <button 
              onClick={() => setRightPanelOpen(!rightPanelOpen)} 
              className={`p-2 rounded-md transition-colors ${rightPanelOpen ? 'text-blue-400 bg-blue-500/10' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`} 
              title="Toggle Properties"
            >
              {rightPanelOpen ? <PanelRightClose size={18} /> : <PanelRight size={18} />}
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div 
          className="flex-1 overflow-auto flex items-center justify-center p-4 md:p-8 relative"
          onClick={() => setSelectedElementId(null)}
        >
          <div 
            className="canvas-container slide-container w-full max-w-5xl shadow-2xl ring-1 ring-neutral-800 rounded-lg"
            style={{ background: THEMES[currentSlide.theme].background }}
          >
            {renderBrandingOverlay(THEMES[currentSlide.theme])}
            {currentSlide.elements.map(el => (
              <DraggableElement
                key={el.id}
                element={el}
                isSelected={selectedElementId === el.id}
                onSelect={(e) => { e.stopPropagation(); setSelectedElementId(el.id); }}
                onChange={(updates) => updateElement(el.id, updates)}
                theme={THEMES[currentSlide.theme]}
              />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR - PROPERTIES */}
      <div className={`${rightPanelOpen ? 'w-80 border-l border-neutral-800' : 'w-0 border-l-0 border-transparent'} overflow-hidden transition-[width,border-color] duration-300 ease-in-out bg-neutral-950 flex flex-col z-40 shrink-0 h-full absolute md:relative right-0 top-0 shadow-2xl md:shadow-none`}>
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between sticky top-0 bg-neutral-950/90 backdrop-blur-sm z-10 min-w-[20rem]">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-neutral-400" />
            <span className="font-semibold text-sm uppercase tracking-wider">Properties</span>
          </div>
          <button onClick={() => setRightPanelOpen(false)} className="p-1 hover:bg-neutral-800 rounded-md transition-colors text-neutral-400" title="Close Panel">
              <X size={18} />
          </button>
        </div>
        
        <div className="p-5 space-y-6 overflow-y-auto hide-scrollbar min-w-[20rem] pb-24">
          {!selectedElement ? (
            // Slide Properties
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Palette size={14}/> Slide Theme</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(THEMES).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => updateSlide({ theme: key })}
                      className={`p-3 text-left rounded-md border transition-all ${currentSlide.theme === key ? 'border-blue-500 bg-blue-500/10' : 'border-neutral-700 bg-neutral-900 hover:border-neutral-500'}`}
                    >
                      <div className="w-full h-8 rounded mb-2 shadow-inner" style={{ background: theme.background }}></div>
                      <span className="text-xs font-medium">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Slide Transition</h3>
                <select 
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  value={currentSlide.transition}
                  onChange={(e) => updateSlide({ transition: e.target.value })}
                >
                  {TRANSITIONS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className="pt-4 border-t border-neutral-800">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Globe size={14}/> Global Branding
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Logo Image (URL or Upload)</label>
                    <div className="flex gap-2">
                      <input type="text" className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500" value={brandSettings.logoUrl} onChange={(e) => setBrandSettings({...brandSettings, logoUrl: e.target.value})} placeholder="https://..." />
                      <label className="flex items-center justify-center px-3 bg-neutral-800 border border-neutral-700 rounded-md cursor-pointer hover:bg-neutral-700 transition-colors" title="Upload Local Image">
                        <Upload size={16} className="text-neutral-400" />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (base64) => setBrandSettings({...brandSettings, logoUrl: base64}))} />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Website URL / Text</label>
                    <input type="text" className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500" value={brandSettings.websiteUrl} onChange={(e) => setBrandSettings({...brandSettings, websiteUrl: e.target.value})} placeholder="www.yourwebsite.com" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Position</label>
                    <select className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500" value={brandSettings.position} onChange={(e) => setBrandSettings({...brandSettings, position: e.target.value})}>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="top-left">Top Left</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Element Properties
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                  {selectedElement.type === 'text' && <Type size={14}/>}
                  {selectedElement.type === 'image' && <ImageIcon size={14}/>} 
                  {selectedElement.type === 'video' && <Video size={14}/>} 
                  {selectedElement.type === 'shape' && <Shapes size={14}/>} 
                  {selectedElement.type} Settings
                </h3>
                <button onClick={() => deleteElement(selectedElement.id)} className="text-red-400 hover:text-red-300 p-1 bg-red-400/10 rounded">
                  <Trash2 size={14} />
                </button>
              </div>

              {selectedElement.type === 'text' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Content</label>
                    <textarea 
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 min-h-[80px]"
                      value={selectedElement.content || ''}
                      onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                    />
                  </div>
                  
                  <div className="bg-neutral-900/50 p-3 rounded-md border border-neutral-800">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Quick Styles</label>
                    <select 
                      className="w-full bg-neutral-800 border border-neutral-700 text-blue-400 font-medium rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const preset = TEXT_PRESETS.find(p => p.name === e.target.value);
                        if (preset && preset.props) {
                          updateElement(selectedElement.id, preset.props);
                        }
                        e.target.value = ""; // Reset dropdown after applying
                      }}
                    >
                      <option value="">Apply a Style Preset...</option>
                      {TEXT_PRESETS.map(p => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Font Family</label>
                      <select 
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        value={selectedElement.fontFamily || ''}
                        onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                      >
                        <option value="">Theme Default</option>
                        {FONTS.map(f => <option key={f.name} value={f.family}>{f.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Font Size (Scale)</label>
                      <input 
                        type="number" step="0.1"
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        value={selectedElement.fontSize ? Number(selectedElement.fontSize).toFixed(1) : 0}
                        onChange={(e) => updateElement(selectedElement.id, { fontSize: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Weight</label>
                      <select 
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-2 py-2 text-sm focus:outline-none focus:border-blue-500"
                        value={selectedElement.fontWeight || '400'}
                        onChange={(e) => updateElement(selectedElement.id, { fontWeight: e.target.value })}
                      >
                        <option value="300">Light</option>
                        <option value="400">Regular</option>
                        <option value="600">Semibold</option>
                        <option value="700">Bold</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Style</label>
                      <select 
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-2 py-2 text-sm focus:outline-none focus:border-blue-500"
                        value={selectedElement.fontStyle || 'normal'}
                        onChange={(e) => updateElement(selectedElement.id, { fontStyle: e.target.value })}
                      >
                        <option value="normal">Normal</option>
                        <option value="italic">Italic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Color</label>
                      <div className="flex items-center bg-neutral-900 border border-neutral-700 rounded-md overflow-hidden pr-1">
                        <input 
                          type="color" 
                          className="w-8 h-8 cursor-pointer bg-transparent border-0 p-1"
                          value={selectedElement.color || '#ffffff'}
                          onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                        />
                        <input 
                          type="text" 
                          className="w-full bg-transparent border-0 px-1 py-2 text-xs focus:outline-none uppercase"
                          value={selectedElement.color || '#ffffff'}
                          onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Alignment</label>
                    <div className="flex bg-neutral-900 rounded-md border border-neutral-700 overflow-hidden">
                      {['left', 'center', 'right'].map(align => (
                         <button 
                           key={align}
                           onClick={() => updateElement(selectedElement.id, { textAlign: align })}
                           className={`flex-1 py-1.5 text-xs capitalize ${selectedElement.textAlign === align ? 'bg-blue-600 text-white' : 'hover:bg-neutral-800'}`}
                         >{align}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(selectedElement.type === 'image' || selectedElement.type === 'video') && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Media (URL or Upload)</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        value={selectedElement.content || ''}
                        onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                        placeholder="https://..."
                      />
                      <label className="flex items-center justify-center px-3 bg-neutral-800 border border-neutral-700 rounded-md cursor-pointer hover:bg-neutral-700 transition-colors" title="Upload Local File">
                        <Upload size={16} className="text-neutral-400" />
                        <input type="file" accept={selectedElement.type === 'image' ? "image/*" : "video/*"} className="hidden" onChange={(e) => handleImageUpload(e, (base64) => updateElement(selectedElement.id, { content: base64 }))} />
                      </label>
                    </div>
                  </div>
                  
                  {selectedElement.type === 'video' && (
                    <div className="grid grid-cols-3 gap-2 bg-neutral-900 p-2 rounded-md border border-neutral-700">
                      <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                        <input type="checkbox" checked={selectedElement.autoPlay !== false} onChange={(e) => updateElement(selectedElement.id, { autoPlay: e.target.checked })} />
                        Autoplay
                      </label>
                      <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                        <input type="checkbox" checked={selectedElement.loop !== false} onChange={(e) => updateElement(selectedElement.id, { loop: e.target.checked })} />
                        Loop
                      </label>
                      <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                        <input type="checkbox" checked={selectedElement.controls || false} onChange={(e) => updateElement(selectedElement.id, { controls: e.target.checked })} />
                        Controls
                      </label>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Media Fit</label>
                    <select 
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      value={selectedElement.objectFit || 'cover'}
                      onChange={(e) => updateElement(selectedElement.id, { objectFit: e.target.value })}
                    >
                      <option value="cover">Cover (Fill & Crop)</option>
                      <option value="contain">Contain (Fit inside box)</option>
                      <option value="fill">Fill (Stretch)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Quick Aspect Ratio Lock</label>
                    <div className="flex bg-neutral-900 rounded-md border border-neutral-700 overflow-hidden">
                      <button onClick={() => updateElement(selectedElement.id, { height: selectedElement.width * (16/9) })} className="flex-1 py-1.5 text-xs hover:bg-neutral-800 transition-colors">1:1</button>
                      <button onClick={() => updateElement(selectedElement.id, { height: selectedElement.width })} className="flex-1 py-1.5 text-xs hover:bg-neutral-800 transition-colors border-l border-neutral-700">16:9</button>
                      <button onClick={() => updateElement(selectedElement.id, { height: selectedElement.width * (16/9) * (3/4) })} className="flex-1 py-1.5 text-xs hover:bg-neutral-800 transition-colors border-l border-neutral-700">4:3</button>
                      <button onClick={() => updateElement(selectedElement.id, { height: selectedElement.width * (16/9) * (16/9) })} className="flex-1 py-1.5 text-xs hover:bg-neutral-800 transition-colors border-l border-neutral-700">9:16</button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Border Radius</label>
                    <div className="flex gap-2 items-center">
			                <input 
			                  type="number" min="0" max="200"
			                  className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
			                  value={selectedElement.borderRadius !== undefined ? selectedElement.borderRadius : 8}
			                  onChange={(e) => updateElement(selectedElement.id, { borderRadius: Number(e.target.value) })}
			                />
			                <button 
			                  onClick={() => updateElement(selectedElement.id, { borderRadius: 50 })}
			                  className={`px-3 py-2 text-xs rounded-md border transition-colors whitespace-nowrap ${selectedElement.borderRadius >= 50 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700'}`}
			                >
			                  50% Circle
			                </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedElement.type === 'shape' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Fill Color</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                        value={selectedElement.color || '#ffffff'}
                        onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                      />
                      <input 
                        type="text" 
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                        value={selectedElement.color || '#ffffff'}
                        onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-neutral-800 space-y-4">
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Animation</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Effect</label>
                    <select 
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      value={selectedElement.animation || 'none'}
                      onChange={(e) => updateElement(selectedElement.id, { animation: e.target.value })}
                    >
                      {ANIMATIONS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Delay (s)</label>
                    <input 
                      type="number" step="0.1" min="0"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      value={selectedElement.delay || 0}
                      onChange={(e) => updateElement(selectedElement.id, { delay: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 space-y-4">
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Position & Size (%)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">X Position</label>
                    <input type="number" className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-1.5 text-sm" value={Math.round(selectedElement.x || 0)} onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Y Position</label>
                    <input type="number" className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-1.5 text-sm" value={Math.round(selectedElement.y || 0)} onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Width</label>
                    <input type="number" className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-1.5 text-sm" value={Math.round(selectedElement.width || 0)} onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Height</label>
                    <input type="number" className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-1.5 text-sm" value={Math.round(selectedElement.height || 0)} onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })} />
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* TEMPLATE PREVIEW MODAL */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm">
          <div className="bg-neutral-900 w-full max-w-6xl h-full max-h-[85vh] rounded-xl flex flex-col overflow-hidden border border-neutral-700 shadow-2xl animate-fade-in">
            <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><Layout size={20} className="text-blue-500" /> Choose a Template</h2>
              <button onClick={() => setIsTemplateModalOpen(false)} className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto hide-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-neutral-900">
              {SLIDE_TEMPLATES.map((tpl, i) => (
                <div 
                  key={i} 
                  onClick={() => { addSlide(i); setIsTemplateModalOpen(false); }}
                  className="cursor-pointer border-2 border-neutral-800 hover:border-blue-500 rounded-xl overflow-hidden group transition-all duration-200 bg-neutral-950 flex flex-col shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                >
                  <div className="w-full aspect-video pointer-events-none transform scale-100 origin-top-left slide-container relative" style={{ background: THEMES[currentSlide.theme].background }}>
                    {renderBrandingOverlay(THEMES[currentSlide.theme])}
                    {tpl.elements.map(el => (
                      <div
                        key={el.id}
                        style={{
                          position: 'absolute', left: `${el.x}%`, top: `${el.y}%`, width: `${el.width}%`, height: `${el.height}%`,
                          color: el.color || THEMES[currentSlide.theme].color, fontFamily: el.fontFamily || THEMES[currentSlide.theme].fontFamily,
                          fontSize: `${el.fontSize}cqw`, fontWeight: el.fontWeight, textAlign: el.textAlign, fontStyle: el.fontStyle, opacity: 0.9,
                          display: 'flex', flexDirection: 'column', justifyContent: el.type === 'text' ? 'flex-start' : 'center',
                        }}
                      >
                        {el.type === 'text' && <div className="w-full h-full whitespace-pre-wrap break-words px-[2%]" style={{ lineHeight: 1.2 }}>{el.content}</div>}
                        {el.type === 'video' && <video src={getDirectImageUrl(el.content)} autoPlay={el.autoPlay !== false} muted={el.autoPlay !== false} loop={el.loop} controls={el.controls} className="w-full h-full object-cover px-[2%]" style={{ borderRadius: el.borderRadius !== undefined ? (el.borderRadius >= 50 ? `${el.borderRadius}%` : `${el.borderRadius}px`) : '8px' }} />}
                        {el.type === 'image' && <img src={getDirectImageUrl(el.content)} className="w-full h-full object-cover px-[2%]" style={{ borderRadius: el.borderRadius !== undefined ? (el.borderRadius >= 50 ? `${el.borderRadius}%` : `${el.borderRadius}px`) : '8px' }} />}
                        {el.type === 'shape' && (
                          <div className="w-full h-full px-[2%] flex items-center justify-center">
                            {el.shapeType === 'rect' && <div className="w-full h-full" style={{ backgroundColor: el.color, borderRadius: '8px' }} />}
                            {el.shapeType === 'circle' && <div className="w-full h-full" style={{ backgroundColor: el.color, borderRadius: '50%' }} />}
                            {el.shapeType === 'triangle' && (
                              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <polygon points="50,0 100,100 0,100" fill={el.color} />
                              </svg>
                            )}
                            {el.shapeType === 'line' && <div className="w-full h-[4px]" style={{ backgroundColor: el.color, borderRadius: '2px' }} />}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-neutral-800 flex justify-between items-center bg-neutral-950">
                    <span className="font-semibold text-sm group-hover:text-blue-400 transition-colors">{tpl.name}</span>
                    <div className="opacity-0 group-hover:opacity-100 bg-blue-600 text-white text-xs px-3 py-1.5 rounded transition-opacity shadow-lg">Use Template</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// --- DRAGGABLE ELEMENT COMPONENT ---
const DraggableElement = React.memo(function DraggableElement({ element, isSelected, onSelect, onChange, theme }) {
  const elementRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const transientState = useRef({ ...element });

  useEffect(() => {
    // Keep transient state in sync with external property changes
    transientState.current = { ...element };
  }, [element]);

  // High-performance drag implementation (bypasses React state during movement)
  const handleMouseDown = (e) => {
    if (e.target.classList.contains('resize-handle')) return;
    e.stopPropagation();
    if (!isSelected) {
      onSelect(e); // Only trigger expensive React re-select tree update if NOT already selected
    }
    setIsDragging(true);

    const container = elementRef.current.parentElement;
    const rect = container.getBoundingClientRect();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = transientState.current.x;
    const initialY = transientState.current.y;

    const onMouseMove = (moveEvent) => {
      const dx = ((moveEvent.clientX - startX) / rect.width) * 100;
      const dy = ((moveEvent.clientY - startY) / rect.height) * 100;
      
      const newX = Math.max(-100, Math.min(200, initialX + dx));
      const newY = Math.max(-100, Math.min(200, initialY + dy));
      
      transientState.current.x = newX;
      transientState.current.y = newY;

      // Direct DOM manipulation for 60fps smoothness
      if (elementRef.current) {
        elementRef.current.style.left = `${newX}%`;
        elementRef.current.style.top = `${newY}%`;
      }
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      // Commit final position to React state once dropped
      onChange({ x: transientState.current.x, y: transientState.current.y });
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleResize = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    
    const container = elementRef.current.parentElement;
    const rect = container.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialW = transientState.current.width;
    const initialH = transientState.current.height;
    const initialFontSize = transientState.current.fontSize || 2;

    const onMouseMove = (moveEvent) => {
      const dx = ((moveEvent.clientX - startX) / rect.width) * 100;
      const dy = ((moveEvent.clientY - startY) / rect.height) * 100;
      
      const newWidth = Math.max(5, initialW + dx);
      const newHeight = Math.max(5, initialH + dy);
      
      transientState.current.width = newWidth;
      transientState.current.height = newHeight;

      // Direct DOM manipulation for 60fps smoothness
      if (elementRef.current) {
        elementRef.current.style.width = `${newWidth}%`;
        elementRef.current.style.height = `${newHeight}%`;
        
        if (element.type === 'text') {
          const newFontSize = initialFontSize * (newWidth / initialW);
          transientState.current.fontSize = newFontSize;
          elementRef.current.style.fontSize = `${newFontSize}cqw`;
        }
      }
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      const finalUpdates = { width: transientState.current.width, height: transientState.current.height };
      if (element.type === 'text') finalUpdates.fontSize = transientState.current.fontSize;
      
      // Commit final size to React state once dropped
      onChange(finalUpdates);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const style = {
    position: 'absolute',
    left: `${element.x}%`,
    top: `${element.y}%`,
    width: `${element.width}%`,
    height: `${element.height}%`,
    color: element.color || theme.color,
    fontFamily: element.fontFamily || theme.fontFamily,
    fontSize: `${element.fontSize}cqw`, // Responsive scaling using container queries
    fontWeight: element.fontWeight || '400',
    fontStyle: element.fontStyle || 'normal',
    textAlign: element.textAlign || 'left',
    cursor: isDragging ? 'grabbing' : 'grab',
    border: isSelected ? '2px dashed #3b82f6' : '2px dashed transparent',
    outline: 'none',
    zIndex: isSelected ? 50 : 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: element.type === 'text' ? 'flex-start' : 'center',
    userSelect: isDragging || isResizing ? 'none' : 'auto', // Prevents text selection bugs during drag
    willChange: isDragging || isResizing ? 'left, top, width, height, font-size' : 'auto' // GPU acceleration
  };

  return (
    <div 
      ref={elementRef}
      style={style}
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()}
      className={`group ${isSelected ? 'shadow-lg bg-white/5 backdrop-blur-sm' : 'hover:border-neutral-500/50'}`}
    >
      {element.type === 'text' && (
        <div className="w-full h-full whitespace-pre-wrap break-words p-[2%]" style={{ lineHeight: 1.2 }}>
          {element.content}
        </div>
      )}
      {element.type === 'video' && (
        <div className="w-full h-full p-[2%]">
          <video 
            src={getDirectImageUrl(element.content)} 
            autoPlay={element.autoPlay !== false} muted={element.autoPlay !== false} loop={element.loop} controls={element.controls}
            className={`w-full h-full shadow-xl ${element.controls ? 'pointer-events-auto' : 'pointer-events-none'}`}
            style={{ 
              objectFit: element.objectFit || 'cover',
              borderRadius: element.borderRadius !== undefined 
                ? (element.borderRadius >= 50 ? `${element.borderRadius}%` : `${element.borderRadius}px`)
                : '8px' 
            }} 
          />
        </div>
      )}
      {element.type === 'image' && (
        <div className="w-full h-full p-[2%]">
          <img 
            src={getDirectImageUrl(element.content)} 
            alt="element" 
            className="w-full h-full pointer-events-none shadow-xl" 
            style={{ 
              objectFit: element.objectFit || 'cover',
              borderRadius: element.borderRadius !== undefined 
                ? (element.borderRadius >= 50 ? `${element.borderRadius}%` : `${element.borderRadius}px`)
                : '8px' 
            }} 
          />
        </div>
      )}
      {element.type === 'shape' && (
        <div className="w-full h-full p-[2%] flex items-center justify-center">
          {element.shapeType === 'rect' && <div className="w-full h-full shadow-xl" style={{ backgroundColor: element.color, borderRadius: '8px' }} />}
          {element.shapeType === 'circle' && <div className="w-full h-full shadow-xl" style={{ backgroundColor: element.color, borderRadius: '50%' }} />}
          {element.shapeType === 'triangle' && (
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="drop-shadow-xl">
              <polygon points="50,0 100,100 0,100" fill={element.color} />
            </svg>
          )}
          {element.shapeType === 'line' && <div className="w-full h-[4px]" style={{ backgroundColor: element.color, borderRadius: '2px' }} />}
        </div>
      )}

      {/* Resize Handle */}
      {isSelected && (
        <div 
          className="resize-handle absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize border-2 border-white shadow-md z-50"
          onMouseDown={handleResize}
        />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.isSelected === nextProps.isSelected && 
         prevProps.element === nextProps.element && 
         prevProps.theme.color === nextProps.theme.color;
});

// --- PRESENTER COMPONENT (HTML EXPORT EQUIVALENT) ---
// This acts as the final generated HTML website view
function Presenter({ slides, onExit, startIndex, brandSettings }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [prevIndex, setPrevIndex] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToNext = useCallback(() => {
    if (isTransitioning || currentIndex === slides.length - 1) return;
    setPrevIndex(currentIndex);
    setCurrentIndex(c => c + 1);
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 800);
  }, [currentIndex, isTransitioning, slides.length]);

  const goToPrev = useCallback(() => {
    if (isTransitioning || currentIndex === 0) return;
    setPrevIndex(currentIndex);
    setCurrentIndex(c => c - 1);
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 800);
  }, [currentIndex, isTransitioning]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, onExit]);

  const renderBrandingOverlay = (themeConfig) => {
    if (!brandSettings.logoUrl && !brandSettings.websiteUrl) return null;
    let posClasses = "bottom-6 right-6 flex-row";
    if (brandSettings.position === 'bottom-left') posClasses = "bottom-6 left-6 flex-row-reverse";
    if (brandSettings.position === 'top-right') posClasses = "top-6 right-6 flex-row";
    if (brandSettings.position === 'top-left') posClasses = "top-6 left-6 flex-row-reverse";

    return (
      <div className={`absolute ${posClasses} z-[60] flex items-center gap-4 pointer-events-none opacity-90`} style={{ color: themeConfig.color, fontFamily: themeConfig.fontFamily }}>
        {brandSettings.websiteUrl && <span className="text-2xl font-semibold drop-shadow-lg tracking-wider">{brandSettings.websiteUrl}</span>}
        {brandSettings.logoUrl && <img src={getDirectImageUrl(brandSettings.logoUrl)} alt="Logo" className="h-12 object-contain drop-shadow-lg" />}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden font-sans">
      
      {/* Presentation Slides Container */}
      <div className="relative w-full h-full">
        {renderBrandingOverlay(THEMES[slides[currentIndex].theme])}
        {slides.map((slide, idx) => {
          // Determine state for transitions
          let transClass = '';
          const transType = slide.transition || 'fade';
          
          if (idx === currentIndex) {
             transClass = isTransitioning ? `trans-${transType}-enter` : 'z-10 opacity-100 transform-none';
          } else if (idx === prevIndex) {
             transClass = isTransitioning ? `trans-${transType}-exit` : 'hidden';
          } else {
             return null; // Don't render
          }

          return (
            <div 
              key={slide.id}
              className={`slide-transition slide-container ${transClass}`}
              style={{ background: THEMES[slide.theme].background }}
            >
              <div className="w-full h-full relative">
                {slide.elements.map(el => (
                  <div
                    key={el.id}
                    className={idx === currentIndex && !isTransitioning ? `anim-${el.animation || 'none'}` : 'opacity-0'}
                    style={{
                      position: 'absolute',
                      left: `${el.x}%`, top: `${el.y}%`,
                      width: `${el.width}%`, height: `${el.height}%`,
                      color: el.color || THEMES[slide.theme].color,
                      fontFamily: el.fontFamily || THEMES[slide.theme].fontFamily,
                      fontSize: `${el.fontSize}cqw`,
                      fontWeight: el.fontWeight || '400',
                      fontStyle: el.fontStyle || 'normal',
                      textAlign: el.textAlign || 'left',
                      animationDelay: `${el.delay || 0}s`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: el.type === 'text' ? 'flex-start' : 'center',
                    }}
                  >
                    {el.type === 'text' && (
                      <div className="w-full h-full whitespace-pre-wrap break-words p-[2%]" style={{ lineHeight: 1.2 }}>
                        {el.content}
                      </div>
                    )}
                    {el.type === 'video' && (
                      <div className="w-full h-full p-[2%]">
                        <video 
                          src={getDirectImageUrl(el.content)} 
                          autoPlay={el.autoPlay !== false} muted={el.autoPlay !== false} loop={el.loop} controls={el.controls}
                          className="w-full h-full shadow-2xl" 
                          style={{ 
                            objectFit: el.objectFit || 'cover',
                            borderRadius: el.borderRadius !== undefined 
                              ? (el.borderRadius >= 50 ? `${el.borderRadius}%` : `${el.borderRadius}px`) 
                              : '8px' 
                          }} 
                        />
                      </div>
                    )}
                    {el.type === 'image' && (
                      <div className="w-full h-full p-[2%]">
                        <img 
                          src={getDirectImageUrl(el.content)} 
                          alt="" 
                          className="w-full h-full shadow-2xl" 
                          style={{ 
                            objectFit: el.objectFit || 'cover',
                            borderRadius: el.borderRadius !== undefined 
                              ? (el.borderRadius >= 50 ? `${el.borderRadius}%` : `${el.borderRadius}px`) 
                              : '8px' 
                          }} 
                        />
                      </div>
                    )}
                    {el.type === 'shape' && (
                      <div className="w-full h-full p-[2%] flex items-center justify-center">
                        {el.shapeType === 'rect' && <div className="w-full h-full shadow-2xl" style={{ backgroundColor: el.color, borderRadius: '8px' }} />}
                        {el.shapeType === 'circle' && <div className="w-full h-full shadow-2xl" style={{ backgroundColor: el.color, borderRadius: '50%' }} />}
                        {el.shapeType === 'triangle' && (
                          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="drop-shadow-2xl">
                            <polygon points="50,0 100,100 0,100" fill={el.color} />
                          </svg>
                        )}
                        {el.shapeType === 'line' && <div className="w-full h-[4px]" style={{ backgroundColor: el.color, borderRadius: '2px' }} />}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Presenter Overlay UI */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-between px-6 z-50 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="text-white/50 text-sm font-medium bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">
          {currentIndex + 1} / {slides.length}
        </div>
        
        <div className="flex gap-2">
          <button onClick={goToPrev} disabled={currentIndex === 0} className="p-2 bg-black/40 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all disabled:opacity-30">
            <ChevronLeft size={24} />
          </button>
          <button onClick={goToNext} disabled={currentIndex === slides.length - 1} className="p-2 bg-black/40 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all disabled:opacity-30">
            <ChevronRight size={24} />
          </button>
        </div>
        
        <button onClick={onExit} className="flex items-center gap-2 px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-all text-sm font-bold shadow-lg">
          <X size={16} /> Exit
        </button>
      </div>
      
    </div>
  );
}