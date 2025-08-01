import { useEffect } from 'react';

// Ce hook calcule la hauteur réelle de la fenêtre et la stocke dans une variable CSS (--vh)
const useMobileViewport = () => {
  useEffect(() => {
    const setVh = () => {
      // window.innerHeight nous donne la hauteur visible, sans la barre d'adresse
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // On exécute la fonction au chargement et à chaque redimensionnement
    setVh();
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);

    // On nettoie les écouteurs quand le composant est retiré
    return () => {
      window.removeEventListener('resize', setVh);
      window.removeEventListener('orientationchange', setVh);
    };
  }, []);
};

export default useMobileViewport;