// Auto-scroll script for screen recording with pause control - FINAL VERSION
(function() {
  const PIXELS_PER_SECOND = 130;
  const STUCK_CHECK_INTERVAL = 500;
  const STUCK_THRESHOLD = 5;
  const PAUSE_EASE_DURATION = 300; // 300ms smooth ease to stop
  
  let isScrolling = false;
  let isPaused = false;
  let startTime;
  let startPosition;
  let animationFrame;
  let lastScrollPosition = 0;
  let stuckCheckInterval;
  let originalScrollBehavior;
  let totalPausedTime = 0;
  let pauseStartTime = 0;
  let pauseStartPosition = 0;
  let currentSpeed = PIXELS_PER_SECOND;
  let cursorStyleElement = null;
  
  function addCursorStyle() {
    cursorStyleElement = document.createElement('style');
    cursorStyleElement.id = 'autoscroll-cursor-style';
    cursorStyleElement.textContent = '* { cursor: pointer !important; }';
    document.head.appendChild(cursorStyleElement);
    console.log('👆 Cursor changed to pointer hand');
  }
  
  function removeCursorStyle() {
    if (cursorStyleElement) {
      cursorStyleElement.remove();
      cursorStyleElement = null;
      console.log('👆 Cursor restored to normal');
    }
  }
  
  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  
  function checkIfStuck() {
    if (!isScrolling || isPaused) return;
    
    const currentPosition = window.pageYOffset;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    
    if (currentPosition >= maxScroll - 5) {
      return;
    }
    
    const movement = Math.abs(currentPosition - lastScrollPosition);
    
    if (movement < STUCK_THRESHOLD) {
      console.warn('⚠️ Scrolling appears stuck! Restarting...');
      startTime = Date.now() - totalPausedTime;
      startPosition = currentPosition;
    }
    
    lastScrollPosition = currentPosition;
  }
  
  function smoothScroll() {
    if (!isScrolling) return;
    
    const currentTime = Date.now();
    
    // Handle paused state with easing
    if (isPaused) {
      const pauseElapsed = currentTime - pauseStartTime;
      if (pauseElapsed < PAUSE_EASE_DURATION) {
        // Calculate how much we should have moved during easing
        const easeProgress = pauseElapsed / PAUSE_EASE_DURATION;
        const easedSpeed = currentSpeed * (1 - easeOut(easeProgress));
        const pixelsMoved = (pauseElapsed / 1000) * (currentSpeed + easedSpeed) / 2;
        const targetPosition = pauseStartPosition + pixelsMoved;
        window.scrollTo({top: targetPosition, behavior: 'instant'});
      }
      // If fully paused, stay at current position
      animationFrame = requestAnimationFrame(smoothScroll);
      return;
    }
    
    const elapsed = (currentTime - startTime - totalPausedTime) / 1000;
    const targetPosition = startPosition + (elapsed * currentSpeed);
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    
    if (targetPosition >= maxScroll) {
      window.scrollTo({top: maxScroll, behavior: 'instant'});
      console.log('✅ Reached bottom of page');
      stop();
      return;
    }
    
    window.scrollTo({top: targetPosition, behavior: 'instant'});
    animationFrame = requestAnimationFrame(smoothScroll);
  }
  
  function pause() {
    if (!isScrolling || isPaused) return;
    
    isPaused = true;
    pauseStartTime = Date.now();
    pauseStartPosition = window.pageYOffset;
    
    addCursorStyle();
    
    console.log('⏸️ Paused at position:', pauseStartPosition);
  }
  
  function resume() {
    if (!isScrolling || !isPaused) return;
    
    const pauseDuration = Date.now() - pauseStartTime;
    totalPausedTime += pauseDuration;
    
    // Update start position to current scroll position when resuming
    const currentPosition = window.pageYOffset;
    const timeBeforePause = (pauseStartTime - startTime - (totalPausedTime - pauseDuration)) / 1000;
    startPosition = currentPosition - (timeBeforePause * currentSpeed);
    
    isPaused = false;
    
    removeCursorStyle();
    
    console.log('▶️ Resumed from position:', currentPosition);
  }
  
  function handleKeyPress(e) {
    if (e.key === 'p' || e.key === 'P') {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    }
  }
  
  function start() {
    if (isScrolling) return;
    
    originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    
    isScrolling = true;
    isPaused = false;
    startTime = Date.now();
    startPosition = window.pageYOffset;
    lastScrollPosition = startPosition;
    totalPausedTime = 0;
    currentSpeed = PIXELS_PER_SECOND;
    
    document.addEventListener('keydown', handleKeyPress);
    
    console.log('▶️ Auto-scroll started at', PIXELS_PER_SECOND, 'pixels/second');
    console.log('⌨️ Press P to pause/resume');
    smoothScroll();
    
    stuckCheckInterval = setInterval(checkIfStuck, STUCK_CHECK_INTERVAL);
  }
  
  function stop() {
    isScrolling = false;
    isPaused = false;
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    if (stuckCheckInterval) {
      clearInterval(stuckCheckInterval);
    }
    document.removeEventListener('keydown', handleKeyPress);
    
    removeCursorStyle();
    
    if (originalScrollBehavior !== undefined) {
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
    }
    console.log('⏹️ Auto-scroll stopped');
  }
  
  function reset() {
    stop();
    window.scrollTo({top: 0, behavior: 'instant'});
    console.log('⏮️ Scrolled to top');
  }
  
  window.autoScroll = {
    start: start,
    stop: stop,
    reset: reset,
    pause: pause,
    resume: resume,
    setSpeed: function(pixelsPerSecond) {
      currentSpeed = pixelsPerSecond;
      console.log('🎛️ Speed set to', pixelsPerSecond, 'pixels/second');
    }
  };
  
  console.log('🎬 Auto-scroll loaded!');
  console.log('⌨️ Press P to pause/resume (with smooth easing)');
  console.log('⏳ Starting in 2 seconds...');
  setTimeout(start, 2000);
})();
