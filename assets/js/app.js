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
      draftFilter: 'all',
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
        return { ...defaultState, ...saved, settings: { ...defaultState.settings, ...(saved.settings || {}) } };
      } catch { return { ...defaultState }; }
    }
    function saveState() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }
    state.calDate = new Date(2026, 4, 1);
    state.selectedDay = null;

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

    const SEARCH_TABS = [
      { icon: '🏠', name: '대시보드', tab: 'home', desc: '성과 요약 · 최근 게시물' },
      { icon: '✨', name: '새 게시물', tab: 'post', desc: 'AI 캡션 생성 · 이미지 업로드' },
      { icon: '📅', name: '예약 발행', tab: 'schedule', desc: '날짜 선택 · 게시물 예약' },
      { icon: '📊', name: '성과 분석', tab: 'analytics', desc: '좋아요 · 팔로워 · 참여율 차트' },
      { icon: '🤖', name: 'AI 어시스턴트', tab: 'ai', desc: '캡션 · 해시태그 · 콘텐츠 아이디어' },
      { icon: '#️⃣', name: '해시태그 분석', tab: 'hashtag', desc: '트렌드 해시태그 · AI 추천' },
      { icon: '⚙️', name: '설정', tab: 'settings', desc: '프로필 · 테마 · 목표 설정' },
    ];

    const SEARCH_FEATURES = [
      { icon: '🎨', name: 'AI 캡션 생성', tab: 'post', desc: '새 게시물 → AI 생성 버튼' },
      { icon: '📸', name: '이미지 업로드', tab: 'post', desc: '새 게시물 → 사진 선택' },
      { icon: '📆', name: '날짜 예약', tab: 'schedule', desc: '예약 발행 → 달력 선택' },
      { icon: '🌈', name: '테마 변경', tab: 'settings', desc: '설정 → 색상 테마' },
      { icon: '🎯', name: '목표 설정', tab: 'settings', desc: '설정 → 목표 섹션' },
      { icon: '📋', name: '리포트 다운로드', tab: 'analytics', desc: '성과 분석 → 리포트 내보내기' },
      { icon: '💬', name: 'AI 채팅', tab: 'ai', desc: 'AI 어시스턴트 → 채팅 모드' },
      { icon: '⏰', name: '최적 게시 시간', tab: 'ai', desc: 'AI 어시스턴트 → 최적 시간 분석' },
    ];
    
    // ===== TABS =====
    function switchTab(tab) {
      state.currentTab = tab;
      saveState();
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      document.querySelectorAll('.bottom-tab').forEach(n => n.classList.remove('active'));
      const tabEl = document.getElementById('tab-' + tab);
      if (tabEl) tabEl.classList.add('active');
      document.querySelectorAll(`[data-tab="${tab}"]`).forEach(n => n.classList.add('active'));
      
      if (tab === 'home') renderTodayTasks();
      if (tab === 'analytics') setTimeout(initCharts, 100);
      if (tab === 'schedule') { renderCalendar(); renderScheduledPosts(); renderDraftQueue(); updateMobilePreview(); }
      if (tab === 'hashtag') { setTimeout(() => loadTrendingHashtags(state.category || '공예'), 100); renderMyHashtags(); }
      
      // 페이지 상단으로 스크롤
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    document.querySelectorAll('[data-tab]').forEach(item => {
      item.addEventListener('click', () => switchTab(item.dataset.tab));
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
    function publishPost() {
      const cap = document.getElementById('caption-final').value;
      if (!cap.trim()) { toast('✍️ 캡션을 입력해주세요'); return; }
      toast('🎉 게시물이 발행됐어요!');
      document.getElementById('caption-final').value = '';
      updateCaptionMeta();
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
      
      // 설정 폼 복원
      const settingsInputs = document.querySelectorAll('#tab-settings input, #tab-settings textarea, #tab-settings select');
      settingsInputs.forEach(inp => {
        const label = inp.previousElementSibling?.textContent?.trim() || '';
        if (label.includes('매장명')) inp.value = state.settings.storeName;
        else if (label.includes('인스타그램')) inp.value = state.settings.instagram;
        else if (label.includes('이메일')) inp.value = state.settings.email;
        else if (label.includes('연락처')) inp.value = state.settings.phone;
        else if (label.includes('주소')) inp.value = state.settings.address;
        else if (label.includes('매장 소개')) inp.value = state.settings.description;
        else if (label.includes('월간 게시물')) inp.value = state.settings.postsGoal;
        else if (label.includes('팔로워 목표')) inp.value = state.settings.followersGoal;
        else if (label.includes('참여도')) inp.value = state.settings.engagementGoal;
        else if (label.includes('카테고리') && inp.tagName === 'SELECT') {
          syncCategoryAcrossUI(state.settings.category || state.category);
        }
      });
      syncCategoryAcrossUI(state.settings.category || state.category);
      syncToneAcrossUI(state.tone || state.settings.brandTone);
      
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
          const tabMap = { h: 'home', p: 'post', s: 'schedule', a: 'analytics', t: 'hashtag', i: 'ai', e: 'settings' };
          const dest = tabMap[e.key.toLowerCase()];
          if (dest) { switchTab(dest); e.preventDefault(); }
        }
      });
      
      renderCalendar();
      renderScheduledPosts();
      renderDraftQueue();
      renderTodayTasks();
      updateMobilePreview();
      if (!state.onboardingComplete) setTimeout(showOnboarding, 500);
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

      closeModal();
      switchTab('ai');
      applyStarterDrafts();
      toast('첫 인스타·네이버 문안을 준비했어요');
    }

    function generateStarterDrafts({ store, category, region, tone, offer, target }) {
      const place = region ? `${region} ` : '';
      return {
        instagramKeyword: `${place}${store} ${offer}`,
        naverTopic: `${offer} 안내`,
        ideaText: `🗓️ ${store} 첫 주 마케팅 계획\n\n1. 인스타그램: ${tone} 톤으로 "${offer}" 소개\n2. 네이버 플레이스: ${place}${category} 고객이 바로 이해할 소식 작성\n3. 리뷰 답글: ${target}에게 감사와 재방문 이유 전달\n4. 주말 전: 쿠폰/예약 가능 시간 다시 안내`
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
      if (ideaText) {
        aiIdeasResult = drafts.ideaText;
        ideaText.textContent = drafts.ideaText;
        document.getElementById('ai-idea-result')?.classList.add('show');
      }
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
      renderDraftQueue();
      renderCalendar();
      toast('📅 예약 완료!');
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
    }

    function saveMarketingDraft({ channel, text, source = 'AI 도구', status = 'draft', silent = false }) {
      if (!text || !text.trim()) { toast('저장할 문안이 아직 없어요'); return null; }
      ensureDraftQueue();
      const draft = {
        id: Date.now(),
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

    function draftMatchesFilter(draft, filter) {
      const channel = draft.channel || '';
      const status = draft.status || 'draft';
      if (filter === 'all') return true;
      if (filter === 'instagram') return channel.includes('인스타');
      if (filter === 'naver') return channel.includes('네이버');
      if (filter === 'plan') return channel.includes('주간');
      return status === filter;
    }

    function renderDraftQueue() {
      const c = document.getElementById('draft-queue');
      if (!c) return;
      ensureDraftQueue();
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
      toast('📅 예약 발행에 문안을 넣었어요');
    }

    function markDraftStatus(id, status, showToast = true) {
      ensureDraftQueue();
      const draft = state.weeklyDrafts.find(d => d.id === id);
      if (!draft) return;
      draft.status = status;
      saveState();
      renderDraftQueue();
      renderTodayTasks();
      if (showToast) toast(`상태를 ${getDraftStatusLabel(status)}으로 바꿨어요`);
    }

    function deleteMarketingDraft(id) {
      ensureDraftQueue();
      state.weeklyDrafts = state.weeklyDrafts.filter(d => d.id !== id);
      if (state.activeDraftId === id) state.activeDraftId = null;
      saveState();
      renderDraftQueue();
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
      renderTodayTasks();
      toast('✨ 예시 문안을 저장함에 채웠어요');
    }

    function renderTodayTasks() {
      const list = document.getElementById('today-task-list');
      const count = document.getElementById('today-task-count');
      if (!list) return;
      ensureDraftQueue();
      const drafts = state.weeklyDrafts || [];
      const draftCount = drafts.filter(d => (d.status || 'draft') === 'draft').length;
      const copiedCount = drafts.filter(d => d.status === 'copied').length;
      const scheduledCount = state.scheduledPosts?.length || 0;
      const tasks = [
        {
          kicker: '1순위',
          title: draftCount ? `저장된 초안 ${draftCount}개 확인` : '오늘 쓸 문안 만들기',
          desc: draftCount ? '초안을 복사하거나 예약 발행에 넣어 이번 주 흐름을 이어가세요.' : 'AI 어시스턴트에서 인스타/네이버 문안을 하나 만들어보세요.',
          action: draftCount ? '저장함 보기' : 'AI로 만들기',
          tab: draftCount ? 'schedule' : 'ai',
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
      if (count) count.textContent = `${draftCount + copiedCount + scheduledCount}개 대기`;
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
        [['G','H'], '대시보드'],
        [['G','P'], '새 게시물'],
        [['G','S'], '예약 발행'],
        [['G','A'], '성과 분석'],
        [['G','T'], '해시태그 분석'],
        [['G','E'], '설정'],
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
            ${i === 5 ? '<div class="kbd-sep"></div><div class="kbd-sep"></div>' : ''}
          `).join('')}
        </div>`;
      openModal('⌨️ 키보드 단축키', html);
    }

    function saveSettings() {
      const inputs = document.querySelectorAll('#tab-settings input, #tab-settings textarea, #tab-settings select');
      inputs.forEach(inp => {
        const label = inp.previousElementSibling?.textContent?.trim() || '';
        if (label.includes('매장명')) state.settings.storeName = inp.value;
        else if (label.includes('인스타그램')) state.settings.instagram = inp.value;
        else if (label.includes('이메일')) state.settings.email = inp.value;
        else if (label.includes('연락처')) state.settings.phone = inp.value;
        else if (label.includes('주소')) state.settings.address = inp.value;
        else if (label.includes('매장 소개')) state.settings.description = inp.value;
        else if (label.includes('월간 게시물')) state.settings.postsGoal = +inp.value;
        else if (label.includes('팔로워 목표')) state.settings.followersGoal = +inp.value;
        else if (label.includes('참여도')) state.settings.engagementGoal = +inp.value;
        else if (label.includes('카테고리') && inp.tagName === 'SELECT') {
          syncCategoryAcrossUI(inp.value);
        }
      });
      syncCategoryAcrossUI(state.settings.category || state.category);
      syncToneAcrossUI(state.tone || state.settings.brandTone);
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
              <div style="font-size: 13px; font-weight: 600;">예약 게시물이 30분 후 발행됩니다</div>
              <div style="font-size: 11px; color: var(--sub); margin-top: 2px;">오후 8시 발행 예정</div>
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
          <div style="font-size: 14px; opacity: .9; font-weight: 700;">UPGRADE</div>
          <div style="font-size: 28px; font-weight: 800; letter-spacing: -0.5px; margin: 4px 0;">월 9,900원</div>
          <div style="font-size: 12px; opacity: .9;">언제든 해지 가능</div>
        </div>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px; font-size: 13px; padding: 0;">
          <li style="display: flex; gap: 10px;"><span>✨</span> AI 캡션 무제한 생성</li>
          <li style="display: flex; gap: 10px;"><span>📊</span> 고급 성과 분석 + 경쟁사 비교</li>
          <li style="display: flex; gap: 10px;"><span>📅</span> 자동 발행 시간 추천 (AI)</li>
          <li style="display: flex; gap: 10px;"><span>🏢</span> 멀티 매장 관리 (최대 5개)</li>
          <li style="display: flex; gap: 10px;"><span>💬</span> 우선 고객지원</li>
        </ul>
        <button class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 20px;" onclick="closeModal(); toast('💳 결제는 준비 중이에요')">✨ Pro 시작하기</button>`);
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

    async function aiGenerateCaption() {
      const keyword = document.getElementById('ai-caption-keyword').value.trim();
      const tone = document.getElementById('ai-caption-tone').value;
      if (!keyword) { toast('✏️ 키워드를 입력해주세요'); return; }
      setAIBtnLoading('ai-caption-btn', true, '✨ 캡션 생성하기');
      try {
        const res = await fetch('/api/caption', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tone, keyword })
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

    function aiGenerateNaverPlace() {
      const topic = document.getElementById('ai-naver-topic').value.trim();
      const type = document.getElementById('ai-naver-type').value;
      if (!topic) { toast('✏️ 네이버 플레이스에 올릴 내용을 입력해주세요'); return; }
      setAIBtnLoading('ai-naver-btn', true, 'N 문안 만들기');
      const store = state.settings.storeName || '우리 매장';
      const templates = {
        '소식': `📢 ${store} 소식\n\n${topic}\n\n처음 방문하시는 분도 편하게 오실 수 있도록 준비해둘게요. 궁금한 점은 네이버 톡톡 또는 DM으로 문의해주세요.\n\n#네이버플레이스 #소상공인 #오늘의소식`,
        '쿠폰': `🎟️ ${store} 방문 쿠폰 안내\n\n${topic}\n\n네이버 플레이스에서 쿠폰을 확인하고 방문 시 보여주세요. 작은 혜택이지만 감사한 마음을 담았습니다.`,
        '리뷰답글': `소중한 리뷰 정말 감사합니다.\n\n${topic}\n\n방문해주신 시간이 좋은 기억으로 남았다니 저희도 큰 힘이 됩니다. 다음에도 더 따뜻하게 맞이하겠습니다.`,
        '주간계획': `🗓️ 이번 주 마케팅 계획\n\n1. 월/화: 네이버 플레이스 소식 - ${topic}\n2. 수/목: 인스타그램 사진 게시물 + 해시태그\n3. 금: 고객 후기 또는 작업 과정 공유\n4. 주말: 쿠폰/예약 안내 재공지\n\n목표는 어렵게 많이 하는 것이 아니라, 이번 주에 3번 꾸준히 보이는 거예요.`
      };
      aiNaverResult = templates[type] || templates['소식'];
      document.getElementById('ai-naver-text').textContent = aiNaverResult;
      document.getElementById('ai-naver-result').classList.add('show');
      setAIBtnLoading('ai-naver-btn', false, 'N 문안 만들기');
      toast('✅ 네이버 플레이스 문안 생성 완료!');
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
      toast('📅 예약 발행 탭으로 이동했어요!');
    }

    // ===== AI CHAT =====
    const chatHistory = [];

    async function sendChatMessage() {
      const input = document.getElementById('ai-chat-input');
      const msg = input.value.trim();
      if (!msg) return;
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
