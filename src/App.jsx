import Header from './pages/Header';
import Hero from './pages/Hero';
import SplashCursor from './Animations/SplashCursor/SplashCursor';
import Particles from './Backgrounds/Particles/Particles';

function App() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'black',  
          zIndex: -2,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
        }}
      >
        <Particles />
      </div>

      <div
        style={{
          position: 'relative', 
          zIndex: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <SplashCursor />
        <Header />
        <Hero />
      </div>
    </div>
  );
}

export default App;
