'use strict';
const button=document.querySelector('.motion-toggle');
const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
function applyPreference(){button.hidden=preference.matches;document.body.classList.remove('motion-paused');button.setAttribute('aria-pressed','false');button.textContent='Pause ripples';}
button.addEventListener('click',()=>{const paused=document.body.classList.toggle('motion-paused');button.setAttribute('aria-pressed',String(paused));button.textContent=paused?'Resume ripples':'Pause ripples';});
preference.addEventListener('change',applyPreference);
applyPreference();
