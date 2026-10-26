const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const signInDialog = document.getElementById('signin');
const closeDialog = document.getElementById('closeDialog');
const demoForm = document.getElementById('demoForm');
const formMessage = document.getElementById('formMessage');

document.getElementById('year').textContent = new Date().getFullYear();

menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  menuToggle.textContent = isOpen ? '×' : '☰';
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = '☰';
  });
});

// The Sign In link opens a demo dialog. A production login requires a secure backend.
document.querySelectorAll('a[href="#signin"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    if (typeof signInDialog.showModal === 'function') signInDialog.showModal();
  });
});

closeDialog.addEventListener('click', () => signInDialog.close());
signInDialog.addEventListener('click', (event) => {
  if (event.target === signInDialog) signInDialog.close();
});

demoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  formMessage.textContent = 'Demo only: no account was created and no data was sent. Connect a secure authentication backend to enable sign-in.';
});

// Course catalogue: live search and level filters.
const courseSearch = document.getElementById('courseSearch');
const courseCards = Array.from(document.querySelectorAll('#courseGrid .course-card'));
const filterButtons = Array.from(document.querySelectorAll('.filter-button'));
const courseEmpty = document.getElementById('courseEmpty');
let activeCourseFilter = 'all';
function filterCourses() {
  const query = (courseSearch?.value || '').trim().toLowerCase();
  let visibleCount = 0;
  courseCards.forEach((card) => {
    const matchesLevel = activeCourseFilter === 'all' || card.dataset.level === activeCourseFilter;
    const searchableText = `${card.dataset.search || ''} ${card.textContent}`.toLowerCase();
    const visible = matchesLevel && (!query || searchableText.includes(query));
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });
  if (courseEmpty) courseEmpty.hidden = visibleCount !== 0;
}
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeCourseFilter = button.dataset.filter || 'all';
    filterButtons.forEach((item) => {
      const active = item === button; item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    filterCourses();
  });
});
courseSearch?.addEventListener('input', filterCourses);
filterButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.classList.contains('active'))));
filterCourses();

// Browser-local student dashboard demo. Production accounts need a secure backend.
(() => {
 const key='hushTechDashboardDemoV1';
 const initial={courses:[{id:'networking',name:'Networking Essentials',icon:'⌁',done:5,total:8,desc:'Networks, protocols, and how data moves.'},{id:'linux',name:'Linux & Kali Linux',icon:'⌘',done:2,total:10,desc:'Linux commands and security lab tools.'},{id:'cyber',name:'Cybersecurity Fundamentals',icon:'⬡',done:1,total:14,desc:'Core security principles, threats, and defenses.'}],labs:[{name:'Linux command-line basics',sub:'Linux & Kali Linux',done:4,total:6},{name:'Packet analysis starter lab',sub:'Networking Essentials',done:2,total:5},{name:'Web security practice lab',sub:'Web Security',done:1,total:4}],quizzes:[{name:'Networking basics',sub:'Recently completed',score:88},{name:'Linux commands',sub:'Recently completed',score:84},{name:'Security fundamentals',sub:'Recently completed',score:80}],certificates:[{name:'Computer Fundamentals',sub:'Awarded · Demo certificate'}]};
 let data;try{data=JSON.parse(localStorage.getItem(key))||JSON.parse(JSON.stringify(initial))}catch(e){data=JSON.parse(JSON.stringify(initial))}
 const el=id=>document.getElementById(id), safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function render(){if(!el('dashCourses'))return;let done=data.courses.reduce((a,c)=>a+c.done,0),total=data.courses.reduce((a,c)=>a+c.total,0),avg=data.quizzes.length?Math.round(data.quizzes.reduce((a,q)=>a+q.score,0)/data.quizzes.length):0;el('dashEnrolled').textContent=data.courses.length;el('dashLessons').innerHTML=`${done} <i>/ ${total}</i>`;el('dashLessonBar').style.width=(total?Math.min(100,done/total*100):0)+'%';el('dashQuizAvg').innerHTML=`${avg}<i>%</i>`;el('dashCertCount').textContent=data.certificates.length;el('dashCourseCount').textContent=String(data.courses.length).padStart(2,'0')+' COURSES';
 el('dashCourses').innerHTML=data.courses.map(c=>{let pct=Math.round(c.done/c.total*100);return `<article class="dash-course"><div class="dash-course-top"><span class="dash-course-icon">${safe(c.icon)}</span><div class="dash-course-info"><h4>${safe(c.name)}</h4><p>${safe(c.desc)}</p></div><span class="dash-percent">${pct}%</span></div><div class="dash-course-bottom"><small>${c.done} of ${c.total} lessons</small><div class="dash-course-progress"><span style="width:${pct}%"></span></div><button class="dash-complete-btn" type="button" data-dash-complete="${safe(c.id)}">Complete lesson +</button></div></article>`}).join('')||'<p>No enrolled courses yet. Browse courses to get started.</p>';
 el('dashLabs').innerHTML=data.labs.map(l=>{let pct=Math.round(l.done/l.total*100);return `<div class="dash-list-item"><span class="dash-list-icon">⌘</span><div class="dash-list-copy"><strong>${safe(l.name)}</strong><small>${safe(l.sub)} · ${l.done}/${l.total} tasks</small><div class="dash-course-progress" style="margin-top:7px"><span style="width:${pct}%"></span></div></div><span class="dash-list-score">${pct}%</span></div>`}).join('');
 el('dashQuizzes').innerHTML=data.quizzes.map(q=>`<div class="dash-list-item"><span class="dash-list-icon">✓</span><div class="dash-list-copy"><strong>${safe(q.name)}</strong><small>${safe(q.sub)}</small></div><span class="dash-list-score">${q.score}%</span></div>`).join('')||'<p>No quiz results yet.</p>';
 el('dashCertificates').innerHTML=data.certificates.map(c=>`<div class="dash-list-item"><span class="dash-list-icon">✧</span><div class="dash-list-copy"><strong>${safe(c.name)}</strong><small>${safe(c.sub)}</small></div></div>`).join('')||'<p>No certificates earned yet.</p>';}
 function save(){try{localStorage.setItem(key,JSON.stringify(data))}catch(e){}}
 document.addEventListener('click',e=>{let b=e.target.closest('[data-dash-complete]');if(b){let c=data.courses.find(x=>x.id===b.dataset.dashComplete);if(c&&c.done<c.total){c.done++;save();render()}else if(c)alert('All sample lessons in this course are complete.')}if(e.target.closest('#dashReset')){if(confirm('Reset the dashboard to its original sample progress?')){data=JSON.parse(JSON.stringify(initial));save();render()}}});render();
})();

// Practical Labs: interactive checklists and local progress only.
(() => {
 const key='hushTechPracticalLabsV1';
 const defs={
 linux:{title:'Linux Command-Line Challenges',help:'Use a local practice shell or training VM. This checklist does not execute commands on the website.',tasks:['Identify your current directory and list its contents.','Navigate into a practice folder and return home.','Create a sample text file and display its contents.','Inspect file permissions and explain their meaning.','Search a sample text file for a chosen word.']},
 network:{title:'Networking Exercises',help:'Use your own device or a private training network. Do not scan networks without permission.',tasks:['Identify a private IP address on your own device.','Explain the purpose of a default gateway.','Look up a domain with a DNS query in an authorized lab.','Explain one difference between TCP and UDP.']},
 web:{title:'Website Security Exercises',help:'Review a deliberately vulnerable local training app or a site you are explicitly authorized to assess.',tasks:['Check whether the lab application uses HTTPS.','Review sample response security headers.','Explain why session cookies need suitable security flags.','Describe how server-side input validation reduces risk.']},
 logs:{title:'Log Analysis',help:'Use fictional course sample logs or logs you are authorized to review.',tasks:['Sort sample events by timestamp.','Identify repeated failed logins in sample data.','Correlate a login event with its source and time.','Separate suspicious indicators from normal activity.','Write a short incident summary with evidence.']},
 defense:{title:'Defensive Security Challenges',help:'Apply these tasks only to systems you administer, following the appropriate change process.',tasks:['Check whether operating-system updates are available.','Review a sample user list using least-privilege principles.','Describe a safe backup and restore test.','Draft the first steps of an incident-response checklist.']},
 pentest:{title:'Beginner Penetration-Testing Lab',help:'Use only an intentionally vulnerable training app in an isolated sandbox. Never test public targets without explicit authorization.',tasks:['Write down the lab scope and authorization.','Map training-app pages and input fields without harmful payloads.','Identify a documented training weakness using lab instructions.','Record evidence, impact, remediation, and a responsible report.']}
 };
 let progress={};try{progress=JSON.parse(localStorage.getItem(key))||{}}catch{}
 const $=id=>document.getElementById(id);
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(progress))}catch{}};
 function render(id){const d=defs[id],panel=$('labTasks-'+id);if(!d||!panel)return;const done=progress[id]||[];
 panel.innerHTML='<h4>'+d.title+' · Checklist</h4>'+d.tasks.map((task,i)=>'<label class="lab-task '+(done.includes(i)?'done':'')+'"><input type="checkbox" data-lab-task="'+id+'" data-task-index="'+i+'" '+(done.includes(i)?'checked':'')+'><span>'+task+'</span></label>').join('')+'<p class="lab-task-help">'+d.help+'</p>';
 panel.hidden=false;const label=document.querySelector('[data-lab-progress-label="'+id+'"]');if(label)label.textContent=done.length+' of '+d.tasks.length+' completed';
 const btn=document.querySelector('[data-start-lab="'+id+'"]');if(btn)btn.textContent=done.length===d.tasks.length?'Review lab ✓':'Lab opened ↗';}
 function filter(){const q=($('labSearch')?.value||'').trim().toLowerCase(),level=document.querySelector('.lab-filter.active')?.dataset.labFilter||'all';let count=0;
 document.querySelectorAll('#labsGrid .lab-card').forEach(card=>{const show=(level==='all'||card.dataset.labLevel===level)&&(!q||(card.dataset.labSearch+' '+card.textContent).toLowerCase().includes(q));card.hidden=!show;if(show)count++});if($('labsEmpty'))$('labsEmpty').hidden=count>0;}
 document.addEventListener('click',e=>{const start=e.target.closest('[data-start-lab]');if(start){const panel=$('labTasks-'+start.dataset.startLab);if(panel.hidden)render(start.dataset.startLab);else panel.hidden=true}
 const f=e.target.closest('[data-lab-filter]');if(f){document.querySelectorAll('.lab-filter').forEach(b=>{const active=b===f;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});filter()}});
 document.addEventListener('change',e=>{const input=e.target.closest('[data-lab-task]');if(!input)return;const id=input.dataset.labTask,i=Number(input.dataset.taskIndex),set=new Set(progress[id]||[]);if(input.checked)set.add(i);else set.delete(i);progress[id]=[...set].sort((a,b)=>a-b);save();render(id)});
 $('labSearch')?.addEventListener('input',filter);
 Object.keys(defs).forEach(id=>{const label=document.querySelector('[data-lab-progress-label="'+id+'"]');if(label)label.textContent=(progress[id]||[]).length+' of '+defs[id].tasks.length+' completed'});
 filter();
})();
