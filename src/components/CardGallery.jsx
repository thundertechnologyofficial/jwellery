import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion as Motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';
import styles from './CardGallery.module.css';

const ParallaxProductImage = ({ src, alt, className, y }) => {
    return (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
            <Motion.img
                src={src}
                className={className}
                alt={alt}
                style={{ y, scale: 1.1 }}
            />
        </div>
    );
};



// Placeholder images - using solid colors with text if no images provided, 
// or simple placeholders from a service if allowed. 
// User asked for "5 photo cards like in the photo".
// I will use some high quality placeholders for jewelry/fashion if possible, or colors.
// For now, I'll use placeholders.

const cards = [
    {
        id: 10,
        color: '#2a1a1a',
        image: '/j1.png',
        title: 'Vintage Brooch',
        description: 'A timeless statement piece that captures the essence of vintage glamour. Perfect for adding a touch of sophistication to any ensemble.',
        price: '$1,200',
        details: ['Antique gold finish', 'Hand-set crystals', 'Secure pin clasp']
    },
    {
        id: 1,
        color: '#4a2c2c',
        image: '/j2.png',
        title: 'The Aurora Necklace',
        description: 'Elevate your look with the Aurora Necklace Set, a timeless blend of grace and glamour. Designed with intricate craftsmanship, this set features a statement necklace and matching earrings that shimmer with every movement.',
        price: '$3,000',
        details: ['Premium gold-plated finish', 'Handcrafted with precision stones', 'Hypoallergenic & skin-friendly', 'Comes with matching earrings', 'Packed in a premium gift box']
    },
    {
        id: 2,
        color: '#2c2c2c',
        image: '/j3.png',
        title: 'Starlight Earrings',
        description: 'Capture the brilliance of the night sky with these exquisite Starlight Earrings. Each stone is carefully selected to ensure maximum sparkle.',
        price: '$1,850',
        details: ['18k White Gold', 'VS1 Diamonds', 'Secure post backing']
    },
    {
        id: 3,
        color: '#7d0000',
        image: '/j4.png',
        title: 'Moonstone Pendant',
        description: 'A mystical Moonstone Pendant that glows with an ethereal light. The perfect talisman for new beginnings.',
        price: '$950',
        details: ['Genuine Moonstone', 'Sterling Silver chain', 'Adjustable length']
    },
    {
        id: 4,
        color: '#3e3e3e',
        image: '/j5.png',
        title: 'Eternity Bracelet',
        description: 'Symbolizing never-ending love, this Eternity Bracelet features a continuous line of sparkling gems.',
        price: '$2,400',
        details: ['Platinum setting', 'Safety clasp', 'Available in multiple sizes']
    },
    {
        id: 5,
        color: '#5c3a3a',
        image: '/j7.png',
        title: 'Solitaire Ring',
        description: 'A classic Solitaire Ring that needs no introduction. Pure elegance in its simplest form.',
        price: '$4,500',
        details: ['2ct Center Stone', 'Knife-edge band', 'GIA Certified']
    },
    {
        id: 11,
        color: '#1a1a1a',
        image: '/j8.png',
        title: 'Pearl Choker',
        description: 'Lustrous pearls strung together to create a sophisticated choker that exudes luxury.',
        price: '$1,500',
        details: ['Freshwater Pearls', 'Silk stringing', 'Gold clasp']
    },
];

// Animation Variants

// Container for the stack entrance
const stackVariants = {
    hidden: {
        y: 500, // Start below screen
        opacity: 1
    },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 1,
            ease: "easeOut",
            delay: 2.5 // Wait for title and text animation (+0.7s delay)
        }
    }
};

// Fan out animation for individual cards
// Offset is relative to the ACTIVE card now
const getFanVariant = (index, activeIndex, isMobile, hasAnimatedIn) => {
    const spacing = isMobile ? 80 : 300; // Spacing between cards
    // Calculate offset relative to the ACTIVE card
    const offset = index - activeIndex;

    const baseDelay = 3.7; // delayed by 0.7s to match entrance
    const stagger = 0.1;
    let delay = hasAnimatedIn ? 0 : baseDelay;

    if (!hasAnimatedIn) {
        if (offset > 0) {
            // Right cards peel out first
            delay += offset * stagger;
        } else if (offset < 0) {
            // Left cards wait for right cards, then peel out
            delay += 0.8 + Math.abs(offset) * stagger;
        }
    }

    return {
        closed: {
            x: 0,
            scale: 1 - Math.abs(index - 3) * 0.1 + (index === 3 ? 0.1 : 0), // Initial stack centers on new middle (index 3)
            zIndex: 10 - Math.abs(index - 3),
            opacity: 1
        },
        open: {
            x: offset * spacing, // Shift based on distance from active card
            scale: offset === 0 ? 1.35 : 1.2 - Math.abs(offset) * 0.1, // Scale based on distance from active card - Middle card increased by ~50px in height
            zIndex: 10 - Math.abs(offset), // Z-index based on distance from active card
            opacity: 1,
            transition: {
                // If it's the initial fan out (not animated in yet), wait.
                // If already animated in, no delay.
                delay: delay,
                duration: 0.8,
                ease: "easeInOut"
            }
        }
    };
};

// Stacking/Cover slide animation variants
const slideVariants = {
    enter: (direction) => ({
        zIndex: 2,
        x: direction > 0 ? '100%' : '-100%',
        scale: 1, // Slight zoom in initially
        opacity: 1
    }),
    center: {
        zIndex: 2,
        x: 0,
        scale: 1,
        opacity: 1,
        transition: {
            x: { type: "spring", stiffness: 80, damping: 20 },
            scale: { duration: 0.5 },
            opacity: { duration: 0.5 }
        }
    },
    exit: (direction) => ({
        zIndex: 0,
        x: direction > 0 ? '-20%' : '20%', // Move slightly opposite to direction
        scale: 0.9,
        opacity: 0,
        transition: {
            x: { type: "spring", stiffness: 80, damping: 20 },
            opacity: { duration: 0.5 },
            scale: { duration: 0.5 }
        }
    })
};

// Variants for staggered text animation
const contentContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.1 // Wait slightly for panel to start opening
        }
    }
};

const contentItemVariants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(5px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
    }
};

const ExpandedOverlay = ({
    card,
    rect,
    viewport,
    isMobile,
    onClose,
    onPrev,
    onNext,
    hasPrev,
    hasNext,
    direction,
    setDirection
}) => {
    const [enableScroll, setEnableScroll] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const scrollableContainerRef = useRef(null);

    // Parallax logic now lives here, active only when component exists
    const { scrollY } = useScroll({
        container: scrollableContainerRef
    });

    // Adjusted range to be symmetric around 0 at the center scroll position
    const y = useTransform(scrollY, [0, viewport.h], ['14%', '-13.9%']);

    useLayoutEffect(() => {
        if (enableScroll && scrollableContainerRef.current) {
            scrollableContainerRef.current.scrollTop = viewport.h / 2;
        }
    }, [enableScroll, viewport.h]);

    const handleExpandedWheel = (e) => {
        if (!enableScroll) return;

        // Check if horizontal scroll dominates vertical
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            // If deltaX is significant
            if (Math.abs(e.deltaX) > 10) {
                // Swipe Right (negative) -> Show Details (Pull from left)
                if (e.deltaX < 0 && !showDetails) {
                    setShowDetails(true);
                }
                // Swipe Left (positive) -> Hide Details (Push back)
                if (e.deltaX > 0 && showDetails) {
                    setShowDetails(false);
                }
            }
        }
    };

    return (
        <Motion.div
            ref={scrollableContainerRef}
            className={`${styles.expandedOverlay} ${enableScroll ? styles.scrollable : ''}`}
            data-lenis-prevent="true" // Prevent Lenis from hijacking scroll
            initial={{
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                borderRadius: 16,
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
            animate={{
                top: [rect.top, 0],
                left: [rect.left, 0],
                width: [rect.width, viewport.w],
                height: [rect.height, viewport.h],
                borderRadius: [16, 0],
                boxShadow: ['0 10px 30px rgba(0,0,0,0.2)', '0 0 0 rgba(0,0,0,0)']
            }}
            exit={{
                top: (viewport.h * 0.8 - 200) - (isMobile ? 160 : 180),
                left: (viewport.w - (isMobile ? 220 : 260)) / 2,
                width: isMobile ? 220 : 260,
                height: isMobile ? 320 : 360,
                borderRadius: [0, 16],
                boxShadow: ['0 0 0 rgba(0,0,0,0)', '0 10px 30px rgba(0,0,0,0.2)'],
                transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
            }}
            transition={{ type: "spring", stiffness: 90, damping: 15 }}
            onAnimationComplete={(definition) => {
                if (definition === 'animate' || (typeof definition === 'object' && definition.top && definition.top[1] === 0)) {
                    setEnableScroll(true);
                }
            }}
            onClick={onClose}
            onWheel={handleExpandedWheel}
        >

            <div className={styles.expandedContent}>
                <Motion.div
                    className={styles.detailsPanel}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{
                        width: isMobile ? (showDetails ? '100%' : 0) : (showDetails ? '35%' : 0),
                        opacity: showDetails ? 1 : 0
                    }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <Motion.div
                        className={styles.detailsInner}
                        variants={contentContainerVariants}
                        initial="hidden"
                        animate={showDetails ? "visible" : "hidden"}
                    >
                        <Motion.h2 variants={contentItemVariants} className={styles.detailsTitle}>{card.title?.toUpperCase()}</Motion.h2>
                        <Motion.p variants={contentItemVariants} className={styles.detailsDesc}>{card.description}</Motion.p>

                        {card.details && (
                            <Motion.div variants={contentItemVariants} className={styles.detailsList}>
                                <p className={styles.detailsLabel}>Details:</p>
                                <ul>
                                    {card.details.map((detail, i) => (
                                        <li key={i}>- {detail}</li>
                                    ))}
                                </ul>
                            </Motion.div>
                        )}

                        <Motion.div variants={contentItemVariants} className={styles.priceContainer}>
                            <p className={styles.detailsPrice}>Price: {card.price}</p>
                        </Motion.div>

                        <Motion.button variants={contentItemVariants} className={styles.buyBtn}>BUY NOW</Motion.button>
                    </Motion.div>
                </Motion.div>

                <div className={styles.imagePanel}>
                    <AnimatePresence initial={false} custom={direction}>
                        <Motion.div
                            key={card.id}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className={styles.slideOuter}
                        >
                            <ParallaxProductImage
                                src={card.image}
                                alt={card.title}
                                className={styles.expandedImage}
                                y={enableScroll ? y : 0}
                            />
                            <div className={styles.slideLabel}>
                                {card.title}
                            </div>
                        </Motion.div>
                    </AnimatePresence>

                    {/* Expanded Navigation */}
                    <div className={`${styles.expandedNav} ${enableScroll ? styles.visible : ''}`}>
                        {hasPrev && (
                            <button
                                className={`${styles.expandedNavBtn} ${styles.prev}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDirection(-1);
                                    onPrev();
                                }}
                            >
                                <ArrowLeft size={24} color="white" />
                            </button>
                        )}
                        {hasNext && (
                            <button
                                className={`${styles.expandedNavBtn} ${styles.next}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDirection(1);
                                    onNext();
                                }}
                            >
                                <ArrowRight size={24} color="white" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className={styles.scrollIndicator}>
                Scroll to see more
            </div>
        </Motion.div>
    );
};

export default function CardGallery() {
    const isMobile = window.innerWidth < 768; // Simple check
    const [activeIndex, setActiveIndex] = useState(3);
    const [hasAnimatedIn, setHasAnimatedIn] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [expandedRect, setExpandedRect] = useState(null);
    const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });
    const cardRefs = useRef([]);
    const [direction, setDirection] = useState(0);

    // Previously logic related to overlay was here (useScroll, states). 
    // They are now moved to ExpandedOverlay.

    useEffect(() => {
        const handleResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (expandedIndex !== null) {
            document.body.classList.add('hero-expanded');
        } else {
            document.body.classList.remove('hero-expanded');
        }
    }, [expandedIndex]);

    const handleCardClick = (index) => {
        if (expandedIndex === index) {
            closeOverlay();
            return;
        }
        const el = cardRefs.current[index];
        if (el) {
            const rect = el.getBoundingClientRect();
            setExpandedRect(rect);
        }
        setActiveIndex(index);
        setExpandedIndex(index);
    };

    const closeOverlay = () => {
        setExpandedIndex(null);
        setExpandedRect(null);
        // Resetting enableScroll and showDetails is handled by unmounting ExpandedOverlay
    };

    const isExpanded = expandedIndex !== null;
    const containerRef = useRef(null);
    const lastScrollTime = useRef(0);

    // Wheel listener for Horizontal Gallery Scroll provided we are NOT expanded
    useEffect(() => {
        const handleWheel = (e) => {
            if (expandedIndex !== null) return;

            // Check for horizontal scroll dominance
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 10) {
                e.preventDefault();
                const now = Date.now();
                if (now - lastScrollTime.current > 400) { // Throttle
                    if (e.deltaX > 0) {
                        if (activeIndex < cards.length - 1) setActiveIndex(prev => prev + 1);
                    } else {
                        if (activeIndex > 0) setActiveIndex(prev => prev - 1);
                    }
                    lastScrollTime.current = now;
                }
            }
        };

        const el = containerRef.current;
        if (el) {
            el.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (el) el.removeEventListener('wheel', handleWheel);
        };
    }, [activeIndex, expandedIndex]);

    const handlePrev = () => {
        setExpandedIndex(prev => prev - 1);
        setActiveIndex(prev => prev - 1);
    };

    const handleNext = () => {
        setExpandedIndex(prev => prev + 1);
        setActiveIndex(prev => prev + 1);
    };

    return (
        <div
            ref={containerRef}
            className={`${styles.galleryContainer} ${isExpanded ? styles.galleryContainerExpanded : ''}`}
        >
            <Motion.div
                className={`${styles.cardWrapper} ${isExpanded ? styles.cardWrapperExpanded : ''}`}
                variants={stackVariants}
                initial="hidden"
                animate="visible"
                onAnimationComplete={() => setHasAnimatedIn(true)}
            >
                {cards.map((card, index) => {
                    return (
                        <Motion.div
                            key={card.id}
                            className={`${styles.card} ${expandedIndex === index ? styles.cardHidden : ''} ${isExpanded && expandedIndex !== index ? styles.cardDimmed : ''}`}
                            style={{
                                backgroundColor: card.color,
                            }}
                            initial="closed"
                            animate="open"
                            variants={getFanVariant(index, activeIndex, isMobile, hasAnimatedIn)}
                            onClick={() => handleCardClick(index)}
                            ref={(el) => (cardRefs.current[index] = el)}
                        >
                            <img
                                src={card.image}
                                alt={card.title}
                                className={styles.cardImage}
                            />
                        </Motion.div>
                    )
                })}
            </Motion.div>

            <AnimatePresence>
                {isExpanded && expandedRect && (
                    <ExpandedOverlay
                        key="overlay"
                        card={cards[expandedIndex]}
                        rect={expandedRect}
                        viewport={viewport}
                        isMobile={isMobile}
                        onClose={closeOverlay}
                        onPrev={handlePrev}
                        onNext={handleNext}
                        hasPrev={expandedIndex > 0}
                        hasNext={expandedIndex < cards.length - 1}
                        direction={direction}
                        setDirection={setDirection}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
