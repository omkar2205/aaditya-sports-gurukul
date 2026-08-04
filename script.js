const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');

const closeMenu = () => {
  navigation?.classList.remove('open');
  menuToggle?.classList.remove('active');
  menuToggle?.setAttribute('aria-expanded', 'false');
};

menuToggle?.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menuToggle.classList.toggle('active', open);
  menuToggle.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.site-nav a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 18), { passive: true });
window.addEventListener('resize', () => { if (window.innerWidth > 860) closeMenu(); });

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.11 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

document.querySelectorAll('[data-scroll-demo]').forEach((button) => {
  button.addEventListener('click', () => document.querySelector('#demo')?.scrollIntoView({ behavior: 'smooth' }));
});

const roleData = {
  athlete: {
    name: 'Aarav Rao',
    type: 'Athlete account',
    eyebrow: 'ATHLETE DASHBOARD',
    title: 'Good morning, Aarav.',
    action: 'Upload performance',
    nav: [['⌂', 'Overview'], ['◎', 'Find coaches'], ['▣', 'Performance'], ['↗', 'Progress'], ['★', 'Opportunities']],
    modal: ['AI', 'Performance uploaded', 'A sample training video was added to Aarav’s profile. The prototype generated a simulated performance summary and coach recommendations.'],
    content: `
      <div class="dash-grid">
        <article class="dash-card metric-card"><span>Performance score</span><b>78</b><small>↑ 6 points this month</small></article>
        <article class="dash-card metric-card"><span>Coach matches</span><b>12</b><small>3 highly recommended</small></article>
        <article class="dash-card metric-card"><span>Sessions</span><b>08</b><small>2 scheduled this week</small></article>
        <article class="dash-card metric-card"><span>Profile views</span><b>46</b><small>Academies & scouts</small></article>
        <article class="dash-card wide-card"><h4>Performance intelligence</h4><div class="progress-list"><div class="progress-row"><span>Footwork</span><b>82</b><i style="--value:82%"></i></div><div class="progress-row"><span>Reaction speed</span><b>76</b><i style="--value:76%"></i></div><div class="progress-row"><span>Balance</span><b>74</b><i style="--value:74%"></i></div><div class="progress-row"><span>Shot consistency</span><b>69</b><i style="--value:69%"></i></div></div></article>
        <article class="dash-card side-card"><h4>Recommended coaches</h4><div class="coach-list"><div class="coach-row"><div class="mini-avatar">MK</div><div><b>Meera Kulkarni</b><small>Badminton • Pune • 4.9★</small></div><span>96% match</span></div><div class="coach-row"><div class="mini-avatar">AS</div><div><b>Arjun Shah</b><small>Strength & agility • Online</small></div><span>91% match</span></div><div class="coach-row"><div class="mini-avatar">RN</div><div><b>Ravi Nair</b><small>Badminton • Mumbai • 4.8★</small></div><span>87% match</span></div></div></article>
        <article class="dash-card full-card callout-card"><h4>Next improvement priority</h4><p>Work on recovery after the backhand corner. The prototype recommends a 15-minute footwork routine before the next recorded session.</p><button type="button" class="js-demo-inline">Open training plan</button></article>
      </div>`
  },
  coach: {
    name: 'Coach Meera',
    type: 'Verified coach',
    eyebrow: 'COACH DASHBOARD',
    title: 'Your athletes are progressing.',
    action: 'Review new athlete',
    nav: [['⌂', 'Overview'], ['A', 'Athletes'], ['▣', 'Reviews'], ['□', 'Sessions'], ['₹', 'Earnings']],
    modal: ['C', 'New athlete reviewed', 'The prototype opened a sample athlete profile with goals, performance metrics and uploaded footage ready for coach feedback.'],
    content: `
      <div class="dash-grid">
        <article class="dash-card metric-card"><span>Active athletes</span><b>24</b><small>5 joined this month</small></article>
        <article class="dash-card metric-card"><span>Upcoming sessions</span><b>09</b><small>Across 4 days</small></article>
        <article class="dash-card metric-card"><span>Average rating</span><b>4.9</b><small>Verified reviews</small></article>
        <article class="dash-card metric-card"><span>Monthly earnings</span><b>₹62K</b><small>Demo estimate</small></article>
        <article class="dash-card wide-card"><h4>Athlete progress overview</h4><div class="activity-chart"><i style="--value:42%"></i><i style="--value:55%"></i><i style="--value:48%"></i><i style="--value:72%"></i><i style="--value:64%"></i><i style="--value:82%"></i><i style="--value:78%"></i><i style="--value:91%"></i></div></article>
        <article class="dash-card side-card"><h4>Needs your review</h4><div class="talent-list"><div class="talent-row"><div class="mini-avatar">AR</div><div><b>Aarav Rao</b><small>Badminton • New upload</small></div><span>Review</span></div><div class="talent-row"><div class="mini-avatar">SK</div><div><b>Sana Khan</b><small>Athletics • Weekly check-in</small></div><span>Review</span></div><div class="talent-row"><div class="mini-avatar">VN</div><div><b>Vihaan N.</b><small>Cricket • Goal update</small></div><span>Review</span></div></div></article>
        <article class="dash-card full-card callout-card"><h4>Grow your coaching practice</h4><p>Your verified profile is appearing in athlete searches for Pune, Mumbai and online coaching. Add two more availability slots to increase matches.</p><button type="button" class="js-demo-inline">Update availability</button></article>
      </div>`
  },
  school: {
    name: 'Rising Stars School',
    type: 'Institution account',
    eyebrow: 'SCHOOL & ACADEMY DASHBOARD',
    title: 'Track every athlete in one place.',
    action: 'Invite athletes',
    nav: [['⌂', 'Overview'], ['A', 'Athletes'], ['C', 'Coaches'], ['▣', 'Reports'], ['★', 'Scholarships']],
    modal: ['S', 'Athlete invitations ready', 'The prototype prepared sample invitations for the school’s sports programme and connected them to a shared development dashboard.'],
    content: `
      <div class="dash-grid">
        <article class="dash-card metric-card"><span>Athletes enrolled</span><b>186</b><small>Across 6 sports</small></article>
        <article class="dash-card metric-card"><span>Verified coaches</span><b>14</b><small>School network</small></article>
        <article class="dash-card metric-card"><span>Reports completed</span><b>82%</b><small>This term</small></article>
        <article class="dash-card metric-card"><span>Talent watchlist</span><b>17</b><small>High-potential athletes</small></article>
        <article class="dash-card wide-card"><h4>Participation by sport</h4><div class="activity-chart"><i style="--value:82%"></i><i style="--value:64%"></i><i style="--value:55%"></i><i style="--value:48%"></i><i style="--value:35%"></i><i style="--value:28%"></i></div></article>
        <article class="dash-card side-card"><h4>Top development signals</h4><div class="talent-list"><div class="talent-row"><div class="mini-avatar">SP</div><div><b>Speed progression</b><small>23 athletes improving rapidly</small></div><span>View</span></div><div class="talent-row"><div class="mini-avatar">CS</div><div><b>Consistency</b><small>18 athletes above benchmark</small></div><span>View</span></div><div class="talent-row"><div class="mini-avatar">TR</div><div><b>Training regularity</b><small>91% attendance this month</small></div><span>View</span></div></div></article>
        <article class="dash-card full-card callout-card"><h4>Partnership opportunity</h4><p>Create a verified school profile, manage coaches, monitor progress and share selected athletes with scholarship or academy partners.</p><button type="button" class="js-demo-inline">Generate term report</button></article>
      </div>`
  },
  scout: {
    name: 'National Talent Desk',
    type: 'Scout account',
    eyebrow: 'SCOUT DISCOVERY DASHBOARD',
    title: 'Find verified talent faster.',
    action: 'Search athletes',
    nav: [['⌂', 'Discover'], ['⌕', 'Advanced search'], ['★', 'Watchlist'], ['▣', 'Reports'], ['✓', 'Verified profiles']],
    modal: ['◎', 'Athlete search opened', 'The prototype applied sample filters for sport, age, location and performance score to surface verified athlete profiles.'],
    content: `
      <div class="dash-grid">
        <article class="dash-card metric-card"><span>Verified profiles</span><b>2.4K</b><small>Demo network</small></article>
        <article class="dash-card metric-card"><span>New this week</span><b>128</b><small>Across 9 sports</small></article>
        <article class="dash-card metric-card"><span>Watchlist</span><b>36</b><small>Saved prospects</small></article>
        <article class="dash-card metric-card"><span>Reports viewed</span><b>84</b><small>This month</small></article>
        <article class="dash-card wide-card"><h4>Recommended athlete profiles</h4><div class="talent-list"><div class="talent-row"><div class="mini-avatar">AR</div><div><b>Aarav Rao • Badminton</b><small>U-16 • Pune • Performance 78</small></div><span>Verified</span></div><div class="talent-row"><div class="mini-avatar">SK</div><div><b>Sana Khan • Athletics</b><small>U-18 • Hisar • Performance 84</small></div><span>Verified</span></div><div class="talent-row"><div class="mini-avatar">VN</div><div><b>Vihaan Nair • Cricket</b><small>U-14 • Kochi • Performance 81</small></div><span>Verified</span></div><div class="talent-row"><div class="mini-avatar">RP</div><div><b>Riya Patel • Football</b><small>U-17 • Surat • Performance 79</small></div><span>Verified</span></div></div></article>
        <article class="dash-card side-card"><h4>Search filters</h4><div class="progress-list"><div class="progress-row"><span>Sport</span><b>Badminton</b><i style="--value:100%"></i></div><div class="progress-row"><span>Age group</span><b>U-16</b><i style="--value:75%"></i></div><div class="progress-row"><span>Performance</span><b>70+</b><i style="--value:70%"></i></div><div class="progress-row"><span>Profile status</span><b>Verified</b><i style="--value:100%"></i></div></div></article>
        <article class="dash-card full-card callout-card"><h4>Discovery without geography limits</h4><p>Search trusted athlete profiles across towns, compare progress histories and request contact through a controlled platform workflow.</p><button type="button" class="js-demo-inline">Add Aarav to watchlist</button></article>
      </div>`
  }
};

const roleTabs = [...document.querySelectorAll('.role-tab')];
const sidebarName = document.querySelector('#sidebarName');
const sidebarType = document.querySelector('#sidebarType');
const sidebarNav = document.querySelector('#sidebarNav');
const dashboardEyebrow = document.querySelector('#dashboardEyebrow');
const dashboardTitle = document.querySelector('#dashboardTitle');
const dashboardContent = document.querySelector('#dashboardContent');
const demoAction = document.querySelector('#demoAction');
let activeRole = 'athlete';

const renderRole = (role) => {
  const data = roleData[role];
  if (!data) return;
  activeRole = role;
  roleTabs.forEach((tab) => {
    const active = tab.dataset.role === role;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  sidebarName.textContent = data.name;
  sidebarType.textContent = data.type;
  dashboardEyebrow.textContent = data.eyebrow;
  dashboardTitle.textContent = data.title;
  demoAction.textContent = data.action;
  sidebarNav.innerHTML = data.nav.map(([icon, label], index) => `<button type="button" data-icon="${icon}" class="${index === 0 ? 'active' : ''}">${label}</button>`).join('');
  dashboardContent.innerHTML = data.content;
  sidebarNav.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      sidebarNav.querySelectorAll('button').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
    });
  });
  dashboardContent.querySelectorAll('.js-demo-inline').forEach((button) => button.addEventListener('click', openDemoModal));
};

roleTabs.forEach((tab) => tab.addEventListener('click', () => renderRole(tab.dataset.role)));
renderRole('athlete');

const demoModal = document.querySelector('#demoModal');
const modalIcon = document.querySelector('#modalIcon');
const modalTitle = document.querySelector('#modalTitle');
const modalText = document.querySelector('#modalText');

function openDemoModal() {
  const [icon, title, text] = roleData[activeRole].modal;
  modalIcon.textContent = icon;
  modalTitle.textContent = title;
  modalText.textContent = text;
  demoModal.classList.add('open');
  demoModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  document.querySelector('.modal-done')?.focus();
}

function closeDemoModal() {
  demoModal.classList.remove('open');
  demoModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

demoAction?.addEventListener('click', openDemoModal);
document.querySelector('.modal-close')?.addEventListener('click', closeDemoModal);
document.querySelector('.modal-done')?.addEventListener('click', closeDemoModal);
demoModal?.addEventListener('click', (event) => { if (event.target === demoModal) closeDemoModal(); });

const pitchOverlay = document.querySelector('#pitchOverlay');
const pitchSlides = [...document.querySelectorAll('.pitch-slide')];
const pitchCurrent = document.querySelector('#pitchCurrent');
const pitchTotal = document.querySelector('#pitchTotal');
const pitchProgress = document.querySelector('#pitchProgress');
let pitchIndex = 0;

pitchTotal.textContent = String(pitchSlides.length);

const showPitchSlide = (index) => {
  pitchIndex = Math.max(0, Math.min(index, pitchSlides.length - 1));
  pitchSlides.forEach((slide, position) => slide.classList.toggle('active', position === pitchIndex));
  pitchCurrent.textContent = String(pitchIndex + 1);
  pitchProgress.style.width = `${((pitchIndex + 1) / pitchSlides.length) * 100}%`;
  document.querySelector('.pitch-prev').disabled = pitchIndex === 0;
  document.querySelector('.pitch-next').textContent = pitchIndex === pitchSlides.length - 1 ? 'Finish ✓' : 'Next →';
};

const openPitch = () => {
  pitchIndex = 0;
  showPitchSlide(0);
  pitchOverlay.classList.add('open');
  pitchOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('pitch-open');
  document.querySelector('.pitch-next')?.focus();
};

const closePitch = () => {
  pitchOverlay.classList.remove('open');
  pitchOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('pitch-open');
};

document.querySelectorAll('.js-open-pitch').forEach((button) => button.addEventListener('click', openPitch));
document.querySelector('.pitch-close')?.addEventListener('click', closePitch);
document.querySelector('.pitch-prev')?.addEventListener('click', () => showPitchSlide(pitchIndex - 1));
document.querySelector('.pitch-next')?.addEventListener('click', () => {
  if (pitchIndex === pitchSlides.length - 1) closePitch();
  else showPitchSlide(pitchIndex + 1);
});

window.addEventListener('keydown', (event) => {
  if (pitchOverlay.classList.contains('open')) {
    if (event.key === 'ArrowRight' || event.key === ' ') {
      event.preventDefault();
      if (pitchIndex < pitchSlides.length - 1) showPitchSlide(pitchIndex + 1);
    }
    if (event.key === 'ArrowLeft') showPitchSlide(pitchIndex - 1);
    if (event.key === 'Escape') closePitch();
    return;
  }
  if (demoModal.classList.contains('open') && event.key === 'Escape') closeDemoModal();
});

document.querySelector('#year').textContent = new Date().getFullYear();
