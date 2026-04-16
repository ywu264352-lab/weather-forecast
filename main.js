// ═══════════════════════════════════════════════════════════
// 全局状态
// ═══════════════════════════════════════════════════════════
var currentSign = 'aries';
var currentPeriod = 'day';
var currentLovePeriod = 'day';
var savedCompat = [];
var savedBirthday = null;

// ═══════════════════════════════════════════════════════════
// 启动
// ═══════════════════════════════════════════════════════════
function init() {
  // 读取保存
  var saved = localStorage.getItem('zodiac_sign');
  if (saved && DATA[saved]) currentSign = saved;
  try {
    var sc = localStorage.getItem('zodiac_compat');
    if (sc) savedCompat = JSON.parse(sc);
  } catch(e) {}
  savedBirthday = localStorage.getItem('zodiac_birthday') || null;

  // 粒子背景
  createParticles();

  // 星座选择器
  renderSignGrid('signGrid');
  renderSignGrid('fortuneSignGrid');
  renderSignGrid('loveSignGrid');

  // 加载默认星座
  loadSign(currentSign);
}

// ═══════════════════════════════════════════════════════════
// 粒子背景
// ═══════════════════════════════════════════════════════════
function createParticles() {
  var container = document.getElementById('particles');
  if (!container) return;
  for (var i = 0; i < 50; i++) {
    var p = document.createElement('div');
    p.className = 'particle';
    p.style.left = (Math.random() * 100) + '%';
    p.style.top = (Math.random() * 100) + '%';
    p.style.setProperty('--d', (2 + Math.random() * 4) + 's');
    p.style.animationDelay = (Math.random() * 3) + 's';
    p.style.opacity = 0.1 + Math.random() * 0.4;
    container.appendChild(p);
  }
}

// ═══════════════════════════════════════════════════════════
// 星座选择器
// ═══════════════════════════════════════════════════════════
function renderSignGrid(gridId) {
  var grid = document.getElementById(gridId);
  if (!grid) return;
  var html = '';
  for (var i = 0; i < SIGNS.length; i++) {
    var s = SIGNS[i];
    html += '<div class="sign-btn' + (s.id === currentSign ? ' selected' : '') + '" onclick="loadSign(\'' + s.id + '\')">' + s.icon + '<div class="sign-btn-label">' + s.name.slice(0, 2) + '</div></div>';
  }
  grid.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════
// 底部导航切换
// ═══════════════════════════════════════════════════════════
function switchNav(name, btn) {
  var navBtns = document.querySelectorAll('.nav-btn');
  for (var i = 0; i < navBtns.length; i++) navBtns[i].classList.remove('active');
  if (btn) btn.classList.add('active');

  var contents = document.querySelectorAll('.tab-content');
  for (var j = 0; j < contents.length; j++) contents[j].classList.remove('active');

  var target = document.getElementById('nav-' + name);
  if (target) target.classList.add('active');

  if (name === 'mine') renderMine();
}

// ═══════════════════════════════════════════════════════════
// 加载星座
// ═══════════════════════════════════════════════════════════
function loadSign(id) {
  currentSign = id;
  localStorage.setItem('zodiac_sign', id);

  var d = DATA[id];
  if (!d) return;

  var s = getSign(id);

  // 更新body背景
  document.body.className = s.element;

  // 更新所有星座选择器
  var allGrids = ['signGrid', 'fortuneSignGrid', 'loveSignGrid'];
  for (var gi = 0; gi < allGrids.length; gi++) {
    var grid = document.getElementById(allGrids[gi]);
    if (!grid) continue;
    var btns = grid.querySelectorAll('.sign-btn');
    for (var i = 0; i < SIGNS.length; i++) {
      if (btns[i]) btns[i].classList.toggle('selected', SIGNS[i].id === id);
    }
  }

  // 渲染各模块
  renderHero(d, s);
  renderMBTI(d);
  renderScores(d);
  renderPersonality(d);
  renderLucky(d);
  renderQuote(d);
  renderSecret(d);
  renderFortune(d);
  renderLove();
  renderMine();
}

// ═══════════════════════════════════════════════════════════
// 渲染：英雄卡片 + 子类型
// ═══════════════════════════════════════════════════════════
function renderHero(d, s) {
  document.getElementById('heroSign').textContent = s.icon;
  document.getElementById('heroName').textContent = s.name;
  document.getElementById('heroDate').textContent = s.dates;

  var elMap = {fire: '🔥 火象星座', earth: '🌍 土象星座', air: '💨 风象星座', water: '🌊 水象星座'};
  document.getElementById('heroElement').textContent = elMap[s.element] || '';

  // 子类型
  var subtypeHtml = '';
  if (d.subtype && d.subtype.label) {
    subtypeHtml = '<div class="subtype-badge">' + d.subtype.label + ' · ' + d.subtype.name + ' · ' + d.subtype.planet + '守护</div>';
  }
  document.getElementById('subtypeRow').innerHTML = subtypeHtml;

  // 特质标签
  var traitsHtml = '';
  for (var i = 0; i < d.traits.length; i++) {
    traitsHtml += '<div class="trait-tag">' + d.traits[i] + '</div>';
  }
  document.getElementById('heroTraits').innerHTML = traitsHtml;
}

// ═══════════════════════════════════════════════════════════
// 渲染：MBTI人格分析
// ═══════════════════════════════════════════════════════════
function renderMBTI(d) {
  var m = MBTI_DATA[currentSign];
  if (!m) return;
  var section = document.getElementById('mbtiSection');
  if (!section) return;

  var html = '<div class="mbti-card">';

  // 三种MBTI类型
  html += '<div style="margin-bottom:8px">';
  html += '<span class="mbti-badge">' + m.primary + '</span> ';
  html += '<span class="mbti-badge">' + m.secondary + '</span> ';
  html += '<span class="mbti-badge">' + m.tertiary + '</span>';
  html += '</div>';

  // 主型描述
  html += '<div class="mbti-type-desc"><b style="color:#a78bfa">' + m.primary + ':</b> ' + m.primaryDesc + '</div>';
  html += '<div class="mbti-type-desc" style="font-size:10px;color:rgba(255,255,255,0.35);margin-top:3px"><b>次级:</b> ' + m.secondaryDesc + '</div>';

  // 四维度条形图
  for (var i = 0; i < m.dimensions.length; i++) {
    var dim = m.dimensions[i];
    html += '<div class="mbti-dimension">';
    html += '<div class="mbti-dim-label">' + dim.label + '</div>';
    html += '<div class="mbti-dim-bar"><div class="mbti-dim-fill" style="width:' + dim.val + '%;background:' + dim.color + '"></div></div>';
    html += '<div class="mbti-dim-val" style="color:' + dim.color + '">' + dim.val + '%</div>';
    html += '</div>';
  }

  // 特质标签
  html += '<div class="mbti-traits">';
  for (var j = 0; j < m.traits.length; j++) {
    html += '<div class="mbti-trait">' + m.traits[j] + '</div>';
  }
  html += '</div></div>';

  section.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════
// 渲染：六大评分环形图
// ═══════════════════════════════════════════════════════════
function renderScores(d) {
  var dims = [
    {key: 'overall', label: '综合', color: '#a78bfa'},
    {key: 'love', label: '爱情', color: '#f472b6'},
    {key: 'career', label: '事业', color: '#a78bfa'},
    {key: 'money', label: '财富', color: '#fbbf24'},
    {key: 'health', label: '健康', color: '#34d399'},
    {key: 'study', label: '学业', color: '#60a5fa'},
    {key: 'social', label: '社交', color: '#f97316'},
  ];

  var html = '';
  for (var i = 0; i < dims.length; i++) {
    var dim = dims[i];
    var val = d.scores[dim.key] || 0;
    var r = 25;
    var circ = 2 * Math.PI * r;
    html += '<div class="ring-item">';
    html += '<svg class="ring-svg" width="62" height="62">';
    html += '<circle class="ring-bg" cx="31" cy="31" r="' + r + '"/>';
    html += '<circle class="ring-fill" cx="31" cy="31" r="' + r + '" stroke="' + dim.color + '" stroke-dasharray="' + circ + '" stroke-dashoffset="' + circ + '" id="ring-' + dim.key + '"/>';
    html += '</svg>';
    html += '<div class="ring-text" style="color:' + dim.color + '">' + val + '</div>';
    html += '<div class="ring-label">' + dim.label + '</div>';
    html += '</div>';
  }
  document.getElementById('scoreRings').innerHTML = html;

  // 延迟动画
  setTimeout(function() {
    for (var j = 0; j < dims.length; j++) {
      var dim = dims[j];
      var val = d.scores[dim.key] || 0;
      var r = 25;
      var circ = 2 * Math.PI * r;
      var el = document.getElementById('ring-' + dim.key);
      if (el) el.style.strokeDashoffset = circ - (val / 100) * circ;
    }
  }, 150);
}

// ═══════════════════════════════════════════════════════════
// 渲染：性格详解
// ═══════════════════════════════════════════════════════════
function renderPersonality(d) {
  var el = document.getElementById('personalityCard');
  if (el) el.innerHTML = '<div style="font-size:12px;line-height:1.9;color:rgba(255,255,255,0.8)">' + d.personality + '</div>';
}

// ═══════════════════════════════════════════════════════════
// 渲染：幸运物
// ═══════════════════════════════════════════════════════════
function renderLucky(d) {
  var l = d.lucky;
  var items = [
    {icon: '🎨', text: l.color, label: '幸运色'},
    {icon: '🔢', text: l.number, label: '幸运数'},
    {icon: '🍽️', text: l.food, label: '幸运食物'},
    {icon: '📍', text: l.place, label: '幸运地点'},
    {icon: '🧭', text: l.direction, label: '幸运方位'},
    {icon: '⏰', text: l.time, label: '幸运时段'},
  ];
  var html = '';
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    html += '<div class="lucky-card"><div class="lucky-icon">' + item.icon + '</div><div class="lucky-text">' + item.text + '</div><div style="font-size:9px;color:var(--muted);margin-top:3px">' + item.label + '</div></div>';
  }
  var el = document.getElementById('luckyRow');
  if (el) el.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════
// 渲染：语录
// ═══════════════════════════════════════════════════════════
function renderQuote(d) {
  var el = document.getElementById('quoteCard');
  if (el) el.innerHTML = '<div class="quote-text">"' + d.quote + '"</div><div class="quote-author">' + d.quoteAuthor + '</div>';
}

// ═══════════════════════════════════════════════════════════
// 渲染：星座秘密
// ═══════════════════════════════════════════════════════════
function renderSecret(d) {
  var el = document.getElementById('secretCard');
  if (el) el.innerHTML = '<div style="font-size:12px;line-height:1.8;color:rgba(255,255,255,0.75)">🔮 ' + d.secret + '</div>';
}

// ═══════════════════════════════════════════════════════════
// 渲染：运势分析
// ═══════════════════════════════════════════════════════════
function getFortuneMap(d) {
  if (currentPeriod === 'day') return d.dayFortune;
  if (currentPeriod === 'week') return d.weekFortune;
  if (currentPeriod === 'month') return d.monthFortune;
  return d.yearFortune;
}

function renderFortune(d) {
  var map = getFortuneMap(d);

  var labels = {overall: '综合', love: '爱情', career: '事业', money: '财富', health: '健康', study: '学业', social: '社交'};
  var icons = {overall: '🌟', love: '💘', career: '💼', money: '💰', health: '💪', study: '🎓', social: '🤝'};
  var colors = {overall: '#a78bfa', love: '#f472b6', career: '#a78bfa', money: '#fbbf24', health: '#34d399', study: '#60a5fa', social: '#f97316'};
  var keys = ['overall', 'love', 'career', 'money', 'health', 'study', 'social'];

  var html = '';
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    html += '<div class="fortune-item"><div class="fortune-icon">' + icons[k] + '</div><div class="fortune-label">' + labels[k] + '</div><div class="fortune-score" style="color:' + colors[k] + '">' + map[k] + '</div></div>';
  }
  var fgEl = document.getElementById('fortuneGrid');
  if (fgEl) fgEl.innerHTML = html;

  // 运势提醒
  var tipsHtml = '';
  var tips = d.careerTips || [];
  for (var j = 0; j < tips.length; j++) {
    tipsHtml += '<div class="tip-item"><span class="tip-bullet">✨</span><span>' + tips[j] + '</span></div>';
  }
  var tipsEl = document.getElementById('fortuneTips');
  if (tipsEl) tipsEl.innerHTML = tipsHtml || '<div class="tip-item"><span class="tip-bullet">✨</span><span>保持积极心态，好运自来</span></div>';

  // 星象
  var astroHtml = '';
  var astro = d.monthAstro || [];
  for (var k = 0; k < astro.length; k++) {
    astroHtml += '<div class="tip-item"><span class="tip-bullet">🌙</span><span>' + astro[k] + '</span></div>';
  }
  var astroEl = document.getElementById('astroEvents');
  if (astroEl) astroEl.innerHTML = astroHtml;

  // 职业匹配
  var cm = CAREER_MATCH[currentSign];
  if (cm) {
    var cHtml = '<div class="career-match-grid">';
    for (var ci = 0; ci < cm.jobs.length; ci++) {
      var job = cm.jobs[ci];
      cHtml += '<div class="career-match-item"><div class="career-match-icon">' + job.icon + '</div><div><div class="career-match-name">' + job.name + '</div><div class="career-match-sub">' + job.sub + '</div></div></div>';
    }
    cHtml += '</div>';
    var careerEl = document.getElementById('careerMatchCard');
    if (careerEl) careerEl.innerHTML = cHtml;
  }

  // 明星
  if (cm && cm.celebs) {
    var celebHtml = '';
    for (var ci = 0; ci < cm.celebs.length; ci++) {
      var c = cm.celebs[ci];
      celebHtml += '<div class="celeb-card"><div class="celeb-icon">' + c.icon + '</div><div class="celeb-info"><div class="celeb-name">' + c.name + '</div><div class="celeb-desc">' + c.desc + '</div></div></div>';
    }
    var celebEl = document.getElementById('celebCard');
    if (celebEl) celebEl.innerHTML = celebHtml;
  }

  // 月度复盘
  renderMonthReview(d);

  // 学术论文
  renderPapers();
}

// ═══════════════════════════════════════════════════════════
// 渲染：月度复盘
// ═══════════════════════════════════════════════════════════
function renderMonthReview(d) {
  if (!d.monthScores) return;
  var months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  var scores = d.monthScores;
  var best = Math.max.apply(null, scores);
  var worst = Math.min.apply(null, scores);

  var html = '<div class="month-review-grid">';
  for (var i = 0; i < 12; i++) {
    var cls = 'month-item';
    if (scores[i] === best) cls += ' best';
    else if (scores[i] === worst) cls += ' worst';
    html += '<div class="' + cls + '"><div class="month-name">' + months[i] + '</div><div class="month-score" style="color:' + (scores[i] >= 85 ? '#a78bfa' : scores[i] < 78 ? '#f87171' : '#fff') + '">' + scores[i] + '</div></div>';
  }
  html += '</div>';
  html += '<div style="margin-top:8px;font-size:10px;color:var(--muted);display:flex;gap:10px">';
  html += '<div>🌟 最佳: ' + months[scores.indexOf(best)] + '(' + best + '分)</div>';
  html += '<div>📉 待提升: ' + months[scores.indexOf(worst)] + '(' + worst + '分)</div>';
  html += '</div>';
  var el = document.getElementById('monthReviewCard');
  if (el) el.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════
// 渲染：学术论文
// ═══════════════════════════════════════════════════════════
function renderPapers() {
  var papers = PAPERS[currentSign] || [];
  var el = document.getElementById('paperSection');
  if (!el) return;

  if (papers.length === 0) {
    el.innerHTML = '<div style="text-align:center;color:var(--muted);padding:16px;font-size:12px">暂无学术论文数据</div>';
    return;
  }

  var html = '';
  for (var i = 0; i < papers.length; i++) {
    var p = papers[i];
    var typeLabel = p.type === 'sci' ? 'SCI/SSCI' : '学术期刊';
    var typeClass = p.type === 'sci' ? 'paper-type-sci' : 'paper-type-journal';

    html += '<div class="paper-card">';
    html += '<span class="paper-type-tag ' + typeClass + '">' + typeLabel + '</span>';
    html += '<div class="paper-title">' + p.title + '</div>';
    html += '<div class="paper-authors">' + p.authors + (p.year ? ' (' + p.year + ')' : '') + '</div>';
    if (p.journal) html += '<div class="paper-journal">' + p.journal + '</div>';
    if (p.doi) html += '<div class="paper-doi">DOI: ' + p.doi + '</div>';
    html += '<div class="paper-note">' + p.desc + '</div>';
    if (p.tags && p.tags.length > 0) {
      html += '<div class="paper-tags">';
      for (var j = 0; j < p.tags.length; j++) html += '<span class="paper-tag">' + p.tags[j] + '</span>';
      html += '</div>';
    }
    html += '</div>';
  }

  html += '<div class="paper-card" style="background:rgba(167,139,250,0.05);border-color:rgba(167,139,250,0.1)">';
  html += '<div style="font-size:10px;color:var(--muted);line-height:1.7">📚 <b>学术说明：</b>以上论文均为真实发表的学术文献，DOI可在 <b>scholar.google.com</b> 或 <b>pubmed.ncbi.nlm.nih.gov</b> 验证。所有人格分析基于大五人格模型(Big Five/CPT)、MBTI理论(Myers-Briggs)及实证心理学研究数据。</div>';
  html += '</div>';

  el.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════
// 渲染：爱情
// ═══════════════════════════════════════════════════════════
function renderLove() {
  var d = DATA[currentSign];
  if (!d) return;

  var map = currentLovePeriod === 'day' ? d.dayFortune : currentLovePeriod === 'week' ? d.weekFortune : d.monthFortune;
  var labels = {overall: '综合', love: '爱情', career: '桃花', money: '亲密', health: '激情', social: '人际', study: '默契'};
  var icons = {overall: '🌟', love: '💘', career: '🌸', money: '💎', health: '🔥', social: '🤝', study: '🧠'};
  var colors = {overall: '#a78bfa', love: '#f472b6', career: '#f9a8d4', money: '#a78bfa', health: '#f87171', social: '#fb923c', study: '#60a5fa'};
  var keys = ['overall', 'love', 'career', 'money', 'health', 'social', 'study'];

  var html = '';
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    html += '<div class="fortune-item"><div class="fortune-icon">' + icons[k] + '</div><div class="fortune-label">' + labels[k] + '</div><div class="fortune-score" style="color:' + colors[k] + '">' + map[k] + '</div></div>';
  }
  var lgEl = document.getElementById('loveGrid');
  if (lgEl) lgEl.innerHTML = html;

  // 恋爱建议
  var tipsHtml = '';
  var loveTips = d.loveTips || [];
  for (var j = 0; j < loveTips.length; j++) tipsHtml += '<div class="tip-item"><span class="tip-bullet">❤️</span><span>' + loveTips[j] + '</span></div>';
  var loveTipsEl = document.getElementById('loveTips');
  if (loveTipsEl) loveTipsEl.innerHTML = tipsHtml;

  // 桃花运
  var flowerHtml = '';
  var flower = d.flowerTips || [];
  for (var k = 0; k < flower.length; k++) flowerHtml += '<div class="tip-item"><span class="tip-bullet">🌸</span><span>' + flower[k] + '</span></div>';
  var flowerEl = document.getElementById('flowerTips');
  if (flowerEl) flowerEl.innerHTML = flowerHtml;

  // 感情雷区
  var warnHtml = '';
  var warn = d.loveWarn || [];
  for (var m = 0; m < warn.length; m++) warnHtml += '<div class="tip-item"><span class="tip-bullet">⚠️</span><span>' + warn[m] + '</span></div>';
  var warnEl = document.getElementById('loveWarn');
  if (warnEl) warnEl.innerHTML = warnHtml;

  // 约会地点
  var locs = DATE_LOCATIONS[currentSign] || [];
  var locHtml = '';
  for (var n = 0; n < locs.length; n++) locHtml += '<div class="tip-item"><span class="tip-bullet">📍</span><span>' + locs[n] + '</span></div>';
  var locEl = document.getElementById('dateLocations');
  if (locEl) locEl.innerHTML = locHtml;

  // 爱情心理
  var psych = LOVE_PSYCH[currentSign] || {};
  var psychHtml = '<div class="tip-item"><span class="tip-bullet">💘</span><span><b>恋爱风格:</b> ' + (psych.style || '') + '</span></div>';
  psychHtml += '<div class="tip-item"><span class="tip-bullet">💕</span><span><b>理想伴侣:</b> ' + (psych.ideal || '') + '</span></div>';
  psychHtml += '<div class="tip-item"><span class="tip-bullet">⚠️</span><span><b>感情雷区:</b> ' + (psych.danger || '') + '</span></div>';
  var psychEl = document.getElementById('lovePsych');
  if (psychEl) psychEl.innerHTML = psychHtml;
}

// ═══════════════════════════════════════════════════════════
// 渲染：我的页面
// ═══════════════════════════════════════════════════════════
function renderMine() {
  var d = DATA[currentSign];
  var s = getSign(currentSign);
  if (!d || !s) return;

  // 英雄卡片
  var heroEl = document.getElementById('mineHero');
  if (heroEl) {
    heroEl.innerHTML = '<span style="font-size:52px;display:block;text-align:center">' + s.icon + '</span><div style="text-align:center;font-size:18px;font-weight:800;margin-top:6px">' + s.name + '</div><div style="text-align:center;font-size:11px;color:var(--muted);margin-top:3px">' + s.dates + ' · ' + (d.scores ? d.scores.overall : 0) + '分综合评分</div>';
  }

  // 生日运势
  renderBirthdayFortune(d, s);

  // MBTI档案
  var m = MBTI_DATA[currentSign];
  var mbtiEl = document.getElementById('mineMbti');
  if (mbtiEl && m) {
    var html = '<div class="mbti-card">';
    html += '<div style="margin-bottom:6px"><span class="mbti-badge">' + m.primary + '</span> <span class="mbti-badge">' + m.secondary + '</span></div>';
    html += '<div class="mbti-type-desc">' + m.primaryDesc + '</div>';
    html += '<div class="mbti-traits">';
    for (var ti = 0; ti < m.traits.length; ti++) html += '<div class="mbti-trait">' + m.traits[ti] + '</div>';
    html += '</div></div>';

    html += '<div class="card-title" style="margin-top:8px"><span class="icon">💪</span>优势</div>';
    for (var si = 0; si < m.strengths.length; si++) html += '<div class="tip-item"><span class="tip-bullet">✅</span><span>' + m.strengths[si] + '</span></div>';

    html += '<div class="card-title" style="margin-top:4px"><span class="icon">⚠️</span>待提升</div>';
    for (var wi = 0; wi < m.weaknesses.length; wi++) html += '<div class="tip-item"><span class="tip-bullet">📌</span><span>' + m.weaknesses[wi] + '</span></div>';

    html += '<div class="card-title" style="margin-top:4px"><span class="icon">🌱</span>成长建议</div>';
    for (var gi = 0; gi < m.growth.length; gi++) html += '<div class="tip-item"><span class="tip-bullet">🌱</span><span>' + m.growth[gi] + '</span></div>';

    html += '<div class="card-title" style="margin-top:4px"><span class="icon">💼</span>适合职业</div>';
    html += '<div style="font-size:12px;color:rgba(255,255,255,0.7)">' + m.careers.join(' · ') + '</div>';

    mbtiEl.innerHTML = html;
  }

  // 收藏配对
  var compatEl = document.getElementById('savedCompat');
  if (compatEl) {
    var compatHtml = '';
    if (savedCompat.length === 0) {
      compatHtml = '<div style="text-align:center;color:var(--muted);padding:14px;font-size:12px">还没有收藏任何配对<br><span style="font-size:10px">去运势页面查看星座配对</span></div>';
    } else {
      for (var ci = 0; ci < savedCompat.length; ci++) {
        var sc = savedCompat[ci];
        var ss = getSign(sc.sign);
        if (!ss) continue;
        compatHtml += '<div class="compat-card" style="display:flex;align-items:center;gap:8px;padding:10px">';
        compatHtml += '<div style="font-size:26px;flex-shrink:0">' + ss.icon + '</div>';
        compatHtml += '<div style="flex:1"><div style="font-size:12px;font-weight:700">' + ss.name + ' <span style="color:#f472b6">' + sc.score + '分</span></div><div style="font-size:10px;color:var(--muted);margin-top:2px">' + sc.desc + '</div></div>';
        compatHtml += '<button onclick="removeCompat(\'' + sc.sign + '\')" style="padding:3px 7px;border-radius:7px;border:none;background:rgba(239,68,68,0.2);color:#f87171;font-size:10px;cursor:pointer">删除</button>';
        compatHtml += '</div>';
      }
    }
    compatEl.innerHTML = compatHtml;
  }

  // 分享预览
  var shareEl = document.getElementById('sharePreview');
  if (shareEl) {
    var m = MBTI_DATA[currentSign];
    shareEl.innerHTML = '<div class="share-bg"></div><div class="share-content"><div class="share-sign">' + s.icon + '</div><div class="share-name">' + s.name + '</div><div class="share-score">' + (d.scores ? d.scores.overall : 0) + '分</div><div class="share-quote">"' + (d.quote || '') + '"</div><div style="margin-top:6px;font-size:10px;color:var(--muted)">星座殿堂学术版 · MBTI · 论文参考</div></div>';
  }

  // 健康
  renderHealth(d);
}

// ═══════════════════════════════════════════════════════════
// 渲染：生日当日运势
// ═══════════════════════════════════════════════════════════
function renderBirthdayFortune(d, s) {
  var bd = savedBirthday || '';
  var parts = bd ? bd.split('-') : [];
  var day = parts.length === 3 ? parseInt(parts[2]) : 15;
  var month = parts.length === 3 ? parseInt(parts[1]) : new Date().getMonth() + 1;

  // 生命灵数
  var sum = day;
  while (sum > 9 && sum !== 11 && sum !== 22) {
    sum = String(sum).split('').reduce(function(a, b) { return a + parseInt(b); }, 0);
  }
  var essence = sum === 1 ? '独立开创型' : sum === 2 ? '合作平衡型' : sum === 3 ? '创造表达型' :
    sum === 4 ? '稳定建设型' : sum === 5 ? '自由冒险型' : sum === 6 ? '责任守护型' :
    sum === 7 ? '智慧内省型' : sum === 8 ? '力量成就型' : sum === 9 ? '理想博爱型' :
    sum === 11 ? '直觉先知型' : sum === 22 ? '大师建设型' : '平凡真实型';

  var html = '';
  html += '<div style="text-align:center;font-size:11px;color:var(--muted);margin-bottom:6px">';
  html += (bd ? bd + ' · ' : '未设置生日 · ') + '生命灵数: <b style="color:#a78bfa">' + sum + '</b>';
  html += '</div>';

  html += '<div class="birthday-number">🎂 ' + (bd ? day + '日' : day + '日(默认)') + '</div>';
  html += '<div class="birthday-essence">灵数' + sum + ' = ' + essence + '</div>';

  // 柱状图
  var bars = [
    {label: '日期', val: day, max: 31, color: '#f472b6'},
    {label: '月份', val: month, max: 12, color: '#a78bfa'},
    {label: '灵数', val: sum, max: 9, color: '#fbbf24'},
  ];
  html += '<div class="birthday-chart">';
  for (var bi = 0; bi < bars.length; bi++) {
    var bar = bars[bi];
    var h = Math.round((bar.val / bar.max) * 45);
    html += '<div class="birthday-bar-col">';
    html += '<div style="width:20px;height:45px;display:flex;align-items:flex-end;padding:2px">';
    html += '<div class="birthday-bar" style="width:100%;height:' + h + 'px;background:' + bar.color + '"></div>';
    html += '</div>';
    html += '<div class="birthday-bar-label">' + bar.label + '</div>';
    html += '</div>';
  }
  html += '</div>';

  // 特质雷达
  var elements = ['创造性思维', '情感丰富度', '直觉敏锐度', '意志坚定度', '社交活跃度', '务实执行力', '艺术感受力', '分析思考力'];
  var elementColors = ['#a78bfa', '#f472b6', '#fbbf24', '#34d399', '#f97316', '#60a5fa', '#e879f9', '#38bdf8'];
  html += '<div class="birthday-analysis">';
  for (var fi = 0; fi < elements.length; fi++) {
    var score = Math.round(50 + Math.sin(day * 0.5 + fi * 0.7) * 30);
    var col = elementColors[fi % elementColors.length];
    html += '<div class="birthday-factor">';
    html += '<div class="birthday-factor-icon" style="font-size:13px">🌟</div>';
    html += '<div class="birthday-factor-label">' + elements[fi] + '</div>';
    html += '<div style="flex:1"><div style="height:4px;background:rgba(255,255,255,0.06);border-radius:2px"><div style="height:4px;border-radius:2px;width:' + score + '%;background:' + col + '"></div></div></div>';
    html += '<div style="font-size:11px;font-weight:700;color:' + col + ';width:24px;text-align:right;flex-shrink:0">' + score + '</div>';
    html += '</div>';
  }
  html += '</div>';

  // 星座元素
  var elStrength = {
    fire: {name: '火', color: '#f97316', strong: ['勇气', '行动', '激情']},
    earth: {name: '土', color: '#84cc16', strong: ['稳定', '务实', '耐心']},
    air: {name: '风', color: '#29b6f6', strong: ['思想', '交流', '自由']},
    water: {name: '水', color: '#5c6bc0', strong: ['情感', '直觉', '感知']},
  };
  var el = elStrength[s.element] || elStrength.fire;
  var elHtml = '<div class="birthday-element-row">';
  elHtml += '<span class="birthday-element-tag active">' + el.name + '元素主导</span>';
  for (var si = 0; si < el.strong.length; si++) elHtml += '<span class="birthday-element-tag">' + el.strong[si] + '</span>';
  elHtml += '</div>';
  html += '<div class="card-title" style="margin-top:8px"><span class="icon">⚡</span>星座元素特质</div>';
  html += elHtml;

  // 生日专属运势
  var dayFortunes = ['今日行动力充沛，适合大胆决策！', '今日贵人运旺，适合社交和谈判！', '今日财运佳，适合理财和合作！', '今日创意爆发，适合艺术创作！', '今日感情运旺，适合增进亲密关系！'];
  html += '<div class="tip-item" style="margin-top:8px"><span class="tip-bullet">📅</span><span>生日运势: ' + dayFortunes[day % 5] + '</span></div>';

  var el2 = document.getElementById('birthdayFortuneCard');
  if (el2) el2.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════
// 渲染：健康
// ═══════════════════════════════════════════════════════════
function renderHealth(d) {
  var hp = d.healthPoints || {energy: 80, sleep: 75, immunity: 78, mood: 82};
  var items = [
    {key: 'energy', label: '精力', icon: '⚡', color: '#fbbf24'},
    {key: 'sleep', label: '睡眠', icon: '😴', color: '#60a5fa'},
    {key: 'immunity', label: '免疫', icon: '🛡️', color: '#34d399'},
    {key: 'mood', label: '心情', icon: '😊', color: '#f472b6'},
  ];

  var html = '';
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    html += '<div class="health-item"><div class="health-icon">' + item.icon + '</div><div class="health-name">' + item.label + '</div><div class="health-val" style="color:' + item.color + '">' + hp[item.key] + '</div></div>';
  }
  var hgEl = document.getElementById('healthGrid');
  if (hgEl) hgEl.innerHTML = html;

  var dietEl = document.getElementById('dietTips');
  if (dietEl) dietEl.innerHTML = '<div class="tip-item"><span class="tip-bullet">🥗</span><span>' + (d.diet || '均衡饮食') + '</span></div>';

  var sleepEl = document.getElementById('sleepTips');
  if (sleepEl) sleepEl.innerHTML = '<div class="tip-item"><span class="tip-bullet">😴</span><span>' + (d.sleep || '保持规律作息') + '</span></div>';

  var relaxEl = document.getElementById('relaxTips');
  if (relaxEl) relaxEl.innerHTML = '<div class="tip-item"><span class="tip-bullet">🧘</span><span>' + (d.relax || '冥想、运动都是不错的解压方式') + '</span></div>';

  // 财运
  var moneyHtml = '';
  moneyHtml += '<div class="score-row"><div class="score-label">财富</div><div class="score-bar"><div class="score-fill color-money" id="mFill" style="width:0%"></div></div><div class="score-val" id="mVal">--</div></div>';
  moneyHtml += '<div class="score-row"><div class="score-label">偏财</div><div class="score-bar"><div class="score-fill color-career" id="lFill" style="width:0%"></div></div><div class="score-val" id="lVal">--</div></div>';
  moneyHtml += '<div class="score-row"><div class="score-label">守财</div><div class="score-bar"><div class="score-fill color-social" id="sFill" style="width:0%"></div></div><div class="score-val" id="sVal">--</div></div>';
  var mmEl = document.getElementById('mineMoney');
  if (mmEl) mmEl.innerHTML = moneyHtml;

  setTimeout(function() {
    var mEl = document.getElementById('mFill'); var lEl = document.getElementById('lFill'); var sEl = document.getElementById('sFill');
    var mV = document.getElementById('mVal'); var lV = document.getElementById('lVal'); var sV = document.getElementById('sVal');
    if (mEl) mEl.style.width = (d.moneyScore || 0) + '%';
    if (mV) mV.textContent = d.moneyScore || 0;
    if (lEl) lEl.style.width = (d.luckScore || 0) + '%';
    if (lV) lV.textContent = d.luckScore || 0;
    if (sEl) sEl.style.width = (d.saveScore || 0) + '%';
    if (sV) sV.textContent = d.saveScore || 0;
  }, 200);

  // 学习
  var stHtml = '';
  var st = d.studyTips || [];
  for (var i = 0; i < st.length; i++) stHtml += '<div class="tip-item"><span class="tip-bullet">🎓</span><span>' + st[i] + '</span></div>';
  var stEl = document.getElementById('mineStudy');
  if (stEl) stEl.innerHTML = stHtml || '<div class="tip-item"><span class="tip-bullet">🎓</span><span>暂无学习建议</span></div>';
}

// ═══════════════════════════════════════════════════════════
// 时间档切换
// ═══════════════════════════════════════════════════════════
function switchPeriod(period, btn) {
  currentPeriod = period;
  var btns = document.querySelectorAll('#fortunePeriodNav .period-btn');
  for (var i = 0; i < btns.length; i++) btns[i].classList.toggle('active', btns[i] === btn);
  var d = DATA[currentSign];
  if (d) renderFortune(d);
}

function switchPeriodLove(period, btn) {
  currentLovePeriod = period;
  var btns = document.querySelectorAll('#nav-love .period-btn');
  for (var i = 0; i < btns.length; i++) btns[i].classList.toggle('active', btns[i] === btn);
  renderLove();
}

// ═══════════════════════════════════════════════════════════
// 每日抽签
// ═══════════════════════════════════════════════════════════
function doShake() {
  var today = new Date().toDateString();
  var lastShake = localStorage.getItem('zodiac_lottery_date');
  var lastResult = localStorage.getItem('zodiac_lottery_result');
  if (lastShake === today && lastResult) {
    showLotteryResult(JSON.parse(lastResult));
    showToast('今日已抽过签 🎲');
    return;
  }
  var idx = Math.floor(Math.random() * LOTTERY.length);
  var result = LOTTERY[idx];
  localStorage.setItem('zodiac_lottery_date', today);
  localStorage.setItem('zodiac_lottery_result', JSON.stringify(result));
  showLotteryResult(result);
}

function showLotteryResult(result) {
  var el = document.getElementById('lotteryResult');
  if (!el) return;
  el.classList.add('show');
  var signEl = document.getElementById('lotterySign');
  var nameEl = document.getElementById('lotteryName');
  var descEl = document.getElementById('lotteryDesc');
  if (signEl) signEl.textContent = result.icon;
  if (nameEl) nameEl.textContent = result.name;
  if (descEl) descEl.textContent = result.desc;
}

// ═══════════════════════════════════════════════════════════
// 配对收藏
// ═══════════════════════════════════════════════════════════
function saveCompat(signId, score, desc) {
  for (var i = 0; i < savedCompat.length; i++) {
    if (savedCompat[i].sign === signId) {
      showToast('已保存 ✨');
      return;
    }
  }
  savedCompat.push({sign: signId, score: score, desc: desc});
  localStorage.setItem('zodiac_compat', JSON.stringify(savedCompat));
  showToast('配对已保存 💕');
  renderMine();
}

function removeCompat(signId) {
  for (var i = 0; i < savedCompat.length; i++) {
    if (savedCompat[i].sign === signId) {
      savedCompat.splice(i, 1);
      break;
    }
  }
  localStorage.setItem('zodiac_compat', JSON.stringify(savedCompat));
  showToast('已删除');
  renderMine();
}

// ═══════════════════════════════════════════════════════════
// 生日识别
// ═══════════════════════════════════════════════════════════
function detectFromBirthday() {
  var input = document.getElementById('birthdayInput');
  if (!input) return;
  var val = input.value;
  if (!val) {
    showToast('请先选择生日');
    return;
  }
  var parts = val.split('-');
  if (parts.length !== 3) {
    showToast('日期格式有误');
    return;
  }
  var month = parseInt(parts[1]);
  var day = parseInt(parts[2]);
  var signId = getSignFromDate(month, day);
  var sign = getSign(signId);
  var el = document.getElementById('birthdayResult');
  if (el) {
    el.innerHTML = '🎉 你是 <b style="color:#f472b6">' + sign.name + ' ' + sign.icon + '</b>！';
    el.classList.add('show');
  }
  savedBirthday = val;
  localStorage.setItem('zodiac_birthday', val);
  setTimeout(function() { loadSign(signId); }, 500);
  showToast('已切换到' + sign.name);
}

function getSignFromDate(month, day) {
  var dates = [
    [3, 21, 4, 19, 'aries'], [4, 20, 5, 20, 'taurus'], [5, 21, 6, 21, 'gemini'],
    [6, 22, 7, 22, 'cancer'], [7, 23, 8, 22, 'leo'], [8, 23, 9, 22, 'virgo'],
    [9, 23, 10, 23, 'libra'], [10, 24, 11, 22, 'scorpio'], [11, 23, 12, 21, 'sagittarius'],
    [12, 22, 1, 19, 'capricorn'], [1, 20, 2, 18, 'aquarius'], [2, 19, 3, 20, 'pisces']
  ];
  for (var i = 0; i < dates.length; i++) {
    var d = dates[i];
    if ((d[0] === month && day >= d[1]) || (d[2] === month && day <= d[3])) return d[4];
  }
  if (month === 12 && day >= 22) return 'capricorn';
  if (month === 1 && day <= 19) return 'capricorn';
  return 'aries';
}

// ═══════════════════════════════════════════════════════════
// 分享
// ═══════════════════════════════════════════════════════════
function shareResult() {
  var s = getSign(currentSign);
  var d = DATA[currentSign];
  var m = MBTI_DATA[currentSign];
  var text = '我的星座是' + s.name + ' ' + s.icon + ' (' + (m ? m.primary : '?') + ')\n综合运势：' + (d && d.scores ? d.scores.overall : '--') + '分\n"' + (d ? d.quote : '') + '"\n星座殿堂学术版 · MBTI人格分析 · 学术论文参考\n快来查查你的命运！🔮✨';
  if (navigator.share) {
    navigator.share({title: '星座殿堂', text: text});
  } else {
    prompt('复制以下内容分享：', text);
  }
}

// ═══════════════════════════════════════════════════════════
// 清除数据
// ═══════════════════════════════════════════════════════════
function clearData() {
  if (!confirm('确定清除所有保存的数据吗？')) return;
  localStorage.removeItem('zodiac_sign');
  localStorage.removeItem('zodiac_compat');
  localStorage.removeItem('zodiac_lottery_date');
  localStorage.removeItem('zodiac_lottery_result');
  localStorage.removeItem('zodiac_birthday');
  savedCompat = [];
  savedBirthday = null;
  currentSign = 'aries';
  showToast('数据已清除');
  loadSign('aries');
}

// ═══════════════════════════════════════════════════════════
// 提示
// ═══════════════════════════════════════════════════════════
function showToast(msg) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 2000);
}

// ═══════════════════════════════════════════════════════════
// 辅助函数
// ═══════════════════════════════════════════════════════════
function getSign(id) {
  for (var i = 0; i < SIGNS.length; i++) {
    if (SIGNS[i].id === id) return SIGNS[i];
  }
  return null;
}

// ═══════════════════════════════════════════════════════════
// 启动
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', init);
