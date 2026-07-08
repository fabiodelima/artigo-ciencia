/**
 * Epistemologia da Construção — Apresentação Interativa
 * Lógica de Controle Universal Sequencial (Scroll Híbrido & Storytelling)
 * + Controle Remoto via WebSocket (wss://ws.fabiollima.com)
 */

document.addEventListener('DOMContentLoaded', () => {
  const sections = Array.from(document.querySelectorAll('.slide-section'));
  const indicatorContainer = document.querySelector('.indicator-container');
  const indicators = Array.from(document.querySelectorAll('.indicator-index'));
  
  let activeSlideIndex = 0;
  let activeSlideSteps = [];
  let currentStepIndex = 0; // Passo atual no slide ativo
  let hasCompletedInitialRender = false;
  let hasNavigatedBetweenSlides = false;

  // ── CONTROLE REMOTO VIA WEBSOCKET ─────────────────────────────────────────
  // Gera um ID de sessão de 4 dígitos e exibe na tela para o celular conectar.
  // O servidor de sinalização retransmite comandos do celular (/remoto) para cá.
  const WS_URL = (() => {
    const explicit = new URLSearchParams(window.location.search).get('ws');
    if (explicit) return explicit;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
  })();
  const SESSION_ID = String(Math.floor(1000 + Math.random() * 9000));

  // Injeta o badge do código de sessão na apresentação (visível apenas na capa)
  const sessionBadgeEl = document.createElement('div');
  sessionBadgeEl.id = 'remote-session-badge';
  sessionBadgeEl.style.cssText = [
    'position:fixed', 'bottom:1.2rem', 'right:1.5rem', 'z-index:9999',
    'background:rgba(23,74,156,0.9)', 'backdrop-filter:blur(8px)',
    'border:1px solid rgba(255,0,0,0.22)', 'border-radius:var(--radius-control)',
    'padding:0.4rem 0.9rem', 'font-family:var(--font-body)',
    'font-size:var(--font-size-caption)', 'color:rgba(255,255,255,0.78)',
    'letter-spacing:0.05em', 'pointer-events:none', 'user-select:none',
    'transition:opacity 0.5s'
  ].join(';');
  sessionBadgeEl.innerHTML = `Remoto: <strong style="color:var(--color-accent);letter-spacing:0.2em">${SESSION_ID}</strong>`;
  document.body.appendChild(sessionBadgeEl);

  let remoteWs = null;

  function sendStateUpdate() {
    if (!remoteWs || remoteWs.readyState !== WebSocket.OPEN) return;
    remoteWs.send(JSON.stringify({
      type: 'state-update',
      slideIndex: activeSlideIndex,
      stepIndex: currentStepIndex
    }));
  }

  function connectRemote() {
    try {
      remoteWs = new WebSocket(WS_URL);
    } catch (e) {
      console.warn('[Remote] WebSocket não disponível:', e.message);
      return;
    }

    remoteWs.onopen = () => {
      remoteWs.send(JSON.stringify({ type: 'register', sessionId: SESSION_ID, role: 'host' }));
      console.log(`[Remote] Conectado ao servidor. Sala: ${SESSION_ID}`);
    };

    remoteWs.onmessage = (event) => {
      let data;
      try { data = JSON.parse(event.data); } catch { return; }

      // Quando o celular conecta, envia o estado atual para sincronizar o teleprompter
      if (data.type === 'request-state') {
        sendStateUpdate();
        return;
      }

      // Comandos de navegação do celular — simulam o teclado diretamente
      if (data.type === 'command') {
        if (data.action === 'next') {
          handleKeyDown({ key: 'ArrowRight', preventDefault: () => {} });
        } else if (data.action === 'prev') {
          handleKeyDown({ key: 'ArrowLeft', preventDefault: () => {} });
        }
      }
    };

    remoteWs.onclose = () => {
      console.log('[Remote] Desconectado — tentando reconectar em 5s…');
      setTimeout(connectRemote, 5000);
    };

    remoteWs.onerror = (err) => {
      console.warn('[Remote] Erro de WebSocket:', err.message ?? err);
    };
  }

  let _remoteConnected = false;
  // ── FIM DO BLOCO DE CONTROLE REMOTO ──────────────────────────────────────

  // 1. Inicializar delays automáticos nos elementos principais para entrada fluida
  sections.forEach(section => {
    const contentContainer = section.querySelector('[data-content]');
    if (contentContainer) {
      const children = Array.from(contentContainer.children);
      children.forEach((child, i) => {
        if (!child.hasAttribute('data-step') || child.dataset.step === "1") {
          child.style.setProperty('--delay', `${i * 80}ms`);
        }
      });
    }
  });

  // 2. Mapeamento e Configuração de Passos por Slide
  function getStepsForSlide(slideSection) {
    return Array.from(slideSection.querySelectorAll('[data-step]'))
      .sort((a, b) => {
        const stepA = parseInt(a.dataset.step, 10);
        const stepB = parseInt(b.dataset.step, 10);
        return stepA - stepB;
      });
  }

  function updateSlideState(index, isKeyboardHorizontal = false) {
    const oldSlideIndex = activeSlideIndex;
    activeSlideIndex = index;
    const activeSection = sections[index];
    const isDarkSection = activeSection.classList.contains('dark');
    const didSlideActuallyChange = hasCompletedInitialRender && index !== oldSlideIndex;

    if (didSlideActuallyChange) {
      hasNavigatedBetweenSlides = true;
    }

    // O indicador só aparece depois da primeira navegação real entre slides.
    if (indicatorContainer) {
      const shouldShowIndicator = hasNavigatedBetweenSlides && index > 0;

      if (!shouldShowIndicator) {
        indicatorContainer.style.opacity = '0';
        indicatorContainer.style.pointerEvents = 'none';
      } else {
        indicatorContainer.style.opacity = '1';
        indicatorContainer.style.pointerEvents = 'auto';
      }

      indicatorContainer.classList.toggle('theme-dark', isDarkSection);
      indicatorContainer.classList.toggle('theme-light', !isDarkSection);
    }

    // Adicionar classe is-visible na seção ativa e remover das outras
    sections.forEach((sec, i) => {
      sec.classList.toggle('is-visible', i === index);
    });

    // Atualizar indicador lateral
    indicators.forEach((ind, i) => {
      ind.classList.toggle('expand', i === index);
    });

    // Configurar passos do slide ativo
    activeSlideSteps = getStepsForSlide(activeSection);

    // Determinar o currentStepIndex com base no tipo de transição
    if (isKeyboardHorizontal) {
      if (index > oldSlideIndex) {
        // Indo para a frente: começa com passos ocultos
        currentStepIndex = 0;
      } else if (index < oldSlideIndex) {
        // Voltando para trás: começa com todos os passos visíveis
        currentStepIndex = activeSlideSteps.length;
      }
    } else {
      // Snap scroll, mouse, ou clique: todos os passos visíveis
      currentStepIndex = activeSlideSteps.length;
    }

    // Aplicar a visibilidade física das classes active-step
    activeSlideSteps.forEach(stepEl => {
      const stepVal = parseInt(stepEl.dataset.step, 10);
      if (stepVal <= currentStepIndex) {
        stepEl.classList.add('active-step');
      } else {
        stepEl.classList.remove('active-step');
      }
    });

    // Gatilho de animações e painéis na inicialização do slide
    triggerStepAnimations(activeSlideIndex, currentStepIndex);

    // Salvar o estado atual no LocalStorage e na URL (Hash) silenciosamente para restauração ao atualizar
    if (!isPresenter) {
      sessionStorage.setItem('activeSlideIndex', index);
      const slideId = activeSection.id;
      if (slideId) {
        history.replaceState(null, null, `#${slideId}`);
      }
      // Notifica o controle remoto sobre a mudança de slide
      sendStateUpdate();
    }

    hasCompletedInitialRender = true;
  }

  // 3. Configurar urlParams para checar se é visualização de miniatura de apresentador
  const urlParams = new URLSearchParams(window.location.search);
  const isPresenter = urlParams.has('presenter');

  // 4. Configurar IntersectionObserver para detectar scroll nativo (apenas se NÃO for miniatura)
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.55 // Quando a maior parte do slide está na tela
  };

  const observerCallback = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = parseInt(entry.target.dataset.index, 10);
        // Só atualiza o estado se for via scroll nativo do mouse
        if (index !== activeSlideIndex) {
          updateSlideState(index, false);
        }
      }
    });
  };

  if (!isPresenter) {
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(section => observer.observe(section));
    // Conecta ao servidor WebSocket de controle remoto (apenas na apresentação real, não no iframe)
    if (!_remoteConnected) {
      _remoteConnected = true;
      connectRemote();
    }
  }

  // 5. Sistema de Rolagem Magnética de Slide
  const scrollToSlide = (index, isKeyboardHorizontal = false) => {
    if (index >= 0 && index < sections.length) {
      sections[index].scrollIntoView({ behavior: 'smooth' });
      updateSlideState(index, isKeyboardHorizontal);
    }
  };

  // 6. Controle de Teclado Híbrido Inteligente (apenas se NÃO for miniatura)
  const handleKeyDown = (e) => {
    // Intercepta apenas o comportamento de navegação por setas e space
    if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', ' ', 'PageDown', 'PageUp'].includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      // Avança para o próximo slide diretamente (revelando todos os passos)
      if (activeSlideIndex < sections.length - 1) {
        scrollToSlide(activeSlideIndex + 1, false);
      }
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      // Retrocede para o slide anterior diretamente (revelando todos os passos)
      if (activeSlideIndex > 0) {
        scrollToSlide(activeSlideIndex - 1, false);
      }
    } else if (e.key === 'ArrowRight' || e.key === ' ') {
      // Avançar passo ou slide
      const maxSteps = activeSlideSteps.length;
      if (currentStepIndex < maxSteps) {
        currentStepIndex++;
        activeSlideSteps.forEach(stepEl => {
          if (parseInt(stepEl.dataset.step, 10) === currentStepIndex) {
            stepEl.classList.add('active-step');
          }
        });
        triggerStepAnimations(activeSlideIndex, currentStepIndex);
        sendStateUpdate();
      } else {
        // Já no último passo do slide, avança para o próximo slide (e inicia com passos ocultos se for horizontal)
        if (activeSlideIndex < sections.length - 1) {
          scrollToSlide(activeSlideIndex + 1, true);
        }
      }
    } else if (e.key === 'ArrowLeft') {
      // Retroceder passo ou slide
      const minStep = 0;
      if (currentStepIndex > minStep) {
        activeSlideSteps.forEach(stepEl => {
          if (parseInt(stepEl.dataset.step, 10) === currentStepIndex) {
            stepEl.classList.remove('active-step');
          }
        });
        currentStepIndex--;
        triggerStepAnimations(activeSlideIndex, currentStepIndex);
        sendStateUpdate();
      } else {
        // Já no primeiro passo, retrocede para o slide anterior (que iniciará com todos os passos visíveis)
        if (activeSlideIndex > 0) {
          scrollToSlide(activeSlideIndex - 1, true);
        }
      }
    }
  };

  if (!isPresenter) {
    window.addEventListener('keydown', handleKeyDown);
  }

  // 7. Navegação por Clique nos Indicadores de Página
  indicators.forEach(indicator => {
    indicator.addEventListener('click', () => {
      const index = parseInt(indicator.dataset.targetIndex, 10);
      scrollToSlide(index, false);
    });
  });

  // 8. Gatilhos de Animações Específicas por Slide
  function triggerStepAnimations(slideIdx, stepIdx) {
    // Sem animações de passos customizadas necessárias para este deck
  }

  // Inicializar o slide atual na abertura do site (com suporte a hash e modo apresentador)
  const hash = window.location.hash;
  let initIndex = 0;
  if (hash) {
    const matchedSec = document.querySelector(hash);
    if (matchedSec) {
      initIndex = parseInt(matchedSec.dataset.index, 10);
    }
  } else if (!isPresenter) {
    const savedIndex = sessionStorage.getItem('activeSlideIndex');
    if (savedIndex !== null) {
      const idx = parseInt(savedIndex, 10);
      if (idx >= 0 && idx < sections.length) {
        initIndex = idx;
      }
    }
  }

  if (isPresenter) {
    if (hash) {
      const matchedSec = document.querySelector(hash);
      if (matchedSec) {
        setTimeout(() => {
          matchedSec.scrollIntoView({ behavior: 'auto' });
        }, 100);
      }
    }
    updateSlideState(initIndex, false);

    // Revelar todos os passos para o "estágio final"
    const activeSection = sections[initIndex];
    const steps = Array.from(activeSection.querySelectorAll('[data-step]'));
    steps.forEach(stepEl => {
      stepEl.classList.add('active-step');
    });

    triggerStepAnimations(initIndex, steps.length);
  } else {
    if (initIndex > 0) {
      setTimeout(() => {
        sections[initIndex].scrollIntoView({ behavior: 'auto' });
      }, 50);
      updateSlideState(initIndex, false);
    } else {
      updateSlideState(0, false);
    }
  }

  // ── CICLO DE VIDA DE IMPRESSÃO (EXPORTAÇÃO PARA PDF 1080P) ────────────────
  function prepareForPrint() {
    document.body.classList.add('is-printing');
    
    // Forçar a ativação de todos os passos de todas as seções
    const allSteps = document.querySelectorAll('[data-step]');
    allSteps.forEach(step => {
      step.classList.add('active-step');
    });
  }

  function cleanupAfterPrint() {
    document.body.classList.remove('is-printing');
    
    // Restaurar a apresentação para o slide e passos ativos corretos
    updateSlideState(activeSlideIndex, false);
  }

  if (!isPresenter) {
    window.addEventListener('beforeprint', prepareForPrint);
    window.addEventListener('afterprint', cleanupAfterPrint);

    // Atalho de teclado para impressão
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'p' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          e.preventDefault();
          window.print();
        }
      }
    });
  }
});
