import { useEffect } from 'react';
import { motion as Motion, useScroll, useTransform } from 'framer-motion';
import { Search, User, ShoppingBag } from 'lucide-react';
import Lenis from '@studio-freight/lenis';
import CardGallery from './components/CardGallery';
import styles from './App.module.css';

export default function App() {
  const { scrollY } = useScroll();

  // Parallax transforms
  const yBrand = useTransform(scrollY, [0, 600], [0, -200]);
  const opacityBrand = useTransform(scrollY, [0, 300], [1, 0]);
  const scaleBrand = useTransform(scrollY, [0, 300], [1, 0.8]);

  // Main content parallax
  const yLeft = useTransform(scrollY, [0, 800], [0, -150]);
  const yRight = useTransform(scrollY, [0, 800], [0, -300]); // Right side moves faster

  // Card Gallery parallax
  const yGallery = useTransform(scrollY, [400, 1200], [0, -200]);

  useEffect(() => {
    const lenis = new Lenis()

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => lenis.destroy()
  }, [])

  return (
    <div className={styles.container}>
      <Motion.nav className={styles.nav}>
        <Motion.div
          className={styles.navLeft}
          initial={{ y: -100 }} // Start above the screen
          animate={{ y: 0 }}
          transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }} // Slowed down slide to 1.5s
        >
          <a href="#" className={styles.navLink}>Shop</a>
          <a href="#" className={styles.navLink}>About</a>
          <a href="#" className={styles.navLink}>Journal</a>
        </Motion.div>

        <Motion.div
          className={styles.navRight}
          initial={{ y: -100 }} // Start above the screen
          animate={{ y: 0 }}
          transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }} // Slowed down slide to 1.5s
        >
          <button className={styles.iconBtn} aria-label="Search">
            <Search size={20} />
          </button>
          <button className={styles.iconBtn} aria-label="Account">
            <User size={20} />
          </button>
          <button className={styles.iconBtn} aria-label="Cart">
            <ShoppingBag size={20} />
          </button>
        </Motion.div>
      </Motion.nav>

      <Motion.div
        className={styles.brandContainer}
        style={{ y: yBrand, opacity: opacityBrand, scale: scaleBrand }}
      >
        <h1 className={styles.brandText}>SORELLE</h1>
      </Motion.div>

      <main className={styles.main}>
        <Motion.div
          className={styles.sectionLeft}
          style={{ y: yLeft }}
          initial={{ x: -710 }}
          animate={{ x: 0 }}
          transition={{ delay: 1.5, duration: 1, ease: "easeOut" }}
        >
          <div className={styles.leftContent}>
            <h2 className={styles.headlineSmall}>For the</h2>
            <h1 className={styles.headlineLarge}>WOMAN YOU ARE</h1>
          </div>
        </Motion.div>

        <Motion.div
          className={styles.sectionRight}
          style={{ y: yRight }}
          initial={{ x: 500 }}
          animate={{ x: 0 }}
          transition={{ delay: 1.5, duration: 1, ease: "easeOut" }}
        >
          <div className={styles.descriptionBox}>
            <p className={styles.descriptionText}>
              We create pieces that mirror your grace, your strength, and your journey — because elegance is not just worn, it's lived.
            </p>
          </div>
        </Motion.div>
      </main>

      <Motion.div style={{ y: yGallery }}>
        <CardGallery />
      </Motion.div>
    </div>
  );
}
