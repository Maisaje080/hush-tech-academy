// HUSH TECH Academy backend-connected registration and login.
(() => {
  const $ = id => document.getElementById(id);
  const msg = (text, type='error') => { const box=$('accountMessage'); if(box){box.textContent=text;box.className='account-message '+type;box.hidden=false;} };
  const clear = () => { const box=$('accountMessage'); if(box){box.hidden=true;box.textContent='';} };
  async function api(path, body) {
    const response = await fetch(path, {method: body ? 'POST' : 'GET', credentials:'same-origin', headers: body ? {'Content-Type':'application/json'} : {}, body: body ? JSON.stringify(body) : undefined});
    let data={}; try { data=await response.json(); } catch {}
    if(!response.ok) throw new Error(data.error || 'Request failed. Please try again.');
    return data;
  }
  function showTab(tab) {
    document.querySelectorAll('[data-account-tab]').forEach(b=>{const active=b.dataset.accountTab===tab;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});
    $('registerForm').hidden=tab!=='register'; $('loginForm').hidden=tab!=='login'; $('signedInPanel').hidden=true; clear();
  }
  function showUser(user) {
    $('registerForm').hidden=true; $('loginForm').hidden=true; $('signedInPanel').hidden=false; $('signedInName').textContent=user.name;
    document.querySelectorAll('[data-account-tab]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-selected','false');}); clear();
  }
  document.addEventListener('click', async e=>{
    const tab=e.target.closest('[data-account-tab]'); if(tab) showTab(tab.dataset.accountTab);
    if(e.target.closest('#signOutButton')) { try { await api('/api/logout',{}); showTab('login'); msg('You have signed out successfully.','success'); } catch(err){msg(err.message);} }
  });
  $('registerForm')?.addEventListener('submit',async e=>{
    e.preventDefault(); clear(); const name=$('registerName').value.trim(),email=$('registerEmail').value.trim().toLowerCase(),password=$('registerPassword').value;
    if(name.length<2) return msg('Please enter your name (at least 2 characters).');
    if(password.length<12) return msg('Use a password with at least 12 characters.');
    try { const data=await api('/api/register',{name,email,password}); $('registerForm').reset(); showUser(data.user); msg('Your student account was created successfully.','success'); } catch(err){msg(err.message);}
  });
  $('loginForm')?.addEventListener('submit',async e=>{
    e.preventDefault(); clear();
    try { const data=await api('/api/login',{email:$('loginEmail').value.trim().toLowerCase(),password:$('loginPassword').value}); $('loginForm').reset(); showUser(data.user); msg('Welcome back! You are signed in.','success'); } catch(err){msg(err.message);}
  });
  (async()=>{try{const data=await api('/api/me');if(data.user)showUser(data.user);}catch{}})();
})();
