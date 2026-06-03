// ===== STATE (localStorage 동기화) =====
    const STORAGE_KEY = 'bloom_v2_state';
    const defaultState = {
      currentTab: 'home',
      tone: '감성적',
      category: '공예',
      darkMode: false,
      onboardingComplete: false,
      onboardingDrafts: null,
      scheduledPosts: [
        { id: 1, date: '2026-05-28', time: '10:00', caption: '봄날 햇살처럼 따스한 손편지 💌 #캘리그래피' },
        { id: 2, date: '2026-05-30', time: '20:00', caption: '주말 워크샵 안내 — 5월 봄 캘리 클래스 신청받습니다 🌸' },
        { id: 3, date: '2026-06-02', time: '14:00', caption: '신메뉴 안내 — 봄 디저트 캘리그래피 카드 세트 ✨' },
      ],
      analyticsRange: '7d',
      currentTheme: 'bloom',
      weeklyDrafts: [],
      marketingKits: [],
      pilotFeedback: [],
      draftFilter: 'all',
      storageView: 'all',
      studioMood: '따뜻한',
      plan: 'free',
      usage: {
        period: '',
        aiGenerations: 0,
        savedDrafts: 0,
        scheduledPlans: 0,
      },
      settings: {
        storeName: '은빛캘리', category: '공예',
        instagram: '@eunbickaelri', email: 'hun2620@naver.com',
        phone: '', address: '', description: '',
        region: '의정부', mainOffer: '캘리그래피 원데이 클래스',
        brandTone: '따뜻한', targetCustomer: '취미를 찾는 동네 고객',
        postsGoal: 8, followersGoal: 3000, engagementGoal: 5,
      },
      drafts: [],
    };
    let state = loadState();
    function loadState() {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        return {
          ...defaultState,
          ...saved,
          settings: { ...defaultState.settings, ...(saved.settings || {}) },
          usage: { ...defaultState.usage, ...(saved.usage || {}) },
        };
      } catch { return { ...defaultState }; }
    }
    function saveState() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }
    state.calDate = new Date(2026, 4, 1);
    state.selectedDay = null;

    const FREE_LIMITS = {
      aiGenerations: 30,
      savedDrafts: 20,
      scheduledPlans: 10,
    };

    function getUsagePeriod() {
      return new Date().toISOString().slice(0, 7);
    }

    function ensureUsagePeriod() {
      const period = getUsagePeriod();
      if (!state.usage || state.usage.period !== period) {
        state.usage = { period, aiGenerations: 0, savedDrafts: 0, scheduledPlans: 0 };
        saveState();
      }
    }

    function getUsageLabel(key) {
      return {
        aiGenerations: 'AI 생성',
        savedDrafts: '저장함',
        scheduledPlans: '예약 계획',
      }[key] || '사용량';
    }

    function getUsageValue(key) {
      ensureUsagePeriod();
      return Number(state.usage?.[key] || 0);
    }

    function tryUseFreeQuota(key) {
      ensureUsagePeriod();
      if (state.plan === 'pro') return true;
      const limit = FREE_LIMITS[key];
      if (!limit) return true;
      if (getUsageValue(key) >= limit) {
        showPlanLimitModal(key);
        return false;
      }
      state.usage[key] = getUsageValue(key) + 1;
      saveState();
      renderUsageWidgets();
      return true;
    }

    function getUsageRows() {
      return [
        { key: 'aiGenerations', label: 'AI 생성', desc: '캡션·해시태그·플레이스 문안' },
        { key: 'savedDrafts', label: '저장함', desc: '이번 주 문안 저장' },
        { key: 'scheduledPlans', label: '예약 계획', desc: '수동 게시 일정 관리' },
      ];
    }

    function renderUsageWidgets() {
      ensureUsagePeriod();
      const rows = getUsageRows();
      const mini = document.getElementById('usage-mini');
      if (mini) {
        mini.innerHTML = rows.map(row => {
          const value = getUsageValue(row.key);
          const limit = FREE_LIMITS[row.key];
          const pct = Math.min(100, Math.round((value / limit) * 100));
          return `
            <div class="usage-mini-row">
              <span>${row.label}</span>
              <strong>${value}/${limit}</strong>
              <div class="usage-bar"><span style="width:${pct}%"></span></div>
            </div>`;
        }).join('');
      }

      const account = document.getElementById('settings-usage-panel');
      if (account) {
        account.innerHTML = `
          <div class="plan-usage-grid">
            ${rows.map(row => {
              const value = getUsageValue(row.key);
              const limit = FREE_LIMITS[row.key];
              const pct = Math.min(100, Math.round((value / limit) * 100));
              return `
                <div class="plan-usage-card">
                  <div class="plan-usage-top">
                    <span>${row.label}</span>
                    <strong>${value}/${limit}</strong>
                  </div>
                  <div class="plan-usage-desc">${row.desc}</div>
                  <div class="usage-bar"><span style="width:${pct}%"></span></div>
                </div>`;
            }).join('')}
          </div>`;
      }
    }

    function showPlanLimitModal(key) {
      const label = getUsageLabel(key);
      openModal('Bloom Free 한도 안내', `
        <div class="plan-limit-modal">
          <div class="plan-limit-kicker">이번 달 ${label} 한도를 모두 사용했어요</div>
          <div class="plan-limit-price">Bloom Pro · 월 9,900원</div>
          <p>파일럿 기간에는 결제 연동 전이라도, 이 화면에서 어떤 기능을 유료 가치로 볼지 먼저 검증해요.</p>
          <div class="plan-compare">
            <div>
              <strong>Free</strong>
              <span>AI 생성 30회</span>
              <span>저장함 20개</span>
              <span>예약 계획 10개</span>
            </div>
            <div>
              <strong>Pro</strong>
              <span>AI 생성 무제한</span>
              <span>저장함 무제한</span>
              <span>파일럿 우선 지원</span>
            </div>
          </div>
          <button class="btn btn-primary" style="width:100%;justify-content:center;" onclick="upgradeProMenu()">Pro 자세히 보기</button>
        </div>`);
    }

    function normalizeCategory(value) {
      return String(value || '')
        .replace(/[^\uAC00-\uD7A3a-zA-Z0-9\s/]/g, '')
        .trim();
    }

    function setSelectByNormalizedValue(select, value) {
      if (!select) return;
      const normalized = normalizeCategory(value);
      const option = Array.from(select.options || []).find(opt =>
        normalizeCategory(opt.value) === normalized || normalizeCategory(opt.textContent) === normalized
      );
      if (option) select.value = option.value;
    }

    function syncCategoryAcrossUI(category) {
      const normalized = normalizeCategory(category) || defaultState.category;
      state.category = normalized;
      state.settings.category = normalized;

      document.querySelectorAll('.cat-chip').forEach(chip => {
        chip.classList.toggle('active', normalizeCategory(chip.dataset.cat) === normalized);
      });

      setSelectByNormalizedValue(document.getElementById('settings-category-select'), normalized);
      ['ai-hashtag-category', 'ai-idea-category', 'ai-time-category', 'hashtag-category'].forEach(id => {
        setSelectByNormalizedValue(document.getElementById(id), normalized);
      });
    }

    function syncToneAcrossUI(tone) {
      const nextTone = tone || defaultState.tone;
      state.tone = nextTone;
      document.querySelectorAll('.tone-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.tone === nextTone);
      });
      const captionTone = document.getElementById('ai-caption-tone');
      if (captionTone && Array.from(captionTone.options || []).some(opt => opt.value === nextTone)) {
        captionTone.value = nextTone;
      }
    }

    const HASHTAG_FALLBACK = {
      '공예': ['#캘리그래피', '#손글씨', '#감성캘리', '#작가소통', '#손편지', '#공예작가', '#수공예', '#원데이클래스', '#의정부공방', '#캘리스타그램'],
      '음식점': ['#맛집', '#오늘의메뉴', '#한식', '#가정식', '#맛스타그램', '#먹스타그램', '#JMT', '#존맛탱', '#점심추천', '#저녁추천'],
      '카페': ['#카페', '#커피', '#디저트', '#카페스타그램', '#감성카페', '#애식', '#아메리카노', '#카페투어', '#오늘의카페', '#커피스타그램'],
      '패션': ['#패션', '#데일리룩', '#스타일', '#일상룩', '#코디', '#트렌드', '#패션스타그램', '#옷스타그램'],
      '뷰티': ['#뷰티', '#스킨케어', '#메이크업', '#K뷰티', '#피부관리', '#여름네일', '#뷰티스타그램', '#화장품'],
      '여행': ['#여행', '#여행스타그램', '#풍경', '#자연', '#감성여행', '#국내여행', '#여행기록', '#추천'],
      '학원': ['#학원', '#수업', '#공부습관', '#교육정보', '#입시정보', '#동네학원', '#학부모소통', '#공부스타그램'],
      '운동/건강': ['#운동', '#건강관리', '#헬스', '#필라테스', '#다이어트', '#운동스타그램', '#건강습관', '#오늘운동'],
      '기타': ['#소상공인', '#동네가게', '#오늘의소식', '#신규오픈', '#예약문의', '#고객감사', '#우리매장'],
    };

    function getHashtagFallback(category, limit) {
      const tags = HASHTAG_FALLBACK[category] || HASHTAG_FALLBACK['기타'];
      return Number.isFinite(limit) ? tags.slice(0, limit) : [...tags];
    }

    const NUMERIC_SETTINGS = new Set(['postsGoal', 'followersGoal', 'engagementGoal']);

    const SEARCH_TABS = [
      { icon: '🏠', name: '홈', tab: 'home', desc: '오늘 할 일 · 파일럿 흐름 · 성과 요약' },
      { icon: '✨', name: '딸깍 만들기', tab: 'ai', desc: '인스타 · 네이버 · 쿠폰 · 배너 문안 생성' },
      { icon: '📅', name: '저장함', tab: 'schedule', desc: '초안 저장 · 예약 계획 · 마케팅 키트 보관' },
      { icon: '🏪', name: '내 매장', tab: 'settings', desc: '매장 정보 · 목표 · 톤앤매너 설정' },
      { icon: '📝', name: '인스타 단품', tab: 'post', desc: 'AI 캡션 생성 · 이미지 업로드' },
      { icon: '📊', name: '성과 분석', tab: 'analytics', desc: '좋아요 · 팔로워 · 참여율 차트' },
      { icon: '📄', name: '파일럿 제안서', tab: 'proposal', desc: '고객 설명 · 가격 · 파일럿 혜택' },
      { icon: '#️⃣', name: '해시태그 분석', tab: 'hashtag', desc: '트렌드 해시태그 · AI 추천' },
    ];

    const SEARCH_FEATURES = [
      { icon: '✨', name: '딸깍 키트', tab: 'ai', desc: '딸깍 만들기 → 인스타·네이버 묶음 생성' },
      { icon: '🎨', name: 'AI 캡션 생성', tab: 'post', desc: '인스타 단품 → AI 생성 버튼' },
      { icon: '📸', name: '이미지 업로드', tab: 'post', desc: '인스타 단품 → 사진 선택' },
      { icon: '📆', name: '날짜 예약', tab: 'schedule', desc: '저장함 → 달력 선택' },
      { icon: '🗂️', name: '문안 저장함', tab: 'schedule', desc: '저장함 → 초안과 마케팅 키트 관리' },
      { icon: '🌈', name: '테마 변경', tab: 'settings', desc: '내 매장 → 색상 테마' },
      { icon: '🎯', name: '목표 설정', tab: 'settings', desc: '내 매장 → 목표 섹션' },
      { icon: '🌸', name: '파일럿 제안 복사', tab: 'proposal', desc: '파일럿 제안서 → 라이브 링크 복사' },
      { icon: '📋', name: '리포트 다운로드', tab: 'analytics', desc: '성과 분석 → 리포트 내보내기' },
      { icon: '💬', name: 'AI 채팅', tab: 'ai', desc: '딸깍 만들기 → 채팅 모드' },
      { icon: '⏰', name: '최적 게시 시간', tab: 'ai', desc: '딸깍 만들기 → 최적 시간 분석' },
    ];

    function getSettingsControls() {
      return document.querySelectorAll('#tab-settings [data-setting]');
    }

    function restoreSettingsForm() {
      getSettingsControls().forEach(control => {
        const key = control.dataset.setting;
        const value = state.settings[key];
        if (value !== undefined && value !== null) control.value = value;
      });
      syncCategoryAcrossUI(state.settings.category || state.category);
      syncToneAcrossUI(state.tone || state.settings.brandTone);
    }

    function applySettingsForm() {
      getSettingsControls().forEach(control => {
        const key = control.dataset.setting;
        if (!key) return;
        state.settings[key] = NUMERIC_SETTINGS.has(key) ? Number(control.value || 0) : control.value;
      });
      syncCategoryAcrossUI(state.settings.category || state.category);
      syncToneAcrossUI(state.tone || state.settings.brandTone);
    }
    
    // ===== TABS =====
    function switchTab(tab) {
      state.currentTab = tab;
      saveState();
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      document.querySelectorAll('.bottom-tab').forEach(n => n.classList.remove('active'));
      document.querySelectorAll('.flow-step').forEach(n => n.classList.remove('active'));
      const tabEl = document.getElementById('tab-' + tab);
      if (tabEl) tabEl.classList.add('active');
      document.querySelectorAll(`[data-tab="${tab}"]`).forEach(n => n.classList.add('active'));
      
      if (tab === 'home') renderTodayTasks();
      if (tab === 'analytics') setTimeout(initCharts, 100);
      if (tab === 'schedule') { renderCalendar(); renderScheduledPosts(); renderMarketingKits(); renderDraftQueue(); updateMobilePreview(); }
      if (tab === 'settings') renderPilotFeedbackPanel();
      if (tab === 'hashtag') { setTimeout(() => loadTrendingHashtags(state.category || '공예'), 100); renderMyHashtags(); }
      
      // 페이지 상단으로 스크롤
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    document.querySelectorAll('[data-tab]').forEach(item => {
      item.addEventListener('click', () => switchTab(item.dataset.tab));
    });

    document.querySelectorAll('[data-studio-idea]').forEach(item => {
      item.addEventListener('click', () => applyStudioIdea(item.dataset.studioIdea));
    });

    document.querySelectorAll('[data-studio-scenario]').forEach(item => {
      item.addEventListener('click', () => applyStudioScenario(item.dataset.studioScenario));
    });

    document.querySelectorAll('[data-studio-scenario-mode]').forEach(item => {
      item.addEventListener('click', () => setStudioScenarioMode(item.dataset.studioScenarioMode, item));
    });

    document.getElementById('studio-topic')?.addEventListener('input', () => updateStudioAutoType());
    document.getElementById('studio-naver-type')?.addEventListener('change', () => updateStudioAutoType());

    document.querySelectorAll('.studio-moods [data-mood]').forEach(item => {
      item.addEventListener('click', () => selectStudioMood(item.dataset.mood, item));
    });

    document.getElementById('studio-generate-btn')?.addEventListener('click', () => generateStudioKit());
    updateStudioAutoType();

    document.querySelectorAll('[data-storage-view]').forEach(item => {
      item.addEventListener('click', () => setStorageView(item.dataset.storageView, item));
    });
    
    function toggleSidebar() {
      document.getElementById('sidebar').classList.toggle('open');
      document.querySelector('.sidebar-overlay').classList.toggle('show');
    }
    
    // ===== TOAST =====
    function toast(msg, type = 'success') {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.className = 'toast show ' + type;
      setTimeout(() => t.classList.remove('show'), 2800);
    }
    
    // ===== NEW POST =====
    document.querySelectorAll('.tone-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        syncToneAcrossUI(chip.dataset.tone);
        saveState();
      });
    });
    document.querySelectorAll('.cat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        syncCategoryAcrossUI(chip.dataset.cat);
        saveState();
      });
    });
    ['ai-hashtag-category', 'ai-idea-category', 'ai-time-category', 'hashtag-category'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', (e) => {
        syncCategoryAcrossUI(e.target.value);
        saveState();
      });
    });
    
    // Photo upload (Post)
    const uploadInput = document.getElementById('upload-input');
    const uploadZone = document.getElementById('upload-zone');
    if (uploadInput) {
      uploadInput.addEventListener('change', (e) => {
        if (e.target.files[0]) showUploadedImage(e.target.files[0]);
      });
    }
    if (uploadZone) {
      uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.style.borderColor = 'var(--purple)'; });
      uploadZone.addEventListener('dragleave', () => { uploadZone.style.borderColor = ''; });
      uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files[0]) showUploadedImage(e.dataTransfer.files[0]);
      });
    }
    function showUploadedImage(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadZone.classList.add('has-image');
        uploadZone.innerHTML = `<img src="${e.target.result}" alt="업로드된 사진">`;
        // 사진 업로드 직후 자동 분석
        analyzeImageForHashtags(e.target.result.split(',')[1], file.type);
      };
      reader.readAsDataURL(file);
    }
    
    async function analyzeImageForHashtags(imageBase64, imageType) {
      const box = document.getElementById('ai-analysis-box');
      const content = document.getElementById('ai-analysis-content');
      const meta = document.getElementById('ai-analysis-meta');
      
      box.classList.add('show');
      content.innerHTML = `
        <div class="ai-analyzing">
          <div class="ai-spinner"></div>
          <span style="font-size: 12px; color: var(--sub); font-weight: 500;">사진을 분석 중이에요...</span>
        </div>`;
      meta.textContent = '분석 중';
      
      try {
        const res = await fetch('/api/hashtag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageBase64, imageType, category: state.category }),
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        renderHashtagChips(data.hashtags || []);
        meta.textContent = `${(data.hashtags || []).length}개 추천`;
      } catch (e) {
        const fallback = getHashtagFallback(state.category, 6);
        renderHashtagChips(fallback);
        meta.textContent = '오프라인 추천';
      }
    }
    
    function renderHashtagChips(hashtags) {
      const content = document.getElementById('ai-analysis-content');
      content.innerHTML = `
        <div class="hashtag-chips" id="hashtag-chips-container">
          ${hashtags.map((tag, i) => `<button class="hashtag-chip" data-tag="${tag}" onclick="addHashtag('${tag}', this)">${tag}</button>`).join('')}
        </div>
        <button class="add-all-btn" onclick="addAllHashtags()">✨ 전부 캡션에 추가</button>`;
    }
    
    function addHashtag(tag, el) {
      const textarea = document.getElementById('caption-final');
      if (!textarea.value.includes(tag)) {
        const sep = textarea.value && !textarea.value.endsWith('\n') ? ' ' : '';
        textarea.value += sep + tag;
        if (el) el.classList.add('added');
        updateCaptionMeta();
      }
    }
    
    function addAllHashtags() {
      const textarea = document.getElementById('caption-final');
      const chips = document.querySelectorAll('#hashtag-chips-container .hashtag-chip');
      const tagsToAdd = [];
      chips.forEach(c => {
        const tag = c.dataset.tag;
        if (!textarea.value.includes(tag)) tagsToAdd.push(tag);
        c.classList.add('added');
      });
      if (tagsToAdd.length > 0) {
        const sep = textarea.value && !textarea.value.endsWith('\n') ? '\n\n' : '';
        textarea.value += sep + tagsToAdd.join(' ');
        updateCaptionMeta();
        toast(`✨ ${tagsToAdd.length}개 해시태그 추가됨`);
      } else {
        toast('💡 이미 모두 추가되어 있어요');
      }
    }
    
    async function regenerateCaption() {
      const aiOutput = document.getElementById('ai-output');
      if (!tryUseFreeQuota('aiGenerations')) return;
      const fallbackSamples = [
        `봄날 햇살처럼 따스한 손편지 💌\n\n오늘은 캘리그래피로 마음을 전하는 시간을 가져봤어요. 한 글자 한 글자에 담긴 정성이 누군가에겐 큰 위로가 되길 ☘️\n\n#캘리그래피 #손글씨 #감성캘리 #봄캘리 #손편지`,
        `잔잔한 오후, 펜 끝에서 피어나는 한 줄 ✨\n\n바쁜 일상 속에서도 잠시 멈추고 손글씨로 마음을 정리하는 시간. 오늘은 어떤 글귀를 적어볼까요? 💭\n\n#감성글귀 #손글씨일상 #캘리그래피 #힐링타임 #작가의방`,
        `봄이 오면 글씨도 피어나요 🌸\n\n이번 주는 봄 시리즈를 준비했어요. 따스한 톤과 부드러운 곡선으로, 보는 것만으로도 마음이 풀어지는 작품 💛\n\n#봄감성 #캘리그래피작가 #손편지 #봄작품 #힐링`,
      ];
      
      // 업로드된 이미지가 있으면 base64로 추출
      let imageBase64 = null;
      let imageType = 'image/jpeg';
      const img = document.querySelector('.upload-zone.has-image img');
      if (img && img.src.startsWith('data:')) {
        const parts = img.src.split(',');
        imageType = parts[0].split(':')[1].split(';')[0];
        imageBase64 = parts[1];
      }
      
      const originalText = aiOutput.textContent;
      aiOutput.innerHTML = '<span style="opacity:.7;">✨ AI가 캡션을 생성 중...</span>';
      
      try {
        const res = await fetch('/api/caption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tone: state.tone, image: imageBase64, imageType }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'API error');
        }
        const data = await res.json();
        aiOutput.textContent = data.caption || fallbackSamples[0];
        toast('✨ AI 캡션 생성 완료!');
      } catch (e) {
        // 로컬 / API 실패 시 샘플 fallback
        const idx = Math.floor(Math.random() * fallbackSamples.length);
        aiOutput.textContent = fallbackSamples[idx];
        toast('💡 샘플 캡션 (API 없음 / 로컬 모드)');
      }
    }
    function copyCaption() {
      const text = document.getElementById('ai-output').textContent;
      navigator.clipboard.writeText(text).then(() => toast('📋 클립보드에 복사됐어요'));
    }
    function copyPilotLink() {
      const url = 'https://eunbit-marketing.vercel.app/#proposal';
      navigator.clipboard.writeText(url)
        .then(() => toast('🌸 파일럿 링크를 복사했어요'))
        .catch(() => toast(url));
    }

    function copyPilotInviteText() {
      const text = `Bloom 파일럿 테스트 안내\n\n인스타그램과 네이버 플레이스에 올릴 문안을 한 번에 만들어주는 소상공인 AI 마케팅 비서입니다.\n현재는 자동 발행 전 단계라, AI가 만든 문안을 복사해서 바로 쓰는 방식으로 테스트하고 있어요.\n\n체험 링크: https://eunbit-marketing.vercel.app/#proposal`;
      navigator.clipboard.writeText(text).then(() => toast('📋 파일럿 소개 문구를 복사했어요'));
    }

    function copyEunbitPilotMessage() {
      const text = `은빛캘리 파일럿 테스트 안내\n\n안녕하세요. 지금 Bloom 파일럿 버전을 은빛캘리 기준으로 먼저 테스트할 수 있게 준비해두었습니다.\n\n아래 링크를 열고 [딸깍 만들기]에서 [은빛캘리 샘플]의 [원데이 클래스 모집]을 눌러보시면, 주제/기간/혜택/문의/분위기/네이버 유형이 자동으로 채워집니다.\n\n그다음 [딸깍 키트 생성]을 눌러 인스타그램 캡션, 네이버 플레이스 소식, 쿠폰 문안, 리뷰 답글이 실제로 쓸 만한지 봐주세요.\n\n체험 링크: https://eunbit-marketing.vercel.app/#proposal\n\n확인해주시면 좋은 것\n1. 문안이 은빛캘리 말투와 맞는지\n2. 네이버 플레이스에 복사해서 쓰기 편한지\n3. 월 9,900원이라면 계속 쓸 만한지`;
      navigator.clipboard.writeText(text).then(() => toast('📋 은빛캘리 첫 안내문을 복사했어요'));
    }
    window.copyEunbitPilotMessage = copyEunbitPilotMessage;
    function useCaption() {
      const text = document.getElementById('ai-output').textContent;
      document.getElementById('caption-final').value = text;
      updateCaptionMeta();
      toast('✅ AI 캡션을 가져왔어요');
    }
    function applyTemplate(n) {
      const templates = {
        1: '오늘의 추천 ✨\n\n특별히 준비한 작품을 소개해드려요. 마음이 닿기를 바라며.\n\n#추천 #오늘 #특별',
        2: '이런 순간을 사랑합니다 ❤️\n\n함께하는 시간이 최고예요.\n\n#순간 #감성 #함께',
        3: '항상 감사합니다 🙏\n\n여러분의 사랑이 저를 행복하게 만들어요.\n\n#감사 #사랑 #응원',
        4: '새롭게 만났어요 🌸\n\n오랜만에 선보이는 신작이에요. 살펴봐주세요!\n\n#신메뉴 #신작 #업데이트',
      };
      document.getElementById('caption-final').value = templates[n];
      updateCaptionMeta();
    }
    function updateCaptionMeta() {
      const text = document.getElementById('caption-final').value;
      const hashes = (text.match(/#\S+/g) || []).length;
      document.getElementById('char-count').textContent = `${text.length} / 2,200자`;
      document.getElementById('hash-count').textContent = `📝 ${hashes} 해시태그`;
    }
    function saveDraft() {
      const cap = document.getElementById('caption-final').value;
      if (!cap.trim()) { toast('✍️ 캡션을 먼저 입력해주세요'); return; }
      state.drafts.push({ id: Date.now(), caption: cap, tone: state.tone, category: state.category, createdAt: new Date().toISOString() });
      saveMarketingDraft({ channel: '인스타그램', text: cap, source: '게시물 작성', status: 'draft', silent: true });
      saveState();
      toast(`💾 임시저장 완료 (총 ${state.drafts.length}개)`);
    }
    async function publishPost() {
      const cap = document.getElementById('caption-final').value;
      if (!cap.trim()) { toast('✍️ 캡션을 입력해주세요'); return; }
      try {
        await navigator.clipboard.writeText(cap);
        saveMarketingDraft({ channel: '인스타그램', text: cap, source: '게시물 작성 복사', status: 'copied', silent: true });
        toast('📋 문안을 복사하고 저장했어요. 실제 업로드는 인스타그램에서 직접 진행해주세요.');
      } catch {
        saveMarketingDraft({ channel: '인스타그램', text: cap, source: '게시물 작성 저장', status: 'draft', silent: true });
        toast('🗂️ 문안을 저장했어요. 복사가 안 되면 저장함에서 다시 복사해주세요.');
      }
    }
    
    // ===== INIT =====
    document.addEventListener('DOMContentLoaded', () => {
      // 저장된 테마 적용
      applyTheme(state.currentTheme || 'bloom');
      document.querySelectorAll('.theme-swatch').forEach(s => s.classList.remove('active'));
      const themeMap = { bloom: 0, sunset: 1, dreamy: 2, spring: 3, mint: 4, dark: 5 };
      const themeIdx = themeMap[state.currentTheme] ?? 0;
      const themeSwatch = document.querySelectorAll('.theme-swatch')[themeIdx];
      if (themeSwatch) themeSwatch.classList.add('active');

      // v2.3 다크 모드 초기 적용 (저장값 or 시스템 설정)
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const savedDark = state.darkMode ?? prefersDark;
      state.darkMode = savedDark;
      applyDarkMode(savedDark);
      // 시스템 다크모드 변경 실시간 반영 (사용자가 수동 설정 안 한 경우만)
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (state.darkMode === prefersDark) { // 아직 기본값이면
          state.darkMode = e.matches;
          applyDarkMode(e.matches);
        }
      });
      
      restoreSettingsForm();

      const hashTab = window.location.hash.replace('#', '');
      const validTabs = new Set(SEARCH_TABS.map(tab => tab.tab));
      const initialTab = validTabs.has(hashTab) ? hashTab : state.currentTab;
      if (validTabs.has(initialTab)) switchTab(initialTab);
      
      // 검색 이벤트 리스너
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('keyup', handleSearch);
        searchInput.addEventListener('focus', () => {
          if (searchInput.value.trim()) handleSearch({ target: searchInput, key: '' });
        });
      }

      // 외부 클릭 시 드롭다운 닫기
      document.addEventListener('click', (e) => {
        const wrap = document.querySelector('.search-wrap');
        if (wrap && !wrap.contains(e.target)) closeSearch();
      });

      // v2.3 키보드 단축키 핸들러 (⌘K, Esc, G+key, ?, ⌘D)
      let _gPending = false, _gTimer = null;
      document.addEventListener('keydown', (e) => {
        const isTyping = e.target.matches('input, textarea, select, [contenteditable]');

        // ⌘K → 검색 포커스
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          searchInput?.focus();
          searchInput?.select();
          return;
        }
        // ⌘D → 다크 모드 전환
        if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
          e.preventDefault();
          toggleDarkMode();
          return;
        }
        // Esc → 검색/모달 닫기
        if (e.key === 'Escape') {
          closeSearch();
          closeModal();
          return;
        }
        if (isTyping) return;
        // ? → 단축키 도움말
        if (e.key === '?') { showKeyboardShortcuts(); return; }
        // G + key → 탭 이동
        if (e.key.toLowerCase() === 'g') {
          _gPending = true;
          clearTimeout(_gTimer);
          _gTimer = setTimeout(() => { _gPending = false; }, 1200);
          return;
        }
        if (_gPending) {
          _gPending = false; clearTimeout(_gTimer);
          const tabMap = { h: 'home', p: 'post', s: 'schedule', a: 'analytics', f: 'proposal', t: 'hashtag', i: 'ai', e: 'settings' };
          const dest = tabMap[e.key.toLowerCase()];
          if (dest) { switchTab(dest); e.preventDefault(); }
        }
      });
      
      renderCalendar();
      renderScheduledPosts();
      renderMarketingKits();
      renderDraftQueue();
      renderTodayTasks();
      syncStudioMoodUI();
      syncStorageViewUI();
      updateMobilePreview();
      renderUsageWidgets();
      renderPilotFeedbackPanel();
      if (!state.onboardingComplete && state.currentTab !== 'proposal') setTimeout(showOnboarding, 500);
      console.log('🌸 Bloom Dashboard v2.3 ready! — 다크모드 12조합 + WCAG AA + 키보드 단축키 + 스켈레톤');
    });

    // ===== ONBOARDING =====
    function escapeHtml(value) {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function showOnboarding() {
      openModal('Bloom 시작하기', `
        <p class="onboarding-copy">
          마케팅을 몰라도 괜찮아요. 매장 정보 몇 가지만 넣으면 Bloom이 인스타와 네이버 플레이스에 바로 쓸 첫 문안을 준비해드릴게요.
        </p>
        <div class="onboarding-grid">
          <label class="onboarding-field">
            <span class="onboarding-label">매장명</span>
            <input class="onboarding-input" id="onboard-store" value="${escapeHtml(state.settings.storeName)}" placeholder="예: 우리동네 카페">
          </label>
          <label class="onboarding-field">
            <span class="onboarding-label">업종</span>
            <select class="onboarding-input" id="onboard-category">
              ${['공예','음식점','카페','뷰티','패션','학원','운동/건강','기타'].map(c => `<option value="${c}" ${state.settings.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </label>
          <label class="onboarding-field">
            <span class="onboarding-label">지역</span>
            <input class="onboarding-input" id="onboard-region" value="${escapeHtml(state.settings.region)}" placeholder="예: 의정부, 성수동">
          </label>
          <label class="onboarding-field">
            <span class="onboarding-label">톤</span>
            <select class="onboarding-input" id="onboard-tone">
              ${['따뜻한','감성적','정보형','친근한','트렌디한'].map(t => `<option value="${t}" ${state.settings.brandTone === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </label>
          <label class="onboarding-field full">
            <span class="onboarding-label">이번에 홍보할 내용</span>
            <input class="onboarding-input" id="onboard-offer" value="${escapeHtml(state.settings.mainOffer)}" placeholder="예: 6월 원데이 클래스 모집, 신메뉴 출시">
          </label>
          <label class="onboarding-field full">
            <span class="onboarding-label">주요 고객</span>
            <input class="onboarding-input" id="onboard-target" value="${escapeHtml(state.settings.targetCustomer)}" placeholder="예: 퇴근 후 취미를 찾는 20~40대">
          </label>
        </div>
        <div class="onboarding-note">입력한 정보는 브라우저에만 저장됩니다. 나중에 설정에서 다시 바꿀 수 있어요.</div>
        <div class="onboarding-actions">
          <button class="btn btn-secondary" onclick="skipOnboarding()">나중에 할게요</button>
          <button class="btn btn-primary" onclick="completeOnboarding()">첫 문안 만들기</button>
        </div>
      `);
    }

    function skipOnboarding() {
      state.onboardingComplete = true;
      saveState();
      closeModal();
      toast('필요할 때 AI 어시스턴트에서 다시 시작할 수 있어요');
    }

    function completeOnboarding() {
      const store = document.getElementById('onboard-store').value.trim() || '우리 매장';
      const category = document.getElementById('onboard-category').value;
      const region = document.getElementById('onboard-region').value.trim();
      const tone = document.getElementById('onboard-tone').value;
      const offer = document.getElementById('onboard-offer').value.trim() || '이번 주 대표 상품';
      const target = document.getElementById('onboard-target').value.trim() || '동네 고객';

      state.settings.storeName = store;
      state.settings.category = category;
      state.settings.region = region;
      state.settings.brandTone = tone;
      state.settings.mainOffer = offer;
      state.settings.targetCustomer = target;
      syncCategoryAcrossUI(category);
      syncToneAcrossUI(tone);
      state.onboardingComplete = true;
      state.onboardingDrafts = generateStarterDrafts({ store, category, region, tone, offer, target });
      saveState();

      applyStarterDrafts();
      showOnboardingResultModal();
    }

    function generateStarterDrafts({ store, category, region, tone, offer, target }) {
      const place = region ? `${region} ` : '';
      const instagramText = `${place}${store}에서 준비한 ${offer} 소식이에요.\n\n${target}에게 부담 없이 전하고 싶은 마음을 ${tone} 톤으로 담아봤어요. 처음 방문하시는 분도 편하게 문의해주세요.\n\n#${category} #소상공인 #동네가게 #오늘의소식`;
      const naverText = `📢 ${store} 소식\n\n${offer} 안내드립니다. ${place}${category}을 찾고 계신 분들이 바로 이해하실 수 있도록 준비했어요.\n\n궁금한 점은 네이버 톡톡 또는 전화로 편하게 문의해주세요.`;
      const weeklyPlan = `🗓️ ${store} 첫 주 마케팅 계획\n\n1. 오늘: 인스타그램에 "${offer}" 소개 문안 업로드\n2. 내일: 네이버 플레이스 소식에 같은 내용을 더 정보형으로 등록\n3. 주중: 고객 후기 또는 작업 과정을 짧게 공유\n4. 주말 전: 예약 가능 시간이나 쿠폰/혜택을 한 번 더 안내`;
      return {
        instagramKeyword: `${place}${store} ${offer}`,
        naverTopic: `${offer} 안내`,
        instagramText,
        naverText,
        ideaText: weeklyPlan,
      };
    }

    function applyStarterDrafts() {
      const drafts = state.onboardingDrafts;
      if (!drafts) return;
      const captionInput = document.getElementById('ai-caption-keyword');
      const naverInput = document.getElementById('ai-naver-topic');
      const ideaText = document.getElementById('ai-idea-text');
      if (captionInput) captionInput.value = drafts.instagramKeyword;
      if (naverInput) naverInput.value = drafts.naverTopic;
      syncCategoryAcrossUI(state.settings.category || state.category);
      syncToneAcrossUI(state.tone || state.settings.brandTone);
      if (drafts.instagramText) {
        aiCaptionResult = drafts.instagramText;
        const captionText = document.getElementById('ai-caption-text');
        if (captionText) {
          captionText.textContent = drafts.instagramText;
          document.getElementById('ai-caption-result')?.classList.add('show');
        }
      }
      if (drafts.naverText) {
        aiNaverResult = drafts.naverText;
        const naverText = document.getElementById('ai-naver-text');
        if (naverText) {
          naverText.textContent = drafts.naverText;
          document.getElementById('ai-naver-result')?.classList.add('show');
        }
      }
      if (ideaText) {
        aiIdeasResult = drafts.ideaText;
        ideaText.textContent = drafts.ideaText;
        document.getElementById('ai-idea-result')?.classList.add('show');
      }
    }

    function showOnboardingResultModal() {
      const drafts = state.onboardingDrafts;
      if (!drafts) return;
      openModal('첫 마케팅 문안 준비 완료', `
        <p class="onboarding-copy">이제 막막한 첫 화면이 아니라, 바로 복사하거나 저장함에 넣을 수 있는 초안에서 시작해요.</p>
        <div class="onboarding-result-grid">
          ${renderOnboardingResultCard('인스타그램', drafts.instagramText)}
          ${renderOnboardingResultCard('네이버 플레이스', drafts.naverText)}
          ${renderOnboardingResultCard('이번 주 계획', drafts.ideaText)}
        </div>
        <div class="onboarding-note">저장함에 넣으면 Free 저장함 사용량 3개가 차감돼요. 파일럿 고객에게 유료 전환 기준을 보여주기 위한 v0.5 흐름입니다.</div>
        <div class="onboarding-actions">
          <button class="btn btn-secondary" onclick="closeModal(); switchTab('ai'); applyStarterDrafts();">AI에서 수정하기</button>
          <button class="btn btn-primary" onclick="saveStarterDraftsToQueue()">저장함에 넣고 시작</button>
        </div>
      `);
    }

    function renderOnboardingResultCard(title, text) {
      return `
        <article class="onboarding-result-card">
          <div class="onboarding-result-title">${escapeHtml(title)}</div>
          <div class="onboarding-result-text">${escapeHtml(text).replace(/\n/g, '<br>')}</div>
        </article>`;
    }

    function saveStarterDraftsToQueue() {
      const drafts = state.onboardingDrafts;
      if (!drafts) return;
      const items = [
        { channel: '인스타그램', text: drafts.instagramText, source: '3분 온보딩' },
        { channel: '네이버 플레이스', text: drafts.naverText, source: '3분 온보딩' },
        { channel: '주간 계획', text: drafts.ideaText, source: '3분 온보딩' },
      ];
      const saved = items.map(item => saveMarketingDraft({ ...item, silent: true })).filter(Boolean);
      closeModal();
      switchTab('schedule');
      renderDraftQueue();
      renderMarketingKits();
      renderTodayTasks();
      toast(`저장함에 첫 문안 ${saved.length}개를 넣었어요`);
    }

    function renderCalendar() {
      const cal = document.getElementById('cal-grid');
      const monthEl = document.getElementById('cal-month');
      if (!cal) return;
      const y = state.calDate.getFullYear();
      const m = state.calDate.getMonth();
      monthEl.textContent = `${y}년 ${m + 1}월`;
      const first = new Date(y, m, 1).getDay();
      const days = new Date(y, m + 1, 0).getDate();
      const today = new Date();
      const eventDates = state.scheduledPosts.map(p => p.date);
      
      let html = '';
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      dayNames.forEach(d => html += `<div class="cal-day-header">${d}</div>`);
      for (let i = 0; i < first; i++) html += '<div></div>';
      for (let d = 1; d <= days; d++) {
        const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const classes = ['cal-day'];
        if (state.selectedDay === d) classes.push('selected');
        if (today.getFullYear() === y && today.getMonth() === m && today.getDate() === d) classes.push('today');
        if (eventDates.includes(dateStr)) classes.push('has-event');
        html += `<button class="${classes.join(' ')}" onclick="selectDay(${d})">${d}</button>`;
      }
      cal.innerHTML = html;
    }
    function selectDay(d) {
      state.selectedDay = d;
      renderCalendar();
      // 도트가 있는 날 클릭 시 그날 게시물 모달
      const y = state.calDate.getFullYear();
      const m = state.calDate.getMonth() + 1;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayPosts = state.scheduledPosts.filter(p => p.date === dateStr);
      if (dayPosts.length > 0) {
        const html = `
          <div style="font-size: 13px; color: var(--sub); margin-bottom: 16px;">${y}년 ${m}월 ${d}일 · 예약된 게시물 ${dayPosts.length}개</div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${dayPosts.map(p => `
              <div style="background: var(--bg); border-radius: 14px; padding: 14px; position: relative;">
                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 8px;">
                  <span style="background: var(--grad-hero); color: white; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 8px;">⏰ ${p.time}</span>
                  <span style="font-size: 11px; color: var(--sub); font-weight: 500;">예약됨</span>
                </div>
                <div style="font-size: 13px; color: var(--ink); line-height: 1.5; max-height: 60px; overflow: hidden;">${p.caption.replace(/</g, '&lt;')}</div>
                <div style="display: flex; gap: 6px; margin-top: 12px;">
                  <button class="btn btn-secondary" style="flex: 1; justify-content: center; padding: 8px; font-size: 12px;" onclick="editScheduled(${p.id})">✏️ 편집</button>
                  <button class="btn btn-secondary" style="flex: 1; justify-content: center; padding: 8px; font-size: 12px; color: #C53030; border-color: #FCA5A5;" onclick="deleteScheduled(${p.id}); closeModal();">🗑️ 삭제</button>
                </div>
              </div>
            `).join('')}
          </div>
          <button class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 16px;" onclick="closeModal()">확인</button>
        `;
        openModal(`📅 ${m}월 ${d}일`, html);
      }
    }
    
    function editScheduled(id) {
      const post = state.scheduledPosts.find(p => p.id === id);
      if (!post) return;
      closeModal();
      // 폼에 값 채우기
      document.getElementById('schedule-caption').value = post.caption;
      document.getElementById('schedule-time').value = post.time;
      // 시간 디스플레이 동기화
      const [h, mm] = post.time.split(':').map(Number);
      const ampm = h < 12 ? '오전' : '오후';
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      document.getElementById('time-display').textContent = `${ampm} ${h12}:${String(mm).padStart(2, '0')}`;
      // 삭제 후 (편집 = 삭제 + 새로 저장)
      state.scheduledPosts = state.scheduledPosts.filter(p => p.id !== id);
      saveState();
      renderScheduledPosts();
      renderCalendar();
      updateMobilePreview();
      toast('✏️ 편집 모드 — 수정 후 다시 예약해주세요');
      // 폼으로 스크롤
      document.getElementById('schedule-caption').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    function prevMonth() { state.calDate.setMonth(state.calDate.getMonth() - 1); state.selectedDay = null; renderCalendar(); }
    function nextMonth() { state.calDate.setMonth(state.calDate.getMonth() + 1); state.selectedDay = null; renderCalendar(); }
    
    function renderScheduledPosts() {
      const c = document.getElementById('scheduled-posts');
      if (!c) return;
      if (state.scheduledPosts.length === 0) {
        c.innerHTML = `<div style="background: var(--white); border-radius: 16px; padding: 32px; text-align: center; color: var(--sub); font-size: 13px;">아직 예약된 게시물이 없어요</div>`;
        return;
      }
      c.innerHTML = state.scheduledPosts.map(p => {
        const dt = new Date(p.date);
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const d = String(dt.getDate()).padStart(2, '0');
        // [hotfix] XSS 방지 — 캡션 이스케이프 (selectDay 모달과 일관성 통일)
        const safeCaption = p.caption
          .replace(/&/g, '&amp;').replace(/</g, '&lt;')
          .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        return `
          <div class="schedule-row">
            <div class="schedule-date">
              <div class="schedule-date-d">${d}</div>
              <div class="schedule-date-m">${m}월</div>
            </div>
            <div class="schedule-row-info">
              <div class="schedule-row-cap">${safeCaption}</div>
              <div class="schedule-row-meta">⏰ ${p.time}</div>
            </div>
            <button class="schedule-row-delete" onclick="deleteScheduled(${p.id})">🗑️</button>
          </div>`;
      }).join('');
    }
    function deleteScheduled(id) {
      state.scheduledPosts = state.scheduledPosts.filter(p => p.id !== id);
      saveState(); // [hotfix] 삭제 영속화 — 새로고침해도 복원 안 됨
      renderScheduledPosts();
      renderCalendar();
      toast('🗑️ 삭제됐어요');
    }
    function schedulePost() {
      const cap = document.getElementById('schedule-caption').value;
      if (!cap.trim()) { toast('✍️ 캡션을 입력해주세요'); return; }
      if (!state.selectedDay) { toast('📅 날짜를 선택해주세요'); return; }
      if (!tryUseFreeQuota('scheduledPlans')) return;
      const y = state.calDate.getFullYear();
      const m = state.calDate.getMonth() + 1;
      const time = document.getElementById('schedule-time').value;
      state.scheduledPosts.push({
        id: Date.now(),
        date: `${y}-${String(m).padStart(2, '0')}-${String(state.selectedDay).padStart(2, '0')}`,
        time, caption: cap,
      });
      if (state.activeDraftId) {
        const draft = state.weeklyDrafts?.find(d => d.id === state.activeDraftId);
        if (draft) draft.status = 'scheduled';
        state.activeDraftId = null;
      }
      saveState(); // [hotfix] 예약 영속화 — 새로고침해도 유지
      document.getElementById('schedule-caption').value = '';
      renderScheduledPosts();
      renderMarketingKits();
      renderDraftQueue();
      renderCalendar();
      toast('📅 예약 계획을 저장했어요. 실제 자동 발행은 계정 연동 이후 제공됩니다.');
    }
    function previewSchedule(input) {
      if (input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          document.getElementById('schedule-img-preview').innerHTML = `<img src="${e.target.result}" style="width:100%;max-height:120px;object-fit:cover;border-radius:8px;">`;
          document.getElementById('phone-img').innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
        };
        reader.readAsDataURL(input.files[0]);
      }
    }
    function updateMobilePreview() {
      const cap = document.getElementById('schedule-caption').value;
      document.getElementById('phone-caption').textContent = cap || '캡션이 여기에 표시됩니다';
    }

    function ensureDraftQueue() {
      if (!Array.isArray(state.weeklyDrafts)) state.weeklyDrafts = [];
      if (!Array.isArray(state.marketingKits)) state.marketingKits = [];
    }

    function saveMarketingDraft({ channel, text, source = 'AI 도구', status = 'draft', silent = false }) {
      if (!text || !text.trim()) { toast('저장할 문안이 아직 없어요'); return null; }
      if (!tryUseFreeQuota('savedDrafts')) return null;
      ensureDraftQueue();
      const draft = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        channel,
        text: text.trim(),
        source,
        status,
        createdAt: new Date().toISOString(),
      };
      state.weeklyDrafts.unshift(draft);
      saveState();
      renderDraftQueue();
      renderTodayTasks();
      if (!silent) toast('🗂️ 이번 주 문안 저장함에 넣었어요');
      return draft;
    }

    function saveMarketingKitBundle(kit, draftIds = []) {
      if (!kit) return null;
      ensureDraftQueue();
      const bundle = normalizeMarketingKit(kit);
      const item = {
        id: Date.now() + 7,
        title: bundle.title,
        createdAt: new Date().toISOString(),
        instagram: bundle.instagram,
        naver: bundle.naver,
        coupon: bundle.coupon,
        reviewReply: bundle.reviewReply,
        visualDirection: bundle.visualDirection,
        bgmSuggestion: bundle.bgmSuggestion,
        bestTime: bundle.bestTime,
        checklist: bundle.checklist,
        bannerTemplates: bundle.bannerTemplates,
        draftIds,
        status: 'ready',
      };
      state.marketingKits.unshift(item);
      state.marketingKits = state.marketingKits.slice(0, 12);
      saveState();
      renderMarketingKits();
      renderTodayTasks();
      return item;
    }

    function getMarketingKitBundleText(kit) {
      if (!kit) return '';
      const tags = (kit.instagram?.hashtags || []).join(' ');
      const checks = (kit.checklist || []).map(item => `- ${item}`).join('\n');
      const banners = (kit.bannerTemplates || []).map(b => `- ${b.name}: ${b.headline} / ${b.subline} / ${b.cta}`).join('\n');
      return `[딸깍 마케팅 키트]\n${kit.title || '마케팅 키트'}\n\n[인스타그램]\n${kit.instagram?.caption || ''}\n\n${tags}\n\n[네이버 플레이스]\n${kit.naver?.copyText || ''}\n\n[쿠폰 문안]\n${kit.coupon?.title || ''}\n${kit.coupon?.body || ''}\n\n[리뷰 답글]\n${kit.reviewReply || ''}\n\n[배너 문구]\n${banners}\n\n[사진/배너 방향]\n${kit.visualDirection || ''}\n\n[BGM/무드]\n${kit.bgmSuggestion || ''}\n\n[추천 게시 시간]\n${kit.bestTime || ''}\n\n[올리기 전 확인]\n${checks}`;
    }

    function findMarketingKit(id) {
      ensureDraftQueue();
      return state.marketingKits.find(kit => kit.id === id);
    }

    function renderMarketingKits() {
      const c = document.getElementById('marketing-kit-vault');
      if (!c) return;
      ensureDraftQueue();
      renderStorageSummary();
      syncStorageViewUI();
      if (!state.marketingKits.length) {
        c.innerHTML = `
          <div class="kit-vault-empty">
            <strong>아직 저장된 딸깍 키트가 없어요.</strong><br>
            딸깍 만들기에서 키트를 만들고 “둘 다 저장”을 누르면 인스타그램과 네이버 문안이 한 묶음으로 여기에 모입니다.
          </div>`;
        return;
      }
      c.innerHTML = state.marketingKits.slice(0, 4).map(kit => {
        const created = new Date(kit.createdAt || Date.now());
        const dateLabel = `${created.getMonth() + 1}/${created.getDate()}`;
        const checks = (kit.checklist || []).slice(0, 2).map(item => `• ${escapeHtml(item)}`).join('<br>');
        const banners = kit.bannerTemplates || [];
        return `
          <article class="kit-card">
            <div class="kit-card-head">
              <div>
                <span class="kit-badge">⚡ 딸깍 키트</span>
                <div class="kit-title">${escapeHtml(kit.title || '마케팅 키트')}</div>
              </div>
              <span class="kit-date">${dateLabel}</span>
            </div>
            <div class="kit-preview-grid">
              <div class="kit-preview">
                <strong>인스타그램</strong>
                <p>${escapeHtml(kit.instagram?.caption || '')}</p>
              </div>
              <div class="kit-preview">
                <strong>네이버 플레이스</strong>
                <p>${escapeHtml(kit.naver?.copyText || '')}</p>
              </div>
            </div>
            <div class="kit-detail">
              <strong>사진/배너 방향</strong><br>${escapeHtml(kit.visualDirection || '매장 분위기가 잘 보이는 사진을 사용하세요.')}
              <br><br><strong>BGM/시간</strong><br>${escapeHtml(kit.bgmSuggestion || '따뜻한 브이로그 무드가 잘 어울립니다.')} · ${escapeHtml(kit.bestTime || '저녁 7~9시 추천')}
              ${checks ? `<br><br><strong>체크</strong><br>${checks}` : ''}
            </div>
            ${banners.length ? `
              <div class="kit-banner-row">
                ${banners.slice(0, 3).map((banner, idx) => `
                  ${renderBannerPreview(
                    banner,
                    idx,
                    `copyMarketingKitBanner(${kit.id}, ${idx})`,
                    true,
                    `copyMarketingKitBannerPart(${kit.id}, ${idx}, 'headline')`,
                    `copyMarketingKitBannerPart(${kit.id}, ${idx}, 'cta')`
                  )}
                `).join('')}
              </div>` : ''}
            <div class="kit-actions">
              <button class="primary" onclick="copyMarketingKitBundle(${kit.id})">전체 복사</button>
              <button onclick="useMarketingKitInstagram(${kit.id})">인스타 계획</button>
              <button onclick="useMarketingKitNaver(${kit.id})">네이버 복사</button>
              <button onclick="deleteMarketingKitBundle(${kit.id})">삭제</button>
            </div>
          </article>`;
      }).join('');
    }

    function copyMarketingKitBundle(id) {
      const kit = findMarketingKit(id);
      if (!kit) return;
      navigator.clipboard.writeText(getMarketingKitBundleText(kit)).then(() => toast('📋 딸깍 키트 전체를 복사했어요'));
    }

    function copyMarketingKitBanner(id, index) {
      const kit = findMarketingKit(id);
      const banner = kit?.bannerTemplates?.[index];
      if (!banner) return;
      const text = `${banner.headline}\n${banner.subline}\n${banner.cta}`;
      navigator.clipboard.writeText(text).then(() => toast('🖼️ 배너 문구를 복사했어요'));
    }

    function copyMarketingKitBannerPart(id, index, part) {
      const kit = findMarketingKit(id);
      const banner = kit?.bannerTemplates?.[index];
      if (!banner) return;
      copyBannerTemplatePart(banner, part);
    }

    function useMarketingKitInstagram(id) {
      const kit = findMarketingKit(id);
      if (!kit) return;
      const text = `${kit.instagram?.caption || ''}\n\n${(kit.instagram?.hashtags || []).join(' ')}`.trim();
      const scheduleCaption = document.getElementById('schedule-caption');
      if (scheduleCaption) scheduleCaption.value = text;
      updateMobilePreview();
      switchTab('schedule');
      toast('📅 인스타 문안을 예약 계획에 넣었어요');
    }

    function useMarketingKitNaver(id) {
      const kit = findMarketingKit(id);
      if (!kit) return;
      navigator.clipboard.writeText(kit.naver?.copyText || '').then(() => toast('📋 네이버 플레이스 문안을 복사했어요'));
    }

    function deleteMarketingKitBundle(id) {
      ensureDraftQueue();
      state.marketingKits = state.marketingKits.filter(kit => kit.id !== id);
      saveState();
      renderMarketingKits();
      renderTodayTasks();
      toast('딸깍 키트를 삭제했어요');
    }

    function getDraftStatusLabel(status) {
      return {
        draft: '초안',
        copied: '복사함',
        scheduled: '예약됨',
        posted: '게시완료',
      }[status] || '초안';
    }

    function setDraftFilter(filter, btn) {
      state.draftFilter = filter;
      saveState();
      document.querySelectorAll('.draft-filter-chip').forEach(chip => chip.classList.remove('active'));
      if (btn) btn.classList.add('active');
      renderDraftQueue();
    }

    function syncDraftFilterUI() {
      const filter = state.draftFilter || 'all';
      const chips = document.querySelectorAll('.draft-filter-chip');
      chips.forEach(chip => {
        const onClick = chip.getAttribute('onclick') || '';
        chip.classList.toggle('active', onClick.includes(`'${filter}'`));
      });
    }

    function setStorageView(view, btn) {
      state.storageView = view;
      if (view === 'instagram') state.draftFilter = 'instagram';
      if (view === 'naver') state.draftFilter = 'naver';
      if (view === 'local') state.draftFilter = 'local';
      if (view === 'drafts') state.draftFilter = 'all';
      saveState();
      syncStorageViewUI();
      renderMarketingKits();
      renderDraftQueue();
    }

    function syncStorageViewUI() {
      const view = state.storageView || 'all';
      document.querySelectorAll('.storage-tabs button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.storageView === view);
      });
      const kitVault = document.getElementById('marketing-kit-vault');
      const draftFilters = document.getElementById('draft-filter-row');
      const draftQueue = document.getElementById('draft-queue');
      if (kitVault) kitVault.style.display = view === 'drafts' || view === 'instagram' || view === 'naver' || view === 'local' ? 'none' : '';
      if (draftFilters) draftFilters.style.display = view === 'kits' ? 'none' : '';
      if (draftQueue) draftQueue.style.display = view === 'kits' ? 'none' : '';
    }

    function renderStorageSummary() {
      const c = document.getElementById('storage-summary');
      if (!c) return;
      ensureDraftQueue();
      const kitCount = state.marketingKits.length;
      const draftCount = state.weeklyDrafts.length;
      const scheduledCount = state.weeklyDrafts.filter(d => d.status === 'scheduled').length;
      const postedCount = state.weeklyDrafts.filter(d => d.status === 'posted').length;
      c.innerHTML = [
        ['딸깍 키트', kitCount, '인스타·네이버 묶음'],
        ['문안 초안', draftCount, '복사해서 바로 쓰는 글'],
        ['예약 준비', scheduledCount, '캘린더에 올린 문안'],
        ['게시 완료', postedCount, '실행 체크된 문안'],
      ].map(([label, value, desc]) => `
        <div class="storage-summary-card">
          <span>${label}</span>
          <strong>${value}</strong>
          <p>${desc}</p>
        </div>
      `).join('');
    }

    function draftMatchesFilter(draft, filter) {
      const channel = draft.channel || '';
      const status = draft.status || 'draft';
      if (filter === 'all') return true;
      if (filter === 'instagram') return channel.includes('인스타');
      if (filter === 'naver') return channel.includes('네이버');
      if (filter === 'local') return channel.includes('쿠폰') || channel.includes('리뷰');
      if (filter === 'plan') return channel.includes('주간');
      return status === filter;
    }

    function renderDraftQueue() {
      const c = document.getElementById('draft-queue');
      if (!c) return;
      ensureDraftQueue();
      renderStorageSummary();
      syncStorageViewUI();
      syncDraftFilterUI();
      if (state.weeklyDrafts.length === 0) {
        c.innerHTML = `<div class="draft-empty">AI 어시스턴트에서 만든 문안을 저장하면 여기에 모여요. 먼저 예시 문안으로 흐름을 확인해도 좋아요.</div>`;
        return;
      }
      const filter = state.draftFilter || 'all';
      const visibleDrafts = state.weeklyDrafts.filter(d => draftMatchesFilter(d, filter));
      if (visibleDrafts.length === 0) {
        c.innerHTML = `<div class="draft-empty">이 필터에 해당하는 문안이 아직 없어요. 다른 필터를 보거나 AI 어시스턴트에서 새 문안을 만들어보세요.</div>`;
        return;
      }
      c.innerHTML = visibleDrafts.slice(0, 9).map(d => {
        const created = new Date(d.createdAt || Date.now());
        const dateLabel = `${created.getMonth() + 1}/${created.getDate()}`;
        const safeText = escapeHtml(d.text);
        const safeChannel = escapeHtml(d.channel || '인스타그램');
        const safeSource = escapeHtml(d.source || 'AI 도구');
        const status = d.status || 'draft';
        return `
          <article class="draft-card">
            <div class="draft-card-top">
              <span class="draft-channel">${safeChannel}</span>
              <span class="draft-status ${status}">${getDraftStatusLabel(status)}</span>
            </div>
            <div class="draft-text">${safeText}</div>
            <div class="draft-meta">${dateLabel} · ${safeSource}</div>
            <div class="draft-actions">
              <button onclick="copyMarketingDraft(${d.id})">복사</button>
              <button onclick="useDraftInSchedule(${d.id})">예약에 넣기</button>
              <button onclick="markDraftStatus(${d.id}, 'posted')">게시완료</button>
              <button onclick="deleteMarketingDraft(${d.id})">삭제</button>
            </div>
          </article>`;
      }).join('');
    }

    function copyMarketingDraft(id) {
      ensureDraftQueue();
      const draft = state.weeklyDrafts.find(d => d.id === id);
      if (!draft) return;
      navigator.clipboard.writeText(draft.text).then(() => {
        markDraftStatus(id, 'copied', false);
        toast('📋 문안을 복사했어요');
      });
    }

    function useDraftInSchedule(id) {
      ensureDraftQueue();
      const draft = state.weeklyDrafts.find(d => d.id === id);
      if (!draft) return;
      const scheduleCaption = document.getElementById('schedule-caption');
      if (scheduleCaption) scheduleCaption.value = draft.text;
      state.activeDraftId = id;
      markDraftStatus(id, 'scheduled', false);
      updateMobilePreview();
      switchTab('schedule');
      toast('📅 예약 계획에 문안을 넣었어요');
    }

    function markDraftStatus(id, status, showToast = true) {
      ensureDraftQueue();
      const draft = state.weeklyDrafts.find(d => d.id === id);
      if (!draft) return;
      draft.status = status;
      saveState();
      renderDraftQueue();
      renderMarketingKits();
      renderTodayTasks();
      if (showToast) toast(`상태를 ${getDraftStatusLabel(status)}으로 바꿨어요`);
    }

    function deleteMarketingDraft(id) {
      ensureDraftQueue();
      state.weeklyDrafts = state.weeklyDrafts.filter(d => d.id !== id);
      if (state.activeDraftId === id) state.activeDraftId = null;
      saveState();
      renderDraftQueue();
      renderMarketingKits();
      renderTodayTasks();
      toast('문안을 삭제했어요');
    }

    function seedWeeklyDrafts() {
      ensureDraftQueue();
      const store = state.settings.storeName || '우리 매장';
      const offer = state.settings.mainOffer || '이번 주 대표 상품';
      const region = state.settings.region ? `${state.settings.region} ` : '';
      const samples = [
        { channel: '인스타그램', source: 'v0.4 예시', text: `${region}${store}의 이번 주 소식입니다.\n${offer}를 처음 오시는 분도 편하게 경험하실 수 있도록 준비했어요.\n\n#소상공인 #동네가게 #오늘의소식` },
        { channel: '네이버 플레이스', source: 'v0.4 예시', text: `📢 ${store} 소식\n\n${offer} 안내드립니다. 궁금한 점은 네이버 톡톡 또는 전화로 편하게 문의해주세요.` },
        { channel: '리뷰 답글', source: 'v0.4 예시', text: `소중한 리뷰 감사합니다. 방문해주신 시간이 좋은 기억으로 남았다니 큰 힘이 됩니다. 다음에도 더 따뜻하게 맞이하겠습니다.` },
      ];
      state.weeklyDrafts = [...samples.map((d, i) => ({ id: Date.now() + i, status: 'draft', createdAt: new Date().toISOString(), ...d })), ...state.weeklyDrafts];
      saveState();
      renderDraftQueue();
      renderMarketingKits();
      renderTodayTasks();
      toast('✨ 예시 문안을 저장함에 채웠어요');
    }

    function renderTodayTasks() {
      const list = document.getElementById('today-task-list');
      const count = document.getElementById('today-task-count');
      if (!list) return;
      ensureDraftQueue();
      const drafts = state.weeklyDrafts || [];
      const kitCount = state.marketingKits?.length || 0;
      const draftCount = drafts.filter(d => (d.status || 'draft') === 'draft').length;
      const copiedCount = drafts.filter(d => d.status === 'copied').length;
      const scheduledCount = state.scheduledPosts?.length || 0;
      const tasks = [
        {
          kicker: '1순위',
          title: kitCount ? `딸깍 키트 ${kitCount}개 실행` : (draftCount ? `저장된 초안 ${draftCount}개 확인` : '오늘 쓸 문안 만들기'),
          desc: kitCount ? '인스타와 네이버 문안을 묶음으로 열어 복사하거나 예약 계획에 넣어보세요.' : (draftCount ? '초안을 복사하거나 예약 계획에 넣어 이번 주 흐름을 이어가세요.' : 'AI 어시스턴트에서 인스타/네이버 문안을 하나 만들어보세요.'),
          action: (draftCount || kitCount) ? '저장함 보기' : 'AI로 만들기',
          tab: (draftCount || kitCount) ? 'schedule' : 'ai',
        },
        {
          kicker: '게시 준비',
          title: copiedCount ? `복사한 문안 ${copiedCount}개 게시 확인` : '네이버 플레이스 소식 1개 준비',
          desc: copiedCount ? '복사 후 실제 게시까지 끝났다면 게시완료로 바꿔주세요.' : '자동 발행 전까지는 복사해서 바로 쓰는 흐름이 핵심이에요.',
          action: copiedCount ? '상태 정리' : '문안 만들기',
          tab: copiedCount ? 'schedule' : 'ai',
        },
        {
          kicker: '캘린더',
          title: scheduledCount ? `예약 계획 ${scheduledCount}건 점검` : '이번 주 예약 계획 비어 있음',
          desc: scheduledCount ? '예약된 문안과 날짜가 이번 주 홍보 흐름에 맞는지 확인하세요.' : '저장한 문안을 날짜에 넣으면 실행률이 올라가요.',
          action: '캘린더 보기',
          tab: 'schedule',
        },
      ];
      list.innerHTML = tasks.map(task => `
        <article class="today-task">
          <div class="today-task-kicker">${task.kicker}</div>
          <div class="today-task-title">${task.title}</div>
          <div class="today-task-desc">${task.desc}</div>
          <button onclick="switchTab('${task.tab}')">${task.action}</button>
        </article>`).join('');
      if (count) count.textContent = `${draftCount + copiedCount + scheduledCount + kitCount}개 대기`;
    }
    
    // ===== ANALYTICS =====
    let weeklyChart, dailyChart;
    function initCharts() {
      const wc = document.getElementById('chart-weekly');
      const dc = document.getElementById('chart-daily');
      if (!wc || !dc) return;
      if (weeklyChart) weeklyChart.destroy();
      if (dailyChart) dailyChart.destroy();
      
      // 기간별 데이터
      const datasets = {
        '7d': {
          labels: ['월', '화', '수', '목', '금', '토', '일'],
          likes: [120, 180, 250, 220, 380, 420, 290],
          comments: [12, 18, 28, 22, 38, 52, 32],
          posts: [3, 2, 4, 2, 5, 6, 3],
        },
        '30d': {
          labels: Array.from({length: 4}, (_, i) => `${i+1}주차`),
          likes: [1200, 1450, 1820, 2100],
          comments: [98, 132, 168, 215],
          posts: [12, 14, 16, 18],
        },
        '90d': {
          labels: ['1월', '2월', '3월'],
          likes: [4200, 5800, 8450],
          comments: [380, 520, 760],
          posts: [42, 56, 68],
        },
      };
      const d = datasets[state.analyticsRange] || datasets['7d'];
      
      const ctx1 = wc.getContext('2d');
      const grad = ctx1.createLinearGradient(0, 0, 0, 240);
      grad.addColorStop(0, 'rgba(181,167,255,.4)');
      grad.addColorStop(1, 'rgba(255,181,216,0)');
      
      weeklyChart = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: d.labels,
          datasets: [
            { label: '좋아요', data: d.likes, borderColor: '#B5A7FF', borderWidth: 3, backgroundColor: grad, tension: 0.4, fill: true, pointBackgroundColor: '#FFB5D8', pointBorderColor: 'white', pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7 },
            { label: '댓글', data: d.comments, borderColor: '#FFB5D8', borderWidth: 3, tension: 0.4, fill: false, pointBackgroundColor: 'white', pointBorderColor: '#FFB5D8', pointBorderWidth: 2, pointRadius: 4 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: true, position: 'top', labels: { font: { family: 'Pretendard, sans-serif', size: 12 }, padding: 16, usePointStyle: true } } },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { family: 'Pretendard, sans-serif' } } },
            x: { grid: { display: false }, ticks: { font: { family: 'Pretendard, sans-serif' } } },
          },
        },
      });
      
      dailyChart = new Chart(dc.getContext('2d'), {
        type: 'bar',
        data: {
          labels: d.labels,
          datasets: [{
            label: '게시물 수',
            data: d.posts,
            backgroundColor: ['#FFB5D8', '#FFB89E', '#FFF2BE', '#C8F2D9', '#D4C9FF', '#B5A7FF', '#FFB5D8'].slice(0, d.labels.length),
            borderRadius: 10, borderSkipped: false,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { family: 'Pretendard, sans-serif' } } },
            x: { grid: { display: false }, ticks: { font: { family: 'Pretendard, sans-serif' } } },
          },
        },
      });
    }
    
    // ===== SETTINGS =====
    function setTheme(el, name) {
      document.querySelectorAll('.theme-swatch').forEach(s => s.classList.remove('active'));
      el.classList.add('active');
      state.currentTheme = name;
      applyTheme(name);
      saveState();
      const themeNames = { bloom: 'Bloom', sunset: 'Sunset', dreamy: 'Dreamy', spring: 'Spring', mint: 'Mint', dark: 'Midnight' };
      toast(`🎨 ${themeNames[name] || name} 테마 적용`);
    }
    function applyTheme(name) {
      const themes = {
        bloom:   { hero: 'linear-gradient(135deg, #FFB5D8 0%, #B5A7FF 100%)', rainbow: 'linear-gradient(135deg, #D4C9FF 0%, #FFB5D8 60%, #FFB89E 100%)' },
        sunset:  { hero: 'linear-gradient(135deg, #FFB5D8 0%, #FFB89E 100%)', rainbow: 'linear-gradient(135deg, #FFB89E 0%, #FFB5D8 60%, #FFF2BE 100%)' },
        dreamy:  { hero: 'linear-gradient(135deg, #B5A7FF 0%, #D4C9FF 100%)', rainbow: 'linear-gradient(135deg, #B5A7FF 0%, #D4C9FF 60%, #FFB5D8 100%)' },
        spring:  { hero: 'linear-gradient(135deg, #C8F2D9 0%, #FFF2BE 100%)', rainbow: 'linear-gradient(135deg, #C8F2D9 0%, #FFF2BE 60%, #FFB89E 100%)' },
        mint:    { hero: 'linear-gradient(135deg, #B5A7FF 0%, #C8F2D9 100%)', rainbow: 'linear-gradient(135deg, #B5A7FF 0%, #C8F2D9 60%, #FFF2BE 100%)' },
        dark:    { hero: 'linear-gradient(135deg, #1A1A2E 0%, #463272 100%)', rainbow: 'linear-gradient(135deg, #463272 0%, #1A1A2E 100%)' },
      };
      const t = themes[name] || themes.bloom;
      document.documentElement.style.setProperty('--grad-hero', t.hero);
      document.documentElement.style.setProperty('--grad-rainbow', t.rainbow);
      // v2.3: data-theme 속성으로 테마별 다크모드 변수 적용
      document.documentElement.dataset.theme = name;
    }
    // ================================================================
    // v2.3 — 다크 모드
    // ================================================================
    function toggleDarkMode() {
      state.darkMode = !state.darkMode;
      applyDarkMode(state.darkMode);
      saveState();
      toast(state.darkMode ? '🌙 다크 모드 켜짐' : '☀️ 라이트 모드로 전환');
    }
    function applyDarkMode(isDark) {
      if (isDark) {
        document.documentElement.setAttribute('data-dark', '');
      } else {
        document.documentElement.removeAttribute('data-dark');
      }
      const icon  = document.getElementById('dark-icon');
      const label = document.getElementById('dark-label');
      if (icon)  icon.textContent  = isDark ? '☀️' : '🌙';
      if (label) label.textContent = isDark ? '라이트 모드' : '다크 모드';
    }

    // ================================================================
    // v2.3 — 키보드 단축키 모달
    // ================================================================
    function showKeyboardShortcuts() {
      const rows = [
        [['G','H'], '홈'],
        [['G','I'], '딸깍 만들기'],
        [['G','S'], '저장함'],
        [['G','E'], '내 매장'],
        [['G','P'], '인스타 단품'],
        [['G','A'], '성과 분석'],
        [['G','T'], '해시태그 분석'],
        [['⌘','K'], '검색'],
        [['⌘','D'], '다크 모드 전환'],
        [['?'],      '단축키 도움말'],
        [['Esc'],    '검색 / 모달 닫기'],
      ];
      const html = `
        <div class="kbd-grid">
          ${rows.map(([keys, desc], i) => `
            <div class="kbd-row">${keys.map(k => `<span class="kbd-key">${k}</span>`).join('')}</div>
            <div class="kbd-desc">${desc}</div>
            ${i === 6 ? '<div class="kbd-sep"></div><div class="kbd-sep"></div>' : ''}
          `).join('')}
        </div>`;
      openModal('⌨️ 키보드 단축키', html);
    }

    function saveSettings() {
      applySettingsForm();
      saveState();
      toast('💾 설정이 저장됐어요');
    }
    function scrollToSettings(id, el) {
      document.querySelectorAll('.settings-nav-item').forEach(n => n.classList.remove('active'));
      el.classList.add('active');
      const target = document.getElementById('settings-' + id);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // ===== TIME PICKER =====
    function selectTime(time, el) {
      document.getElementById('schedule-time').value = time;
      const [h, m] = time.split(':').map(Number);
      const ampm = h < 12 ? '오전' : '오후';
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      document.getElementById('time-display').textContent = `${ampm} ${h12}:${String(m).padStart(2, '0')}`;
      // 모든 칩 deselect 후 클릭한 칩만 selected
      document.querySelectorAll('.time-chip-ai, .time-chip-quick').forEach(c => c.classList.remove('selected'));
      el.classList.add('selected');
      // 직접 설정 select도 동기화
      document.getElementById('time-ampm').value = h < 12 ? 'AM' : 'PM';
      document.getElementById('time-hour').value = h12;
      document.getElementById('time-min').value = String(m).padStart(2, '0');
    }
    function updateCustomTime() {
      const ampm = document.getElementById('time-ampm').value;
      const hour = +document.getElementById('time-hour').value;
      const min = document.getElementById('time-min').value;
      let h24 = hour;
      if (ampm === 'AM' && hour === 12) h24 = 0;
      else if (ampm === 'PM' && hour !== 12) h24 = hour + 12;
      const time = `${String(h24).padStart(2, '0')}:${min}`;
      document.getElementById('schedule-time').value = time;
      document.getElementById('time-display').textContent = `${ampm === 'AM' ? '오전' : '오후'} ${hour}:${min}`;
      document.querySelectorAll('.time-chip-ai, .time-chip-quick').forEach(c => c.classList.remove('selected'));
    }
    
    // ===== MODAL =====
    function openModal(title, body) {
      document.getElementById('modal-title').textContent = title;
      document.getElementById('modal-body').innerHTML = body;
      document.getElementById('modal').classList.add('show');
    }
    function closeModal() { document.getElementById('modal').classList.remove('show'); }
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    function ensurePilotFeedback() {
      if (!Array.isArray(state.pilotFeedback)) state.pilotFeedback = [];
    }

    function showPilotFeedbackModal() {
      ensurePilotFeedback();
      const store = escapeHtml(state.settings.storeName || '');
      const category = escapeHtml(state.settings.category || state.category || '');
      openModal('🧪 파일럿 신청/피드백', `
        <div class="feedback-form">
          <div class="feedback-grid">
            <label class="feedback-field">
              <span class="feedback-label">매장명</span>
              <input class="feedback-input" id="pilot-store" value="${store}" placeholder="예: 우리동네 카페">
            </label>
            <label class="feedback-field">
              <span class="feedback-label">업종</span>
              <input class="feedback-input" id="pilot-category" value="${category}" placeholder="예: 카페, 미용실, 공방">
            </label>
          </div>
          <label class="feedback-field">
            <span class="feedback-label">가장 필요한 기능</span>
            <select class="feedback-input" id="pilot-need">
              <option>인스타그램 게시글 만들기</option>
              <option>네이버 플레이스 소식 만들기</option>
              <option>리뷰 답글 만들기</option>
              <option>이번 주 마케팅 계획</option>
              <option>자동 발행/예약 연동</option>
              <option>가격이 저렴한 대행 대체</option>
            </select>
          </label>
          <label class="feedback-field">
            <span class="feedback-label">월 9,900원이라면?</span>
            <select class="feedback-input" id="pilot-price">
              <option>써보고 괜찮으면 결제 가능</option>
              <option>무료 체험 후 판단하고 싶음</option>
              <option>조금 부담됨</option>
              <option>필요 기능만 확실하면 저렴함</option>
            </select>
          </label>
          <label class="feedback-field">
            <span class="feedback-label">남기고 싶은 말</span>
            <textarea class="feedback-input" id="pilot-note" rows="4" placeholder="예: 네이버 리뷰 답글이 제일 필요해요. 음식점 예시가 많으면 좋겠어요."></textarea>
          </label>
          <div class="feedback-actions">
            <button class="btn btn-secondary" style="flex:1; justify-content:center;" onclick="copyPilotInviteText()">소개 문구 복사</button>
            <button class="btn btn-primary" style="flex:1; justify-content:center;" onclick="submitPilotFeedback()">피드백 저장</button>
          </div>
        </div>`);
    }

    function submitPilotFeedback() {
      ensurePilotFeedback();
      const item = {
        id: Date.now(),
        store: document.getElementById('pilot-store')?.value.trim() || state.settings.storeName || '이름 없음',
        category: document.getElementById('pilot-category')?.value.trim() || state.settings.category || state.category,
        need: document.getElementById('pilot-need')?.value || '',
        price: document.getElementById('pilot-price')?.value || '',
        note: document.getElementById('pilot-note')?.value.trim() || '',
        createdAt: new Date().toISOString(),
      };
      state.pilotFeedback.unshift(item);
      state.pilotFeedback = state.pilotFeedback.slice(0, 30);
      saveState();
      renderPilotFeedbackPanel();
      closeModal();
      toast('💬 파일럿 피드백을 저장했어요. 다음 개선에 반영할게요.');
    }

    function renderPilotFeedbackPanel() {
      const panel = document.getElementById('pilot-feedback-panel');
      if (!panel) return;
      ensurePilotFeedback();
      const items = state.pilotFeedback || [];
      if (!items.length) {
        panel.innerHTML = `
          <div class="pilot-feedback-head">
            <strong>파일럿 피드백 기록</strong>
            <span>0개</span>
          </div>
          <div class="pilot-feedback-empty">아직 저장된 피드백이 없어요. 파일럿 상담이나 데모 중 받은 의견을 여기에 빠르게 남겨둘 수 있습니다.</div>`;
        return;
      }
      panel.innerHTML = `
        <div class="pilot-feedback-head">
          <strong>파일럿 피드백 기록</strong>
          <span>${items.length}개</span>
        </div>
        <div class="pilot-feedback-list">
          ${items.slice(0, 3).map(item => `
            <article class="pilot-feedback-item">
              <strong>${escapeHtml(item.store)} · ${escapeHtml(item.category)}</strong>
              <p>필요 기능: ${escapeHtml(item.need)}</p>
              <p>가격 반응: ${escapeHtml(item.price)}</p>
              ${item.note ? `<p>${escapeHtml(item.note)}</p>` : ''}
            </article>
          `).join('')}
        </div>`;
    }
    
    // ===== POST/STORY CLICKS =====
    function openStoryDetail(label) {
      openModal(`🌸 ${label}`, `
        <div style="text-align: center; padding: 20px 0;">
          <div style="width: 120px; height: 120px; border-radius: 50%; background: var(--grad-rainbow); margin: 0 auto 16px;"></div>
          <p style="color: var(--sub); font-size: 13px; line-height: 1.6;">스토리 상세 보기는 곧 오픈됩니다.<br>현재는 미리보기 모드예요.</p>
          <button class="btn btn-primary" style="margin-top: 20px;" onclick="closeModal()">확인</button>
        </div>`);
    }
    function openPostDetail(title, stats) {
      openModal(`📷 ${title}`, `
        <div style="background: var(--grad-rainbow); aspect-ratio: 1; border-radius: 16px; margin-bottom: 16px;"></div>
        <div style="font-size: 14px; line-height: 1.6; color: var(--ink); margin-bottom: 12px;">${title}</div>
        <div style="display: flex; gap: 16px; color: var(--sub); font-size: 13px; font-weight: 500;">
          <span>${stats}</span>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 20px;">
          <button class="btn btn-secondary" style="flex: 1; justify-content: center;" onclick="closeModal()">닫기</button>
          <button class="btn btn-primary" style="flex: 1; justify-content: center;" onclick="closeModal(); switchTab('analytics');">📊 분석 보기</button>
        </div>
      `);
    }
    
    // ===== NOTIFICATION / WORKSPACE / USER MENU =====
    function showNotifications() {
      openModal('🔔 알림', `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="background: var(--bg); border-radius: 14px; padding: 14px; display: flex; gap: 12px;">
            <span style="font-size: 22px;">🎉</span>
            <div style="flex: 1;">
              <div style="font-size: 13px; font-weight: 600;">새 팔로워 +12명</div>
              <div style="font-size: 11px; color: var(--sub); margin-top: 2px;">최근 1시간</div>
            </div>
          </div>
          <div style="background: var(--bg); border-radius: 14px; padding: 14px; display: flex; gap: 12px;">
            <span style="font-size: 22px;">📅</span>
            <div style="flex: 1;">
              <div style="font-size: 13px; font-weight: 600;">예약 계획 시간이 30분 남았어요</div>
              <div style="font-size: 11px; color: var(--sub); margin-top: 2px;">오후 8시 직접 게시 예정</div>
            </div>
          </div>
          <div style="background: var(--bg); border-radius: 14px; padding: 14px; display: flex; gap: 12px;">
            <span style="font-size: 22px;">💬</span>
            <div style="flex: 1;">
              <div style="font-size: 13px; font-weight: 600;">댓글 5개가 새로 달렸어요</div>
              <div style="font-size: 11px; color: var(--sub); margin-top: 2px;">오늘 오전 9시</div>
            </div>
          </div>
        </div>`);
    }
    function showUserMenu() {
      openModal('👤 계정', `
        <div style="text-align: center; padding: 16px 0;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--grad-sunset); display: grid; place-items: center; color: white; font-size: 32px; font-weight: 800; margin: 0 auto 12px;">민</div>
          <div style="font-size: 18px; font-weight: 700;">민지</div>
          <div style="font-size: 12px; color: var(--sub); margin-top: 4px;">파일럿 매장 · Bloom Free 🌱</div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px;">
          <button class="dropdown-item" onclick="closeModal(); switchTab('settings');">⚙️ 설정으로 이동</button>
          <button class="dropdown-item" onclick="upgradeProMenu()">🌟 Bloom Pro 업그레이드</button>
          <button class="dropdown-item" onclick="closeModal(); showKeyboardShortcuts()">📖 도움말 · 단축키</button>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item danger" onclick="logout()">🚪 로그아웃</button>
        </div>`);
    }
    function showWorkspaceMenu() {
      openModal('🏢 워크스페이스', `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button class="dropdown-item" style="background: var(--bg); padding: 14px;">
            <span style="font-size: 22px;">🌸</span>
            <div style="text-align: left;">
              <div style="font-weight: 700;">민지님 워크스페이스</div>
              <div style="font-size: 11px; color: var(--sub); margin-top: 2px;">현재 사용 중 · Free</div>
            </div>
            <span style="margin-left: auto; color: var(--purple);">✓</span>
          </button>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item" onclick="closeModal(); toast('🏢 새 워크스페이스 (준비 중)')">+ 새 워크스페이스 만들기</button>
          <button class="dropdown-item" onclick="closeModal(); toast('🔄 워크스페이스 초대 받기 (준비 중)')">📨 초대 받은 워크스페이스 합류</button>
        </div>`);
    }
    function upgradeProMenu() {
      openModal('🌟 Bloom Pro', `
        <div style="background: var(--grad-rainbow); border-radius: 16px; padding: 20px; color: white; margin-bottom: 16px;">
          <div style="font-size: 14px; opacity: .9; font-weight: 700;">PILOT PACKAGE</div>
          <div style="font-size: 28px; font-weight: 800; letter-spacing: -0.5px; margin: 4px 0;">월 9,900원</div>
          <div style="font-size: 12px; opacity: .9;">인스타 + 네이버 플레이스 문안을 매주 바로 쓰게 정리</div>
        </div>
        <div class="plan-compare">
          <div>
            <strong>Bloom Free</strong>
            <span>AI 생성 월 30회</span>
            <span>저장함 20개</span>
            <span>예약 계획 10개</span>
            <span>데모/파일럿 체험용</span>
          </div>
          <div>
            <strong>Bloom Pro</strong>
            <span>AI 생성 무제한</span>
            <span>저장함·예약 계획 무제한</span>
            <span>주간 마케팅 플랜</span>
            <span>파일럿 우선 피드백 반영</span>
          </div>
        </div>
        <p style="font-size: 12px; color: var(--sub); line-height: 1.6; margin: 14px 0 0;">
          결제 연동 전까지는 실제 과금 버튼이 아니라, 파일럿 고객이 가격과 기능 구성을 이해하는지 검증하는 화면이에요.
        </p>
        <button class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 16px;" onclick="closeModal(); toast('💳 결제 연동 전 파일럿 신청으로 기록할 예정이에요')">Pro 파일럿 신청</button>`);
    }
    function logout() {
      if (confirm('정말 로그아웃 하시겠어요?')) {
        toast('🚪 로그아웃됐어요 (모의)');
        closeModal();
      }
    }
    function deleteAccount() {
      if (confirm('정말 계정을 삭제하시겠어요?\n모든 데이터가 사라지고 복구할 수 없어요.')) {
        if (confirm('한 번 더 확인할게요. 정말 진행할까요?')) {
          localStorage.removeItem(STORAGE_KEY);
          toast('🗑️ 모든 데이터가 삭제됐어요');
          setTimeout(() => location.reload(), 1500);
        }
      }
    }
    
    // ===== SEARCH =====
    function handleSearch(e) {
      const q = e.target.value.trim().toLowerCase();
      const dropdown = document.getElementById('search-dropdown');
      const searchBar = document.getElementById('search-bar');
      if (!dropdown) return;

      if (!q) {
        dropdown.classList.remove('open');
        searchBar?.classList.remove('focused');
        return;
      }
      searchBar?.classList.add('focused');

      const highlight = (text) => text.replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi'), m => `<span class="search-highlight">${m}</span>`);

      const matchTabs = SEARCH_TABS.filter(t => t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q));
      const matchFeatures = SEARCH_FEATURES.filter(f => f.name.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q));
      const matchPosts = state.scheduledPosts.filter(p => p.caption.toLowerCase().includes(q)).slice(0, 3);

      let html = '';
      if (matchTabs.length) {
        html += `<div class="search-section-label">📂 페이지</div>`;
        matchTabs.forEach(t => {
          html += `<div class="search-item" onclick="switchTab('${t.tab}');closeSearch();">
            <span class="search-item-icon">${t.icon}</span>
            <div class="search-item-info">
              <div class="search-item-title">${highlight(t.name)}</div>
              <div class="search-item-sub">${highlight(t.desc)}</div>
            </div>
            <span class="search-item-tag">페이지</span>
          </div>`;
        });
      }
      if (matchFeatures.length) {
        html += `<div class="search-section-label">⚡ 기능</div>`;
        matchFeatures.forEach(f => {
          html += `<div class="search-item" onclick="switchTab('${f.tab}');closeSearch();">
            <span class="search-item-icon">${f.icon}</span>
            <div class="search-item-info">
              <div class="search-item-title">${highlight(f.name)}</div>
              <div class="search-item-sub">${highlight(f.desc)}</div>
            </div>
            <span class="search-item-tag">기능</span>
          </div>`;
        });
      }
      if (matchPosts.length) {
        html += `<div class="search-section-label">📅 예약 게시물</div>`;
        matchPosts.forEach(p => {
          const preview = p.caption.substring(0, 60);
          html += `<div class="search-item" onclick="switchTab('schedule');closeSearch();">
            <span class="search-item-icon">📝</span>
            <div class="search-item-info">
              <div class="search-item-title">${p.date} ${p.time}</div>
              <div class="search-item-sub">${highlight(preview)}...</div>
            </div>
            <span class="search-item-tag">예약</span>
          </div>`;
        });
      }
      if (!html) {
        html = `<div class="search-empty">🔍 "<strong>${q}</strong>"에 대한 결과가 없어요</div>`;
      }

      dropdown.innerHTML = html;
      dropdown.classList.add('open');

      // Enter → 첫 번째 결과 클릭
      if (e.key === 'Enter') {
        const first = dropdown.querySelector('.search-item');
        if (first) first.click();
      }
    }

    function closeSearch() {
      const dropdown = document.getElementById('search-dropdown');
      const searchInput = document.getElementById('search-input');
      const searchBar = document.getElementById('search-bar');
      dropdown?.classList.remove('open');
      searchBar?.classList.remove('focused');
      if (searchInput) searchInput.value = '';
    }
    
    // ===== ANALYTICS PERIOD TABS =====
    function setAnalyticsRange(range, el) {
      state.analyticsRange = range;
      el.parentElement.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
      el.classList.add('active');
      initCharts();
      toast(`📊 ${el.textContent} 데이터로 전환`);
    }

    // ===== AI ASSISTANT PAGE =====
    let aiCaptionResult = '';
    let aiHashtagResult = [];
    let aiIdeasResult = '';
    let aiNaverResult = '';
    let aiNaverPackage = null;
    let aiMarketingKit = null;
    let aiTimeResult = '';

    function switchAIMode(mode, el) {
      document.querySelectorAll('.ai-mode-tab').forEach(t => t.classList.remove('active'));
      el.classList.add('active');
      document.getElementById('ai-mode-tools').style.display = mode === 'tools' ? '' : 'none';
      document.getElementById('ai-mode-chat').style.display = mode === 'chat' ? '' : 'none';
    }

    function setAIBtnLoading(btnId, loading, defaultText) {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      btn.classList.toggle('loading', loading);
      btn.textContent = loading ? '⏳ 생성 중...' : defaultText;
    }

    function applyStudioIdea(text) {
      const input = document.getElementById('studio-topic');
      if (!input) return;
      input.value = text;
      input.focus();
      updateStudioAutoType();
      toast('주제를 넣었어요. 분위기만 고르면 바로 만들 수 있어요.');
    }

    const STUDIO_PILOT_SCENARIOS = {
      eunbit: {
        classIntro: {
          topic: '의정부 은빛캘리 6월 캘리그래피 원데이 클래스 모집',
          period: '6월 매주 토요일, 선착순 6명',
          benefit: '첫 수업 재료비 포함 안내',
          contact: '네이버 톡톡 또는 전화 예약',
          mood: '따뜻한',
          naverType: '소식',
        },
        firstCoupon: {
          topic: '은빛캘리 첫 방문 고객 캘리그래피 체험 쿠폰 안내',
          period: '이번 주 금요일까지',
          benefit: '첫 방문 10% 쿠폰',
          contact: '네이버 플레이스 쿠폰 확인 후 예약',
          mood: '정보형',
          naverType: '쿠폰',
        },
        reviewTrust: {
          topic: '수강생 후기와 작업 과정을 활용한 은빛캘리 신뢰 콘텐츠',
          period: '이번 주 게시용',
          benefit: '실제 수강 후기 중심',
          contact: '네이버 톡톡 문의',
          mood: '감성적',
          naverType: '리뷰답글',
        },
        weeklyPlan: {
          topic: '은빛캘리 이번 주 인스타그램과 네이버 플레이스 운영 계획',
          period: '이번 주 월요일부터 일요일까지',
          benefit: '클래스 모집, 후기 공유, 쿠폰 재공지',
          contact: '네이버 플레이스 예약',
          mood: '트렌디한',
          naverType: '주간계획',
        },
      },
    };

    function getStudioScenarioMode() {
      return document.querySelector('.studio-scenario-mode button.active')?.dataset.studioScenarioMode || 'eunbit';
    }

    function setStudioScenarioMode(mode, el) {
      document.querySelectorAll('[data-studio-scenario-mode]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.studioScenarioMode === mode);
      });
      if (el) el.classList.add('active');
      const status = document.getElementById('studio-scenario-status');
      if (status) {
        const basics = getGenericScenarioBasics();
        status.textContent = mode === 'generic'
          ? `다른 업종 기준이에요. ${basics.fallbackNote} 매장명, 대표 상품, 지역을 사용해 필드를 채워요.`
          : '기본은 은빛캘리 샘플이에요. 다른 업종은 내 매장 정보가 비어 있으면 우리 매장/대표 서비스/우리 동네로 안전하게 채워요.';
      }
    }

    function getGenericScenarioBasics() {
      const clean = (value) => String(value || '').trim();
      const missing = [];
      const store = clean(state.settings.storeName) || '우리 매장';
      const offer = clean(state.settings.mainOffer) || '대표 서비스';
      const region = clean(state.settings.region) || '우리 동네';
      if (!clean(state.settings.storeName)) missing.push('매장명');
      if (!clean(state.settings.mainOffer)) missing.push('대표 상품');
      if (!clean(state.settings.region)) missing.push('지역');
      return {
        store,
        offer,
        region,
        missing,
        fallbackNote: missing.length
          ? `${missing.join(', ')}이 비어 있어 기본값을 사용해요.`
          : '내 매장 정보가 모두 들어 있어요.',
      };
    }

    function buildGenericStudioScenario(key) {
      const { store, offer, region } = getGenericScenarioBasics();
      return {
        classIntro: {
          topic: `${region} ${store} ${offer} 예약/체험 안내`,
          period: '이번 달 운영 일정에 맞춰',
          benefit: `${offer} 핵심 장점 안내`,
          contact: '네이버 플레이스 문의 또는 예약',
          mood: '따뜻한',
          naverType: '소식',
        },
        firstCoupon: {
          topic: `${store} 첫 방문 고객 혜택 안내`,
          period: '이번 주까지',
          benefit: '첫 방문 혜택 또는 상담 혜택',
          contact: '네이버 플레이스 쿠폰 확인 후 문의',
          mood: '정보형',
          naverType: '쿠폰',
        },
        reviewTrust: {
          topic: `${store} 고객 후기와 이용 과정을 활용한 신뢰 콘텐츠`,
          period: '이번 주 게시용',
          benefit: '실제 고객 후기 중심',
          contact: '네이버 톡톡 또는 전화 문의',
          mood: '감성적',
          naverType: '리뷰답글',
        },
        weeklyPlan: {
          topic: `${store} 이번 주 인스타그램과 네이버 플레이스 운영 계획`,
          period: '이번 주 월요일부터 일요일까지',
          benefit: `${offer} 소개, 후기 공유, 혜택 재공지`,
          contact: '네이버 플레이스 문의/예약',
          mood: '트렌디한',
          naverType: '주간계획',
        },
      }[key];
    }

    function getStudioScenario(key) {
      const mode = getStudioScenarioMode();
      return mode === 'generic'
        ? buildGenericStudioScenario(key)
        : STUDIO_PILOT_SCENARIOS.eunbit[key];
    }

    function applyStudioScenario(key) {
      const scenario = getStudioScenario(key);
      if (!scenario) return;
      const topic = document.getElementById('studio-topic');
      const period = document.getElementById('studio-period');
      const benefit = document.getElementById('studio-benefit');
      const contact = document.getElementById('studio-contact');
      const type = document.getElementById('studio-naver-type');
      if (topic) topic.value = scenario.topic;
      if (period) period.value = scenario.period;
      if (benefit) benefit.value = scenario.benefit;
      if (contact) contact.value = scenario.contact;
      if (type) type.value = scenario.naverType;
      const moodButton = document.querySelector(`.studio-moods [data-mood="${scenario.mood}"]`);
      selectStudioMood(scenario.mood, moodButton);
      updateStudioAutoType();
      const status = document.getElementById('studio-scenario-status');
      if (status) {
        const mode = getStudioScenarioMode();
        const fallbackNote = mode === 'generic' ? ` ${getGenericScenarioBasics().fallbackNote}` : '';
        status.textContent = `${mode === 'generic' ? '다른 업종' : '은빛캘리'} 시나리오 적용 완료: 주제, 기간, 혜택, 문의, 분위기, 네이버 유형을 채웠어요.${fallbackNote}`;
      }
      topic?.focus();
      toast(`${getStudioScenarioMode() === 'generic' ? '다른 업종' : '은빛캘리'} 시나리오를 불러왔어요. 바로 생성해서 흐름을 확인해보세요.`);
    }

    function inferStudioNaverType(topic) {
      const text = String(topic || '').toLowerCase();
      if (/리뷰|후기|감사|답글|평점/.test(text)) return getStudioNaverTypeMeta('리뷰답글');
      if (/쿠폰|할인|혜택|이벤트|첫 방문|첫방문|증정/.test(text)) return getStudioNaverTypeMeta('쿠폰');
      if (/주간|이번 주|이번주|계획|일정|콘텐츠/.test(text)) return getStudioNaverTypeMeta('주간계획');
      if (/소개|프로필|매장|브랜드|처음/.test(text)) return getStudioNaverTypeMeta('프로필');
      return getStudioNaverTypeMeta('소식');
    }

    function getStudioNaverTypeMeta(type) {
      return {
        '소식': { type: '소식', label: '네이버 소식형', hint: '방문 전 필요한 정보와 문의 방법을 중심으로 써요' },
        '쿠폰': { type: '쿠폰', label: '쿠폰 안내형', hint: '혜택 조건과 사용 방법을 빠뜨리지 않게 잡아요' },
        '리뷰답글': { type: '리뷰답글', label: '리뷰 답글형', hint: '고객 후기나 감사 답글 중심으로 정리해요' },
        '주간계획': { type: '주간계획', label: '주간계획형', hint: '인스타와 네이버를 함께 쓰는 일정으로 묶어요' },
        '프로필': { type: '프로필', label: '프로필 소개형', hint: '처음 보는 고객이 이해하기 쉽게 소개해요' },
      }[type] || { type: '소식', label: '네이버 소식형', hint: '방문 전 필요한 정보와 문의 방법을 중심으로 써요' };
    }

    function getStudioMoodMeta(mood) {
      return {
        '따뜻한': '처음 보는 고객에게 편안하고 친근하게 다가가요.',
        '정보형': '가격, 기간, 예약 방법처럼 결정에 필요한 정보를 먼저 정리해요.',
        '감성적': '매장 분위기와 장면이 떠오르도록 부드럽게 풀어요.',
        '트렌디한': '짧고 경쾌한 표현으로 인스타와 숏폼에 어울리게 잡아요.',
      }[mood] || '처음 보는 고객에게 편안하고 친근하게 다가가요.';
    }

    function updateStudioMoodHint(mood) {
      const hint = document.getElementById('studio-mood-hint');
      if (hint) hint.textContent = getStudioMoodMeta(mood);
    }

    function updateStudioAutoType() {
      const topic = document.getElementById('studio-topic')?.value || '';
      const target = document.getElementById('studio-auto-type');
      if (!target) return;
      const select = document.getElementById('studio-naver-type');
      const selected = select?.value || 'auto';
      const inferred = selected === 'auto' ? inferStudioNaverType(topic) : getStudioNaverTypeMeta(selected);
      const label = selected === 'auto' ? 'Bloom 자동 판단' : '직접 선택';
      target.querySelector('span').textContent = label;
      target.querySelector('strong').textContent = inferred.label;
      target.querySelector('small').textContent = inferred.hint;
      const help = document.getElementById('studio-type-help');
      if (help) {
        help.textContent = selected === 'auto'
          ? '자동은 주제 단어를 다시 읽어 가장 가까운 네이버 유형으로 맞춰요.'
          : '직접 선택한 유형이 딸깍 키트와 네이버 전용 도구에 함께 반영돼요.';
      }
    }

    function selectStudioMood(mood, el) {
      state.studioMood = mood;
      saveState();
      document.querySelectorAll('.studio-moods button').forEach(btn => btn.classList.remove('active'));
      if (el) el.classList.add('active');
      const toneSelect = document.getElementById('ai-kit-tone');
      if (toneSelect) toneSelect.value = mood;
      updateStudioMoodHint(mood);
    }

    function syncStudioMoodUI() {
      const mood = state.studioMood || state.settings.brandTone || '따뜻한';
      document.querySelectorAll('.studio-moods button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mood === mood);
      });
      const toneSelect = document.getElementById('ai-kit-tone');
      if (toneSelect) toneSelect.value = mood;
      updateStudioMoodHint(mood);
    }

    async function generateStudioKit() {
      const input = document.getElementById('studio-topic');
      const topic = input?.value.trim() || '';
      if (!topic) { toast('오늘 홍보할 내용을 먼저 적어주세요'); return; }
      const details = getStudioDetails();
      const kitTopic = document.getElementById('ai-kit-topic');
      const kitTone = document.getElementById('ai-kit-tone');
      if (kitTopic) kitTopic.value = topic;
      if (kitTone) kitTone.value = state.studioMood || state.settings.brandTone || '따뜻한';
      syncNaverDetailInputs(details);
      await aiGenerateMarketingKit();
      document.getElementById('ai-kit-result')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function getStudioDetails() {
      const selectedType = document.getElementById('studio-naver-type')?.value || 'auto';
      const inferredType = inferStudioNaverType(document.getElementById('studio-topic')?.value || '').type;
      return {
        period: document.getElementById('studio-period')?.value.trim() || '',
        benefit: document.getElementById('studio-benefit')?.value.trim() || '',
        contact: document.getElementById('studio-contact')?.value.trim() || '',
        preferredNaverType: selectedType === 'auto' ? inferredType : selectedType,
      };
    }

    function syncNaverDetailInputs(details) {
      const period = document.getElementById('ai-naver-period');
      const benefit = document.getElementById('ai-naver-benefit');
      const contact = document.getElementById('ai-naver-contact');
      const tone = document.getElementById('ai-naver-tone');
      const type = document.getElementById('ai-naver-type');
      if (period && details.period) period.value = details.period;
      if (benefit && details.benefit) benefit.value = details.benefit;
      if (contact && details.contact) contact.value = details.contact;
      if (type && details.preferredNaverType) type.value = details.preferredNaverType;
      if (tone) tone.value = state.studioMood || '';
    }

    async function aiGenerateMarketingKit() {
      const topic = document.getElementById('ai-kit-topic').value.trim();
      const tone = document.getElementById('ai-kit-tone').value;
      const details = getMarketingKitDetails();
      if (!topic) { toast('✏️ 키트로 만들 소식을 입력해주세요'); return; }
      if (!tryUseFreeQuota('aiGenerations')) return;
      setAIBtnLoading('ai-kit-btn', true, '⚡ 키트 만들기');
      try {
        const res = await fetch('/api/marketing-kit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic,
            tone,
            storeName: state.settings.storeName,
            category: state.settings.category || state.category,
            region: state.settings.region,
            mainOffer: state.settings.mainOffer,
            targetCustomer: state.settings.targetCustomer,
            brandTone: state.settings.brandTone,
            description: state.settings.description,
            details,
          })
        });
        if (!res.ok) throw new Error('API 오류');
        const data = await res.json();
        aiMarketingKit = normalizeMarketingKit(data.kit, topic);
        toast('✅ 마케팅 키트 생성 완료!');
      } catch {
        aiMarketingKit = buildFallbackMarketingKit(topic, details);
        toast('✅ 마케팅 키트 생성 완료! (오프라인 모드)');
      } finally {
        document.getElementById('ai-kit-text').innerHTML = renderMarketingKit(aiMarketingKit);
        document.getElementById('ai-kit-result').classList.add('show');
        setAIBtnLoading('ai-kit-btn', false, '⚡ 키트 만들기');
      }
    }

    function getMarketingKitDetails() {
      const studio = getStudioDetails();
      return {
        period: studio.period || document.getElementById('ai-naver-period')?.value.trim() || '',
        benefit: studio.benefit || document.getElementById('ai-naver-benefit')?.value.trim() || '',
        contact: studio.contact || document.getElementById('ai-naver-contact')?.value.trim() || '',
        preferredNaverType: studio.preferredNaverType || document.getElementById('ai-naver-type')?.value || '소식',
      };
    }

    function normalizeMarketingKit(kit, topic) {
      const store = state.settings.storeName || '우리 매장';
      const instagram = kit?.instagram || {};
      const naver = kit?.naver || {};
      const hashtags = Array.isArray(instagram.hashtags)
        ? instagram.hashtags.map(tag => String(tag || '').trim()).filter(Boolean).slice(0, 12)
        : [];
      const naverTitle = (naver.title || `${store} 소식`).trim();
      const naverBody = (naver.body || topic).trim();
      const naverCta = (naver.cta || '문의와 예약은 네이버 플레이스에서 편하게 남겨주세요.').trim();
      const naverCopyText = (naver.copyText || [naverTitle, naverBody, naverCta].filter(Boolean).join('\n\n')).trim();
      const checklist = Array.isArray(kit?.checklist) ? kit.checklist.filter(Boolean).slice(0, 4) : [];
      const normalized = {
        title: (kit?.title || `${store} 오늘의 마케팅 키트`).trim(),
        instagram: {
          caption: (instagram.caption || topic).trim(),
          hashtags: hashtags.length ? hashtags : ['#소상공인', '#동네가게', '#오늘의소식'],
        },
        naver: { title: naverTitle, body: naverBody, cta: naverCta, copyText: naverCopyText },
        coupon: {
          title: (kit?.coupon?.title || '첫 방문 혜택 안내').trim(),
          body: (kit?.coupon?.body || '혜택 조건이 정해져 있다면 기간과 사용 방법을 확인한 뒤 안내하세요.').trim(),
        },
        reviewReply: (kit?.reviewReply || '소중한 리뷰 감사합니다. 남겨주신 말씀 덕분에 더 따뜻하게 준비할 힘을 얻었습니다.').trim(),
        visualDirection: (kit?.visualDirection || '매장 분위기와 대표 상품이 한눈에 보이는 사진을 사용하세요.').trim(),
        bgmSuggestion: (kit?.bgmSuggestion || '따뜻한 브이로그 무드나 차분한 어쿠스틱 배경음이 잘 어울립니다.').trim(),
        bestTime: (kit?.bestTime || '평일 점심 전후 또는 저녁 7~9시에 먼저 올려보세요.').trim(),
        checklist: checklist.length ? checklist : ['운영 시간과 날짜를 확인하세요', '가격/혜택 문구가 실제와 맞는지 확인하세요', '문의 채널이 맞는지 확인하세요'],
      };
      normalized.bannerTemplates = Array.isArray(kit?.bannerTemplates) && kit.bannerTemplates.length
        ? kit.bannerTemplates.slice(0, 3)
        : buildBannerTemplates(normalized, topic);
      return normalized;
    }

    function buildBannerTemplates(kit, topic = '') {
      const store = state.settings.storeName || '우리 매장';
      const offer = topic || state.settings.mainOffer || kit.title || '오늘의 소식';
      const naverCta = kit.naver?.cta || '예약과 문의는 네이버 플레이스에서';
      return [
        {
          name: '첫 화면 안내형',
          style: 'soft',
          headline: offer.length > 24 ? `${offer.slice(0, 24)}...` : offer,
          subline: `${store}에서 준비한 오늘의 소식`,
          cta: naverCta.replace(/[.!?。]$/g, ''),
        },
        {
          name: '혜택 강조형',
          style: 'bold',
          headline: '오늘만 놓치지 마세요',
          subline: offer,
          cta: '방문 전 문의하면 더 편하게 안내드려요',
        },
        {
          name: '동네 단골형',
          style: 'local',
          headline: `${store} 소식`,
          subline: '처음 오시는 분도 편하게 들러주세요',
          cta: '네이버 플레이스에서 확인하기',
        },
      ];
    }

    function renderBannerPreview(banner, idx, copyAll, compact = false, copyHeadline = '', copyCta = '') {
      const style = escapeHtml(banner.style || 'soft');
      const name = escapeHtml(banner.name || `템플릿 ${idx + 1}`);
      const headline = escapeHtml(banner.headline || '');
      const subline = escapeHtml(banner.subline || '');
      const cta = escapeHtml(banner.cta || '');
      return `
        <article class="banner-preview ${style}${compact ? ' compact' : ''}">
          <span class="banner-preview-type">${name}</span>
          <strong>${headline}</strong>
          <em>${subline}</em>
          <small>${cta}</small>
          <div class="banner-preview-actions" aria-label="${name} 복사 옵션">
            <button onclick="${copyAll}">전체</button>
            ${copyHeadline ? `<button onclick="${copyHeadline}">제목</button>` : ''}
            ${copyCta ? `<button onclick="${copyCta}">CTA</button>` : ''}
          </div>
        </article>`;
    }

    function copyBannerTemplatePart(banner, part) {
      const partLabels = { headline: '제목', subline: '보조문구', cta: 'CTA' };
      const value = (banner?.[part] || '').trim();
      if (!value) return;
      navigator.clipboard.writeText(value).then(() => toast(`🖼️ 배너 ${partLabels[part] || '문구'}를 복사했어요`));
    }

    function buildFallbackMarketingKit(topic, details = {}) {
      const store = state.settings.storeName || '우리 매장';
      const period = details.period ? `\n기간: ${details.period}` : '';
      const benefit = details.benefit ? `\n혜택: ${details.benefit}` : '';
      const contact = details.contact || '네이버 플레이스에서 편하게 문의해주세요';
      const detailBlock = `${period}${benefit}`.trim();
      return normalizeMarketingKit({
        title: `${store} 딸깍 마케팅 키트`,
        instagram: {
          caption: `${topic}\n\n${store}에서 오늘 준비한 소식이에요. 처음 보시는 분도 편하게 문의하실 수 있도록 자세히 안내해둘게요.${details.benefit ? `\n\n${details.benefit}도 함께 확인해보세요.` : ''}\n\n궁금한 점은 댓글이나 DM으로 남겨주세요.`,
          hashtags: ['#소상공인', '#동네가게', '#오늘의소식', '#네이버플레이스', '#인스타마케팅'],
        },
        naver: {
          title: `${store} 소식`,
          body: `${topic}${detailBlock ? `\n\n${detailBlock}` : ''}\n\n처음 방문하시는 분도 쉽게 이해하실 수 있도록 준비했습니다.`,
          cta: `예약과 문의는 ${contact}.`,
        },
        coupon: {
          title: details.benefit || '첫 방문 혜택 안내',
          body: `${details.period ? `${details.period}까지 ` : ''}방문 전 ${contact} 혜택 조건을 확인해 주세요.`,
        },
        reviewReply: '소중한 리뷰 정말 감사합니다. 남겨주신 말씀 덕분에 더 정성껏 준비할 힘을 얻었습니다.',
        visualDirection: '대표 상품이나 매장 입구가 선명하게 보이는 밝은 사진을 사용하세요.',
        bgmSuggestion: '따뜻한 브이로그 무드나 차분한 어쿠스틱 배경음이 잘 어울립니다.',
        bestTime: '평일 점심 전후 또는 저녁 7~9시에 먼저 올려보세요.',
      }, topic);
    }

    function renderMarketingKit(kit) {
      const data = normalizeMarketingKit(kit, document.getElementById('ai-kit-topic')?.value || '');
      return `
        <div class="marketing-kit">
          <div class="marketing-kit-head">
            <div class="marketing-kit-kicker">인스타 + 네이버 동시 생성</div>
            <div class="marketing-kit-title">${escapeHtml(data.title)}</div>
          </div>
          <div class="marketing-kit-card">
            <strong>인스타그램 캡션</strong>
            <div class="marketing-kit-copy">${escapeHtml(data.instagram.caption)}</div>
            <div class="marketing-kit-tags">
              ${data.instagram.hashtags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}
            </div>
          </div>
          <div class="marketing-kit-card">
            <strong>네이버 플레이스 소식</strong>
            <div class="marketing-kit-copy">${escapeHtml(data.naver.copyText)}</div>
          </div>
          <div class="marketing-kit-card">
            <strong>쿠폰 문안</strong>
            <div class="marketing-kit-copy">${escapeHtml(data.coupon.title)}<br>${escapeHtml(data.coupon.body)}</div>
          </div>
          <div class="marketing-kit-card">
            <strong>리뷰 답글</strong>
            <div class="marketing-kit-copy">${escapeHtml(data.reviewReply)}</div>
          </div>
          <div class="marketing-kit-footer">
            <div class="marketing-kit-visual"><strong>사진/배너 방향</strong><br>${escapeHtml(data.visualDirection)}</div>
            <div class="marketing-kit-visual"><strong>BGM/무드</strong><br>${escapeHtml(data.bgmSuggestion)}<br><br><strong>추천 게시 시간</strong><br>${escapeHtml(data.bestTime)}</div>
            <div class="marketing-kit-banners">
              <strong>배너 미리보기</strong>
              <p>카드뉴스 첫 장이나 네이버 소식 이미지에 바로 얹을 수 있는 문구예요. 카드를 누르면 복사됩니다.</p>
              <div class="banner-template-grid">
                ${data.bannerTemplates.map((banner, idx) => `
                  ${renderBannerPreview(
                    banner,
                    idx,
                    `copyCurrentMarketingKitBanner(${idx})`,
                    false,
                    `copyCurrentMarketingKitBannerPart(${idx}, 'headline')`,
                    `copyCurrentMarketingKitBannerPart(${idx}, 'cta')`
                  )}
                `).join('')}
              </div>
            </div>
            <div class="marketing-kit-checklist">
              <strong>올리기 전 확인</strong>
              ${data.checklist.map(item => `<span>✓ ${escapeHtml(item)}</span>`).join('')}
            </div>
          </div>
        </div>`;
    }

    function getMarketingKitCopyText() {
      if (!aiMarketingKit) return '';
      return getMarketingKitBundleText(aiMarketingKit);
    }

    function aiCopyMarketingKit() {
      const text = getMarketingKitCopyText();
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => toast('📋 마케팅 키트 전체 복사 완료!'));
    }

    function copyCurrentMarketingKitBanner(index) {
      const banner = aiMarketingKit?.bannerTemplates?.[index];
      if (!banner) return;
      navigator.clipboard.writeText(`${banner.headline}\n${banner.subline}\n${banner.cta}`)
        .then(() => toast('🖼️ 배너 문구를 복사했어요'));
    }

    function copyCurrentMarketingKitBannerPart(index, part) {
      const banner = aiMarketingKit?.bannerTemplates?.[index];
      if (!banner) return;
      copyBannerTemplatePart(banner, part);
    }

    function aiSaveMarketingKitDrafts() {
      if (!aiMarketingKit) return;
      const instagramText = `${aiMarketingKit.instagram.caption}\n\n${aiMarketingKit.instagram.hashtags.join(' ')}`;
      const savedInstagram = saveMarketingDraft({ channel: '인스타그램', text: instagramText, source: '딸깍 마케팅 키트', silent: true });
      const savedNaver = saveMarketingDraft({ channel: '네이버 플레이스', text: aiMarketingKit.naver.copyText, source: '딸깍 마케팅 키트', silent: true });
      const savedCoupon = saveMarketingDraft({ channel: '쿠폰 문안', text: `${aiMarketingKit.coupon.title}\n${aiMarketingKit.coupon.body}`, source: '딸깍 마케팅 키트', silent: true });
      const savedReview = saveMarketingDraft({ channel: '리뷰 답글', text: aiMarketingKit.reviewReply, source: '딸깍 마케팅 키트', silent: true });
      const draftIds = [savedInstagram?.id, savedNaver?.id, savedCoupon?.id, savedReview?.id].filter(Boolean);
      const bundle = saveMarketingKitBundle(aiMarketingKit, draftIds);
      if (savedInstagram || savedNaver || bundle) toast('🗂️ 딸깍 키트를 저장함에 묶어서 넣었어요');
    }

    function aiUseKitInstagram() {
      if (!aiMarketingKit) return;
      const text = `${aiMarketingKit.instagram.caption}\n\n${aiMarketingKit.instagram.hashtags.join(' ')}`;
      aiCaptionResult = text;
      state.draftCaption = text;
      const el = document.getElementById('caption-final');
      if (el) { el.value = text; updateCaptionMeta(); }
      switchTab('post');
      toast('✅ 인스타 초안을 게시물 탭에 넣었어요!');
    }

    async function aiGenerateCaption() {
      const keyword = document.getElementById('ai-caption-keyword').value.trim();
      const tone = document.getElementById('ai-caption-tone').value;
      if (!keyword) { toast('✏️ 키워드를 입력해주세요'); return; }
      if (!tryUseFreeQuota('aiGenerations')) return;
      setAIBtnLoading('ai-caption-btn', true, '✨ 캡션 생성하기');
      try {
        const res = await fetch('/api/caption', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tone,
            keyword,
            storeName: state.settings.storeName,
            category: state.settings.category || state.category,
            region: state.settings.region,
            mainOffer: state.settings.mainOffer,
            targetCustomer: state.settings.targetCustomer,
            brandTone: state.settings.brandTone,
            description: state.settings.description,
          })
        });
        if (!res.ok) throw new Error('API 오류');
        const data = await res.json();
        aiCaptionResult = data.caption || '';
        document.getElementById('ai-caption-text').textContent = aiCaptionResult;
        document.getElementById('ai-caption-result').classList.add('show');
        toast('✅ 캡션 생성 완료!');
      } catch {
        // fallback
        const fallbacks = {
          '감성적': `봄날의 따스함을 담은 우리 매장의 이야기 🌸\n한 문장 한 문장에 진심을 담아요.\n\n#우리매장 #소상공인 #감성마케팅 #동네가게`,
          '정보형': `✨ ${keyword}\n처음 방문하시는 분도 쉽게 이해할 수 있도록 준비했어요 📝\n\n문의는 프로필 링크 또는 네이버 플레이스에서 확인해주세요.\n#소상공인 #네이버플레이스 #인스타마케팅`,
          '유머러스': `글씨 못 써도 괜찮아요 😅\n저도 처음엔 그랬거든요 ㅋㅋ\n지금은 이렇게 예쁜 거 씁니다 🤭\n\n#캘리그래피 #다같이어색 #그래도예쁨`,
          '따뜻한': `오늘도 한 분 한 분\n정성을 담아 맞이하고 있어요 💕\n\n함께해줘서 감사해요 🌷\n#우리매장 #감사 #동네가게`,
          '트렌디한': `이게 요즘 감성 ✨\n${keyword}로 채운 오늘 🌿\n\n#aesthetic #캘리그래피 #감성사진 #일상`,
        };
        aiCaptionResult = fallbacks[tone] || fallbacks['감성적'];
        document.getElementById('ai-caption-text').textContent = aiCaptionResult;
        document.getElementById('ai-caption-result').classList.add('show');
        toast('✅ 캡션 생성 완료! (오프라인 모드)');
      } finally {
        setAIBtnLoading('ai-caption-btn', false, '✨ 캡션 생성하기');
      }
    }

    function aiCopyCaption() {
      if (!aiCaptionResult) return;
      navigator.clipboard.writeText(aiCaptionResult).then(() => toast('📋 캡션 복사 완료!'));
    }

    function aiSaveCaptionDraft() {
      saveMarketingDraft({ channel: '인스타그램', text: aiCaptionResult, source: '캡션 생성' });
    }

    function aiUseCaption() {
      if (!aiCaptionResult) return;
      state.draftCaption = aiCaptionResult;
      const el = document.getElementById('caption-final');
      if (el) { el.value = aiCaptionResult; updateCaptionMeta(); }
      switchTab('post');
      toast('✅ 게시물 탭에 캡션을 넣었어요!');
    }

    async function aiGenerateHashtags() {
      const keyword = document.getElementById('ai-hashtag-keyword').value.trim();
      const category = document.getElementById('ai-hashtag-category').value;
      if (!keyword) { toast('✏️ 키워드를 입력해주세요'); return; }
      if (!tryUseFreeQuota('aiGenerations')) return;
      setAIBtnLoading('ai-hashtag-btn', true, '🔖 해시태그 추천받기');
      try {
        const res = await fetch('/api/hashtag', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caption: keyword, category })
        });
        if (!res.ok) throw new Error('API 오류');
        const data = await res.json();
        aiHashtagResult = data.hashtags || [];
      } catch {
        aiHashtagResult = getHashtagFallback(category, 10);
      } finally {
        setAIBtnLoading('ai-hashtag-btn', false, '🔖 해시태그 추천받기');
      }
      const chips = document.getElementById('ai-hashtag-chips');
      chips.innerHTML = aiHashtagResult.map(h =>
        `<span class="hashtag-chip" onclick="this.classList.toggle('added')">${h}</span>`
      ).join('');
      document.getElementById('ai-hashtag-result').classList.add('show');
      toast(`✅ 해시태그 ${aiHashtagResult.length}개 추천 완료!`);
    }

    function aiCopyHashtags() {
      if (!aiHashtagResult.length) return;
      navigator.clipboard.writeText(aiHashtagResult.join(' ')).then(() => toast('📋 해시태그 복사 완료!'));
    }

    async function aiGenerateIdeas() {
      const category = document.getElementById('ai-idea-category').value;
      const period = document.getElementById('ai-idea-period').value;
      if (!tryUseFreeQuota('aiGenerations')) return;
      setAIBtnLoading('ai-idea-btn', true, '💡 아이디어 받기');
      try {
        const res = await fetch('/api/analysis', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'recommendations', data: { category, period } })
        });
        if (!res.ok) throw new Error('API 오류');
        const data = await res.json();
        aiIdeasResult = data.recommendations || data.result || '';
      } catch {
        const ideas = {
          '공예': ['🌸 봄맞이 캘리 원데이 클래스 모집 안내', '✍️ 손편지 쓰는 방법 튜토리얼', '🎁 맞춤 캘리 굿즈 소개', '📸 작업실 일상 behind the scene', '💌 수강생 후기 스토리텔링'],
          '음식점': ['🍱 오늘의 메뉴 소개', '👨‍🍳 요리 과정 Reel 영상', '⭐ 단골 손님 인터뷰', '🎉 기간 한정 메뉴 출시', '🌿 식재료 신선도 어필'],
          '카페': ['☕ 시그니처 메뉴 스토리', '🏠 카페 인테리어 투어', '📖 카페에서 책 읽기 감성', '🎵 오늘의 플레이리스트', '🧁 신메뉴 티저'],
          '학원': ['📚 이번 주 수업 포인트 안내', '📝 공부 습관 체크리스트', '👩‍🏫 선생님 소개 콘텐츠', '⭐ 학부모 후기 소개', '🎯 시험 대비 일정 공지'],
          '운동/건강': ['🏃 이번 주 운동 루틴 제안', '💪 초보자 자세 팁', '🥗 건강 습관 체크리스트', '📸 회원 변화 스토리', '🗓️ 체험 수업 안내'],
          '기타': ['📢 이번 주 대표 소식', '📸 매장 일상 공유', '⭐ 고객 후기 소개', '🎟️ 첫 방문 혜택 안내', '💬 자주 묻는 질문 답변'],
        };
        const list = ideas[category] || ['💡 이번 주 콘텐츠 아이디어', '📸 일상 공유', '✨ 신제품 소개', '🎯 이벤트 진행', '💬 팔로워 소통'];
        aiIdeasResult = `📌 ${period} ${category} 콘텐츠 아이디어\n\n` + list.map((idea, i) => `${i+1}. ${idea}`).join('\n');
      } finally {
        setAIBtnLoading('ai-idea-btn', false, '💡 아이디어 받기');
      }
      document.getElementById('ai-idea-text').textContent = aiIdeasResult;
      document.getElementById('ai-idea-result').classList.add('show');
      toast('✅ 아이디어 생성 완료!');
    }

    function aiCopyIdeas() {
      if (!aiIdeasResult) return;
      navigator.clipboard.writeText(aiIdeasResult).then(() => toast('📋 아이디어 복사 완료!'));
    }

    function aiSaveIdeasDraft() {
      saveMarketingDraft({ channel: '주간 계획', text: aiIdeasResult, source: '콘텐츠 아이디어' });
    }

    async function aiGenerateNaverPlace() {
      const topic = document.getElementById('ai-naver-topic').value.trim();
      const type = document.getElementById('ai-naver-type').value;
      const details = getNaverPlaceDetails();
      if (!topic) { toast('✏️ 네이버 플레이스에 올릴 내용을 입력해주세요'); return; }
      if (!tryUseFreeQuota('aiGenerations')) return;
      setAIBtnLoading('ai-naver-btn', true, 'N 문안 만들기');
      const store = state.settings.storeName || '우리 매장';
      try {
        const res = await fetch('/api/naver-place', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic,
            type,
            storeName: state.settings.storeName,
            category: state.settings.category || state.category,
            region: state.settings.region,
            mainOffer: state.settings.mainOffer,
            targetCustomer: state.settings.targetCustomer,
            brandTone: details.tone || state.settings.brandTone,
            description: state.settings.description,
            details,
          })
        });
        if (!res.ok) throw new Error('API 오류');
        const data = await res.json();
        aiNaverPackage = normalizeNaverPackage(data.package, data.text, type, topic);
        aiNaverResult = aiNaverPackage.copyText;
        toast('✅ 네이버 플레이스 AI 문안 생성 완료!');
      } catch {
        aiNaverResult = buildFallbackNaverText({ store, topic, type, details });
        aiNaverPackage = normalizeNaverPackage(null, aiNaverResult, type, topic);
        toast('✅ 네이버 플레이스 문안 생성 완료! (오프라인 모드)');
      } finally {
        document.getElementById('ai-naver-text').innerHTML = renderNaverPackage(aiNaverPackage, type);
        document.getElementById('ai-naver-result').classList.add('show');
        setAIBtnLoading('ai-naver-btn', false, 'N 문안 만들기');
      }
    }

    function getNaverPlaceDetails() {
      return {
        period: document.getElementById('ai-naver-period')?.value.trim() || '',
        benefit: document.getElementById('ai-naver-benefit')?.value.trim() || '',
        contact: document.getElementById('ai-naver-contact')?.value.trim() || '',
        tone: document.getElementById('ai-naver-tone')?.value || '',
      };
    }

    function buildFallbackNaverText({ store, topic, type, details }) {
      const period = details.period ? `\n기간: ${details.period}` : '';
      const benefit = details.benefit ? `\n혜택: ${details.benefit}` : '';
      const contact = details.contact || '네이버 톡톡 또는 전화로 문의해주세요';
      const detailLines = `${period}${benefit}`.trim();
      const detailBlock = detailLines ? `\n\n${detailLines}` : '';
      const templates = {
        '소식': `📢 ${store} 소식\n\n${topic}${detailBlock}\n\n처음 방문하시는 분도 편하게 확인하실 수 있도록 준비해둘게요. 궁금한 점은 ${contact}. \n\n#네이버플레이스 #소상공인 #오늘의소식`,
        '쿠폰': `🎟️ ${store} 방문 쿠폰 안내\n\n${topic}${detailBlock}\n\n방문 전 네이버 플레이스에서 혜택 조건을 확인하고 이용해주세요. 작은 혜택이지만 감사한 마음을 담았습니다. 문의는 ${contact}.`,
        '리뷰답글': `소중한 리뷰 정말 감사합니다.\n\n${topic}\n\n방문해주신 시간이 좋은 기억으로 남았다니 저희도 큰 힘이 됩니다. 남겨주신 말씀은 더 꼼꼼히 준비하는 데 참고하겠습니다. 다음에도 편하게 찾아주세요.`,
        '주간계획': `🗓️ 이번 주 마케팅 계획\n\n1. 월/화: 네이버 플레이스 소식 - ${topic}\n2. 수/목: 인스타그램 사진 게시물 + 해시태그\n3. 금: 고객 후기 또는 작업 과정 공유\n4. 주말: 쿠폰/예약 안내 재공지${detailBlock}\n\n목표는 어렵게 많이 하는 것이 아니라, 이번 주에 3번 꾸준히 보이는 거예요.`,
        '프로필': `🏪 ${store} 소개\n\n${topic}${detailBlock}\n\n처음 방문하시는 분도 편하게 문의하실 수 있도록 네이버 플레이스에서 운영 시간과 예약 정보를 확인해주세요. 문의는 ${contact}.`
      };
      return templates[type] || templates['소식'];
    }

    function normalizeNaverPackage(pkg, fallbackText, type, topic) {
      const text = (fallbackText || '').trim();
      if (pkg && (pkg.title || pkg.body || pkg.copyText)) {
        const title = (pkg.title || `${type} 문안`).trim();
        const body = (pkg.body || text || topic).trim();
        const cta = (pkg.cta || '문의와 예약은 네이버 플레이스에서 편하게 남겨주세요.').trim();
        const checklist = Array.isArray(pkg.checklist) ? pkg.checklist.filter(Boolean).slice(0, 4) : [];
        const copyText = (pkg.copyText || [title, body, cta].filter(Boolean).join('\n\n')).trim();
        return { title, body, cta, checklist: checklist.length ? checklist : getDefaultNaverChecklist(type), copyText };
      }
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      const title = lines[0] || `${type} 문안`;
      const body = lines.slice(1).join('\n\n') || topic;
      return {
        title,
        body,
        cta: '문의와 예약은 네이버 플레이스에서 편하게 남겨주세요.',
        checklist: getDefaultNaverChecklist(type),
        copyText: text || [title, body].join('\n\n'),
      };
    }

    function getDefaultNaverChecklist(type) {
      const common = ['날짜와 운영 시간을 확인하세요', '문의/예약 방법이 맞는지 확인하세요'];
      if (type === '쿠폰') return ['혜택 조건이 실제와 맞는지 확인하세요', '사용 기간을 넣었는지 확인하세요', ...common.slice(1)];
      if (type === '리뷰답글') return ['고객 이름이나 상황을 공개하지 않았는지 확인하세요', '감사와 개선 의지가 들어갔는지 확인하세요', '과한 변명 표현은 없는지 확인하세요'];
      if (type === '주간계획') return ['이번 주 실제 운영일과 맞는지 확인하세요', '인스타/네이버 각각 하나 이상 들어갔는지 확인하세요', '실행하기 어려운 일정은 줄이세요'];
      if (type === '프로필') return ['대표 서비스가 분명한지 확인하세요', '처음 방문 고객에게 쉬운 표현인지 확인하세요', '문의 채널이 맞는지 확인하세요'];
      return [...common, '가격/혜택 문구가 실제와 맞는지 확인하세요'];
    }

    function renderNaverPackage(pkg, type) {
      const data = normalizeNaverPackage(pkg, aiNaverResult, type, document.getElementById('ai-naver-topic')?.value || '');
      return `
        <div class="naver-package">
          <div class="naver-package-kicker">네이버 플레이스 ${escapeHtml(type)} 패키지</div>
          <div class="naver-package-title">${escapeHtml(data.title)}</div>
          <div class="naver-package-body">${escapeHtml(data.body).replace(/\n/g, '<br>')}</div>
          <div class="naver-package-cta">${escapeHtml(data.cta)}</div>
          <div class="naver-package-checklist">
            <strong>올리기 전 확인</strong>
            ${data.checklist.map(item => `<span>✓ ${escapeHtml(item)}</span>`).join('')}
          </div>
        </div>`;
    }

    function aiCopyNaverPlace() {
      if (!aiNaverResult) return;
      navigator.clipboard.writeText(aiNaverResult).then(() => toast('📋 네이버 플레이스 문안 복사 완료!'));
    }

    function aiSaveNaverDraft() {
      saveMarketingDraft({ channel: '네이버 플레이스', text: aiNaverResult, source: '네이버 플레이스 문안' });
    }

    function aiUseNaverAsIdea() {
      if (!aiNaverResult) return;
      aiIdeasResult = aiNaverResult;
      document.getElementById('ai-idea-text').textContent = aiIdeasResult;
      document.getElementById('ai-idea-result').classList.add('show');
      toast('💡 콘텐츠 아이디어에 저장했어요');
    }

    async function aiOptimalTime() {
      const category = document.getElementById('ai-time-category').value;
      const day = document.getElementById('ai-time-day').value;
      if (!tryUseFreeQuota('aiGenerations')) return;
      setAIBtnLoading('ai-time-btn', true, '📊 최적 시간 분석');
      try {
        const res = await fetch('/api/analysis', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'optimal-time', data: { category, day } })
        });
        if (!res.ok) throw new Error('API 오류');
        const data = await res.json();
        aiTimeResult = data.optimalTime || data.result || '';
      } catch {
        const times = {
          '공예_전체': '🕐 오전 10:00 — 오후 12:00 사이가 가장 반응이 좋아요\n🕕 저녁 7:00 — 9:00도 높은 참여율!\n\n💡 공예 팬들은 주로 점심시간과 저녁 여가 시간에 활동해요.',
          '공예_평일': '🕙 오전 10:30 — 이른 오전 출근 전 브라우징 시간대\n🕕 오후 12:00 — 점심 시간 피크\n🕗 오후 7:30 — 퇴근 후 여가 시간',
          '공예_주말': '🕙 오전 10:00 — 주말 여유 브런치 타임\n🕒 오후 3:00 — 오후 나들이 후 확인\n🌙 오후 9:00 — 주말 저녁 릴랙스 타임',
          '학원_전체': '🕗 오전 8:00 — 등교 전 학부모 확인 시간\n🕕 오후 6:00 — 하교 후 상담 문의가 늘어나는 시간\n\n💡 학원 콘텐츠는 평일 저녁 공지와 주말 상담 안내가 잘 맞아요.',
          '운동/건강_전체': '🕖 오전 7:00 — 운동 의지가 높은 출근 전 시간\n🕘 오후 9:00 — 하루 마무리 운동 계획 시간\n\n💡 운동/건강 콘텐츠는 루틴, 전후 변화, 체험권 안내가 반응을 만들기 좋아요.',
        };
        aiTimeResult = times[`${category}_${day}`] || times['공예_전체'] || '오전 10:00 ~ 12:00, 오후 7:00 ~ 9:00 사이가 최적 시간이에요!';
      } finally {
        setAIBtnLoading('ai-time-btn', false, '📊 최적 시간 분석');
      }
      document.getElementById('ai-time-text').textContent = aiTimeResult;
      document.getElementById('ai-time-result').classList.add('show');
      toast('✅ 최적 시간 분석 완료!');
    }

    function aiApplyTime() {
      switchTab('schedule');
      toast('📅 예약 계획 탭으로 이동했어요!');
    }

    // ===== AI CHAT =====
    const chatHistory = [];

    async function sendChatMessage() {
      const input = document.getElementById('ai-chat-input');
      const msg = input.value.trim();
      if (!msg) return;
      if (!tryUseFreeQuota('aiGenerations')) return;
      input.value = '';
      addChatMsg('user', msg);
      chatHistory.push({ role: 'user', content: msg });
      addChatMsg('assistant', '...', 'typing');
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: chatHistory,
            storeName: state.settings.storeName,
            category: state.category,
            tone: state.tone || state.settings.brandTone,
          })
        });
        if (!res.ok) throw new Error('Chat API error');
        const data = await res.json();
        const text = data.message || '죄송해요, 다시 시도해주세요 😅';
        removeTyping();
        addChatMsg('assistant', text);
        chatHistory.push({ role: 'assistant', content: text });
      } catch {
        removeTyping();
        const quickAnswers = {
          '캡션': '오늘 우리 매장의 따뜻한 순간 ✍️\n작은 정성이 좋은 기억으로 남길 바라요 💌\n#우리매장 #소상공인 #동네가게 #감성마케팅',
          '해시태그': '#캘리그래피 #손글씨 #감성캘리 #원데이클래스 #의정부공방 #캘리스타그램 #수공예 #손편지',
          '네이버': '📢 네이버 플레이스 소식\n이번 주 원데이 클래스 예약을 받고 있어요. 처음 오셔도 편하게 배울 수 있도록 준비해둘게요.',
          '아이디어': '💡 이번 주 추천 콘텐츠:\n1. 작업 과정 Reel\n2. 수강생 후기\n3. 신상 굿즈 소개',
          '팁': '⏰ 최적 게시 시간: 오전 10시, 오후 7시\n💬 질문형 캡션이 댓글을 2배 늘려줘요!\n🏷️ 해시태그 15~20개가 가장 효과적이에요',
        };
        const key = Object.keys(quickAnswers).find(k => msg.includes(k));
        addChatMsg('assistant', key ? quickAnswers[key] : '네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요 🙏');
      }
    }

    function sendQuickPrompt(text) {
      document.getElementById('ai-chat-input').value = text;
      sendChatMessage();
    }

    function addChatMsg(role, text, cls) {
      const msgs = document.getElementById('ai-chat-messages');
      const div = document.createElement('div');
      div.className = `ai-msg ${role}${cls ? ' ' + cls : ''}`;
      const safeText = escapeHtml(text).replace(/\n/g, '<br>');
      div.innerHTML = `
        <div class="ai-msg-avatar">${role === 'assistant' ? '🌸' : '😊'}</div>
        <div class="ai-msg-bubble">${safeText}</div>`;
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function removeTyping() {
      document.querySelector('.ai-msg.typing')?.remove();
    }

    function downloadReport() {
      const data = {
        date: new Date().toLocaleDateString('ko-KR'),
        followers: 2847, likes: 18450, comments: 1246, posts: 42,
        topPosts: ['감성적인 봄 캘리그래피 워크샵', '오늘의 추천 작품', '주말 워크샵 안내'],
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `bloom-report-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast('📥 리포트 다운로드 완료');
    }
    
    // ===== HASHTAG PAGE =====
    async function generateHashtags() {
      const input = document.getElementById('hashtag-input').value.trim();
      const category = document.getElementById('hashtag-category').value;
      const result = document.getElementById('hashtag-result');
      if (!input) { toast('📝 캡션이나 키워드를 입력해주세요'); return; }
      if (!tryUseFreeQuota('aiGenerations')) return;
      result.innerHTML = `<div class="ai-analyzing" style="background: var(--bg);"><div class="ai-spinner"></div><span style="font-size: 12px; color: var(--sub); font-weight: 500;">AI가 해시태그를 분석 중이에요...</span></div>`;
      let hashtags;
      try {
        const res = await fetch('/api/hashtag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caption: input, category }),
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        hashtags = data.hashtags || [];
      } catch (e) {
        hashtags = getHashtagFallback(category, 8);
      }
      
      if (!state.hashtagStats) state.hashtagStats = {};
      hashtags.forEach(tag => { state.hashtagStats[tag] = (state.hashtagStats[tag] || 0) + 1; });
      saveState();
      renderMyHashtags();
      
      result.innerHTML = `
        <div style="margin-bottom: 10px; font-size: 12px; font-weight: 700; color: var(--ter);">${hashtags.length}개 추천 · 클릭해서 복사</div>
        <div class="hashtag-chips">
          ${hashtags.map(tag => `<button class="hashtag-chip" onclick="copyHashtag('${tag}', this)">${tag}</button>`).join('')}
        </div>
        <button class="add-all-btn" onclick='copyAllHashtags(${JSON.stringify(hashtags)})'>📋 전체 복사</button>`;
    }
    
    function copyHashtag(tag, el) {
      navigator.clipboard.writeText(tag).then(() => {
        el.classList.add('added');
        toast(`📋 "${tag}" 복사됨`);
        setTimeout(() => el.classList.remove('added'), 1200);
      });
    }
    
    function copyAllHashtags(tags) {
      const text = tags.join(' ');
      navigator.clipboard.writeText(text).then(() => toast(`📋 ${tags.length}개 해시태그 복사됨`));
    }
    
    let hashtagTrendChart;
    function loadTrendingHashtags(category, el) {
      if (el) {
        el.parentElement.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
      }
      const trending = {
        '공예': [['#캘리그래피', 4200], ['#손글씨', 3800], ['#감성캘리', 2900], ['#손편지', 2200], ['#작가의방', 1800], ['#봄캘리', 1500], ['#공예작가', 1200], ['#수공예', 950]],
        '음식점': [['#맛집', 12800], ['#먹스타그램', 9500], ['#JMT', 7200], ['#한식', 5800], ['#가정식', 3900], ['#오늘의메뉴', 2700], ['#존맛탱', 2100], ['#맛스타그램', 1800]],
        '카페': [['#카페', 15200], ['#커피', 11000], ['#디저트', 8400], ['#카페스타그램', 6900], ['#감성카페', 4500], ['#아메리카노', 3200], ['#휴식', 2400], ['#카페투어', 1900]],
        '학원': [['#학원', 7800], ['#공부습관', 5200], ['#교육정보', 4100], ['#학부모소통', 3400], ['#입시정보', 3100], ['#수업후기', 1900]],
        '운동/건강': [['#운동', 13900], ['#건강관리', 8600], ['#헬스', 7600], ['#필라테스', 6900], ['#다이어트', 6400], ['#오늘운동', 3500]],
        '기타': [['#소상공인', 6200], ['#동네가게', 4700], ['#오늘의소식', 3600], ['#예약문의', 2400], ['#고객감사', 1800], ['#신규오픈', 1600]],
      };
      const data = trending[category] || trending['공예'];
      const canvas = document.getElementById('chart-hashtag-trend');
      if (!canvas) return;
      if (hashtagTrendChart) hashtagTrendChart.destroy();
      hashtagTrendChart = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: data.map(d => d[0]),
          datasets: [{
            label: '게시물 수',
            data: data.map(d => d[1]),
            backgroundColor: ['#FFB5D8', '#FFB89E', '#FFF2BE', '#C8F2D9', '#D4C9FF', '#B5A7FF', '#FFB5D8', '#FFB89E'],
            borderRadius: 8, borderSkipped: false,
          }],
        },
        options: {
          indexAxis: 'y',
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { family: 'Pretendard, sans-serif' } } },
            y: { grid: { display: false }, ticks: { font: { family: 'Pretendard, sans-serif', size: 11 } } },
          },
        },
      });
    }
    
    function renderMyHashtags() {
      const container = document.getElementById('my-hashtags-list');
      if (!container) return;
      const stats = state.hashtagStats || {};
      const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]).slice(0, 12);
      if (sorted.length === 0) {
        container.innerHTML = `<div style="color: var(--sub); font-size: 13px; text-align: center; padding: 24px;">아직 사용한 해시태그가 없어요. AI 추천에서 해시태그를 사용하면 여기에 통계가 쌓여요 ✨</div>`;
        return;
      }
      const maxCount = sorted[0][1];
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${sorted.map(([tag, count]) => `
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="font-size: 13px; font-weight: 600; min-width: 130px; color: var(--ink);">${tag}</div>
              <div style="flex: 1; background: var(--bg); border-radius: 8px; height: 24px; position: relative; overflow: hidden;">
                <div style="background: var(--grad-hero); height: 100%; width: ${(count / maxCount) * 100}%; border-radius: 8px; transition: width .4s;"></div>
              </div>
              <div style="font-size: 12px; font-weight: 700; color: var(--sub); min-width: 36px; text-align: right;">${count}회</div>
            </div>
          `).join('')}
        </div>`;
    }
    
    function clearHashtagHistory() {
      if (!confirm('해시태그 사용 기록을 모두 삭제할까요?')) return;
      state.hashtagStats = {};
      saveState();
      renderMyHashtags();
      toast('🗑️ 해시태그 기록 삭제됨');
    }
