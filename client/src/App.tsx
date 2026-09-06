import React, { useState, useEffect, useCallback } from 'react';
import type { 
  ViewState, 
  ExperienceId, 
  HardwareStatus, 
  SouvenirData 
} from './types';
import { soundFX } from './services/audioService';
import { apiService } from './services/apiService';
import { cameraService } from './services/cameraService';
import { GlobalHUD } from './components/hud/GlobalHUD';
import { LandingView } from './views/LandingView';
import { WelcomeView } from './views/WelcomeView';
import { PortalSelection } from './views/PortalSelection';
import { DetectiveView } from './views/DetectiveView';
import { SmartCityView } from './views/SmartCityView';
import { AIDefenseView } from './views/AIDefenseView';
import { LastSignalView } from './views/LastSignalView';
import { ResultsView } from './views/ResultsView';
import { DemoModal } from './views/DemoModal';
import { HelpModal } from './views/HelpModal';
import { MobileResultView } from './views/MobileResultView';
import { OperatorDashboard } from './views/OperatorDashboard';
import { AdminDashboard } from './views/AdminDashboard';

export const App: React.FC = () => {
  // Check URL path for direct mobile result (/results/:token), operator (/operator), or admin leaderboard (/admin)
  const pathname = window.location.pathname;
  const isOperatorRoute = pathname === '/operator';
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isResultRoute = pathname.startsWith('/results/');
  const resultToken = isResultRoute ? pathname.split('/results/')[1] : null;

  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [activeExperience, setActiveExperience] = useState<ExperienceId | null>(null);
  const [visitorPhotoUrl, setVisitorPhotoUrl] = useState<string | null>(null);
  const [visitorName, setVisitorName] = useState<string>('Cadet Alex');
  const [currentSouvenir, setCurrentSouvenir] = useState<SouvenirData | null>(null);
  const [isOperatorView, setIsOperatorView] = useState<boolean>(isOperatorRoute);
  const [gameHudState, setGameHudState] = useState<{
    level?: number;
    timeRemaining?: number;
    timeBudget?: number;
    transitionInfo?: any;
    score?: number;
  } | null>(null);

  const [hardware, setHardware] = useState<HardwareStatus>({
    camera: 'prompt',
    microphone: 'prompt',
    aiOnline: true,
    soundEnabled: true,
    fullscreen: false,
    expoMode: false,
    demoMode: false
  });

  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>('SESSION-INIT');
  const [sessionMode, setSessionMode] = useState<'SOLO' | 'TEAM'>('SOLO');
  const [expoSecondsLeft, setExpoSecondsLeft] = useState<number>(45);

  // Initialize new session with backend on startup
  useEffect(() => {
    apiService.startSession(sessionMode).then(id => {
      setSessionId(id);
    });
  }, []);

  const resetVisitorSession = useCallback(async () => {
    await apiService.endSession(sessionId);
    const newId = await apiService.startSession(sessionMode);
    setSessionId(newId);
    setVisitorPhotoUrl(null);
    setCurrentSouvenir(null);
    setActiveExperience(null);
    setCurrentView('landing');
  }, [sessionId, sessionMode]);

  // Keyboard Shortcuts (Ctrl+Shift+D or ~ for Demo Mode, M for sound, F11/fullscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key?.toLowerCase() ?? '';

      if (
        (e.ctrlKey && e.shiftKey && key === 'd') ||
        key === '`' ||
        key === '~'
      ) {
        e.preventDefault();
        soundFX.playClick();
        setIsDemoModalOpen(prev => !prev);
      }

      if (
        key === 'm' &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        handleToggleSound();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Expo Mode Inactivity Detection
  useEffect(() => {
    if (!hardware.expoMode) return;

    let countdown = 45;
    setExpoSecondsLeft(countdown);

    const interval = setInterval(() => {
      countdown--;
      setExpoSecondsLeft(countdown);
      if (countdown <= 0) {
        resetVisitorSession();
        countdown = 45;
        setExpoSecondsLeft(countdown);
      }
    }, 1000);

    const resetTimer = () => {
      countdown = 45;
      setExpoSecondsLeft(45);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [hardware.expoMode, resetVisitorSession]);

  const handleToggleSound = () => {
    const isMuted = soundFX.toggleMute();
    setHardware(prev => ({ ...prev, soundEnabled: !isMuted }));
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setHardware(prev => ({ ...prev, fullscreen: true }));
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setHardware(prev => ({ ...prev, fullscreen: false }));
      }).catch(() => {});
    }
  };

  const handleUpdateHardware = (status: Partial<HardwareStatus>) => {
    setHardware(prev => ({ ...prev, ...status }));
  };

  const handleStartFromLanding = () => {
    setCurrentView('welcome');
  };

  const handleProceedFromWelcome = (photo: string | null, name?: string) => {
    const validPhoto = photo || cameraService.generateSyntheticAvatar();
    setVisitorPhotoUrl(validPhoto);
    if (name && name.trim()) {
      setVisitorName(name.trim());
    }
    setCurrentView('portal');
  };

  const handleSelectExperience = (expId: ExperienceId, mode: 'SOLO' | 'TEAM' = 'SOLO') => {
    // If entering experience directly without calibration, guarantee a synthetic avatar
    if (!visitorPhotoUrl) {
      setVisitorPhotoUrl(cameraService.generateSyntheticAvatar());
    }
    setActiveExperience(expId);
    setSessionMode(mode);
    if (expId === 'detective') setCurrentView('detective');
    else if (expId === 'smart-city') setCurrentView('smart-city');
    else if (expId === 'ai-defense') setCurrentView('ai-defense');
    else if (expId === 'last-signal') setCurrentView('last-signal');
  };

  const handleExperienceComplete = (souvenir: SouvenirData) => {
    setCurrentSouvenir(souvenir);
    setCurrentView('results');
  };

  const handleNextExperience = () => {
    setCurrentView('portal');
  };

  const handleExitToWorld = () => {
    resetVisitorSession();
    setCurrentView('landing');
  };

  const handleRetakePhoto = () => {
    setCurrentView('welcome');
  };

  // If visitor is scanning QR from phone, show mobile result page
  if (isResultRoute && resultToken) {
    return (
      <MobileResultView
        token={resultToken}
        onReturnToHome={() => {
          window.location.href = '/';
        }}
      />
    );
  }

  // If operator console route is opened
  if (isOperatorView) {
    return (
      <OperatorDashboard
        onReturnToExhibit={() => setIsOperatorView(false)}
        onResetSession={resetVisitorSession}
      />
    );
  }

  // If admin leaderboard route is opened (/admin)
  if (isAdminRoute) {
    return (
      <AdminDashboard
        onReturnToExhibit={() => {
          window.location.href = '/';
        }}
      />
    );
  }

  return (
    <div className={`relative w-screen ${currentView === 'results' ? 'min-h-screen overflow-y-auto' : 'h-screen overflow-hidden'} bg-[#020408] text-slate-100 font-sans`}>
      {/* Global Futuristic HUD */}
      <GlobalHUD
        currentView={currentView}
        hardware={hardware}
        sessionId={sessionId}
        onNavigateHome={() => setCurrentView('portal')}
        onToggleSound={handleToggleSound}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenDemo={() => setIsDemoModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        expoSecondsLeft={hardware.expoMode ? expoSecondsLeft : undefined}
        level={gameHudState?.level}
        timeRemainingInLevel={gameHudState?.timeRemaining}
        timeBudgetInLevel={gameHudState?.timeBudget}
        transitionInfo={gameHudState?.transitionInfo}
        score={gameHudState?.score}
      />

      {/* Primary View Routing */}
      {currentView === 'landing' && (
        <LandingView 
          onStart={handleStartFromLanding} 
          onOpenOperator={() => setIsOperatorView(true)}
        />
      )}

      {currentView === 'welcome' && (
        <WelcomeView
          hardware={hardware}
          onUpdateHardware={handleUpdateHardware}
          onProceed={handleProceedFromWelcome}
        />
      )}

      {currentView === 'portal' && (
        <PortalSelection onSelectExperience={handleSelectExperience} />
      )}

      {currentView === 'detective' && (
        <DetectiveView
          sessionId={sessionId}
          visitorPhotoUrl={visitorPhotoUrl}
          visitorName={visitorName}
          onComplete={handleExperienceComplete}
          onExit={() => setCurrentView('portal')}
          onHudUpdate={setGameHudState}
        />
      )}

      {currentView === 'smart-city' && (
        <SmartCityView
          visitorPhotoUrl={visitorPhotoUrl}
          visitorName={visitorName}
          onComplete={handleExperienceComplete}
          onExit={() => setCurrentView('portal')}
          onHudUpdate={setGameHudState}
        />
      )}

      {currentView === 'ai-defense' && (
        <AIDefenseView
          visitorPhotoUrl={visitorPhotoUrl}
          visitorName={visitorName}
          onComplete={handleExperienceComplete}
          onExit={() => setCurrentView('portal')}
          onHudUpdate={setGameHudState}
        />
      )}

      {currentView === 'last-signal' && (
        <LastSignalView
          visitorPhotoUrl={visitorPhotoUrl}
          visitorName={visitorName}
          onComplete={handleExperienceComplete}
          onExit={() => setCurrentView('portal')}
          onHudUpdate={setGameHudState}
        />
      )}

      {currentView === 'results' && currentSouvenir && (
        <ResultsView
          data={currentSouvenir}
          onNextExperience={handleNextExperience}
          onExitToWorld={handleExitToWorld}
          onRetakePhoto={handleRetakePhoto}
        />
      )}

      {/* Presenter Demo Modal */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onJumpToView={(view) => setCurrentView(view)}
        onJumpToExperience={handleSelectExperience}
        expoMode={hardware.expoMode}
        onToggleExpoMode={() => setHardware(prev => ({ ...prev, expoMode: !prev.expoMode }))}
      />

      {/* Exhibition Help & Privacy Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};

export default App;
