const routes=['dashboard','schedule','weekly','calendar','reminders','import','history','settings'];
export function currentRoute(){const hash=location.hash.replace('#','').split('?')[0];return routes.includes(hash)?hash:'dashboard';}
export function navigate(route){if(!routes.includes(route))route='dashboard';if(location.hash===`#${route}`)window.dispatchEvent(new HashChangeEvent('hashchange'));else location.hash=route;}
export function initNavigation(onChange){window.addEventListener('hashchange',()=>onChange(currentRoute()));document.querySelectorAll('[data-route]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();navigate(a.dataset.route);}));}
