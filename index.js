// Unified JS for index.html and surprise.html
// Implements: animated backgrounds, quiz, countdown, surprise scenes
document.addEventListener('DOMContentLoaded', () => {
	/* -------------------- Index page behavior -------------------- */
	if (document.getElementById('wishBox')) {
		initIndexPage();
	}

	/* -------------------- Surprise page behavior -------------------- */
	if (document.getElementById('surpriseApp')) {
		initSurprisePage();
	}
});

/* -------------------- Index Page Implementation -------------------- */
function initIndexPage(){
	// Animated background elements (hearts and sparkles)
	startFloatingHearts();

	// Countdown and UI
	initCountdown();

	// Firebase connection for wish saving
	const db = initFirebase();

	function initFirebase(){
		if (typeof firebase === 'undefined'){
			console.warn('Firebase SDK not loaded. Wishes will not be saved.');
			return null;
		}
		try {
			const firebaseConfig = {
				apiKey: "AIzaSyCVYIvkwTRmR54P8DNfSOUhUwe0JCYqkGM",
				authDomain: "glenn-b6997.firebaseapp.com",
				projectId: "glenn-b6997",
				storageBucket: "glenn-b6997.firebasestorage.app",
				messagingSenderId: "352923547236",
				appId: "1:352923547236:web:e71b4b00e4337450a39171"
			};
			if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY'){
				console.warn('Firebase config not set. Please paste your Firebase project config into index.js.');
				return null;
			}
			firebase.initializeApp(firebaseConfig);
			const firestore = firebase.firestore();
			console.log('Firestore initialized', !!firestore);
			return firestore;
		} catch (error) {
			console.warn('Firebase init failed:', error);
			return null;
		}
	}

	// Wish box behavior
	const wishInput = document.getElementById('wishInput');
	const wishSubmit = document.getElementById('wishSubmit');
	const wishMessage = document.getElementById('wishMessage');
	const wishReview = document.getElementById('wishReview');
	let wishCount = 0;

	wishSubmit?.addEventListener('click', async ()=>{
		const v = wishInput.value.trim();
		if (!v){ alert('Please type your wish before sending.'); wishInput.focus(); return; }
		// increment wish count
		wishCount++;
		// clear input immediately (visual feedback)
		wishInput.value = '';
		wishInput.textContent = '';
		// show thanks and review
		wishMessage.textContent = 'Thank you — your wish is safe with me 💖';
		if (wishReview){
			wishReview.hidden = false;
			wishReview.innerHTML = '';
			const reviewLabel = document.createElement('strong');
			reviewLabel.textContent = `Wish ${wishCount} received`;
			const reviewText = document.createElement('div');
			reviewText.className = 'review-text';
			reviewText.textContent = v;
			wishReview.append(reviewLabel, reviewText);
		}
		// save to Firestore
		if (db){
			wishMessage.textContent = 'Saving your wish...';
			try {
				await db.collection('wishes').add({ text: v, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
				wishMessage.textContent = 'Wish saved! 💖';
			} catch(e){
				console.warn('Could not save wish:', e);
				wishMessage.textContent = `Firebase save failed: ${e.message || 'permission/error'}`;
			}
		} else {
			wishMessage.textContent = 'Wish saved locally. Add Firebase config to save online.';
		}
		// update button text and placeholder
		wishInput.placeholder = 'Add another wish if you like...';
		wishSubmit.textContent = 'Wish Again';
		wishInput.focus();
	});

	// Enter button: just change title (no scroll)
	document.getElementById('greetBtn')?.addEventListener('click', ()=>{
		document.querySelector('.hero')?.classList.add('entered');
		const heroTitle = document.getElementById('hero-title');
		if (heroTitle) {
			const defaultText = "🎂 A Special Birthday Surprise 🎂";
			const altText = "I'm glad that I've met someone like you 😙";
			heroTitle.innerText = heroTitle.innerText === defaultText ? altText : defaultText;
		}
	});
}

function startFloatingHearts(){
	const heartsContainer = document.getElementById('hearts') || document.body;
	// create subtle hearts and sparkles
	setInterval(()=>{
		const h = document.createElement('div'); h.className='heart'; h.textContent = ['💖','✨'][Math.floor(Math.random()*2)];
		h.style.left = `${Math.random()*100}vw`; h.style.fontSize = `${12+Math.random()*18}px`;
		heartsContainer.appendChild(h);
		setTimeout(()=> h.remove(), 6000);
	}, 900);
	// sparkles (using tiny dots)
	const sparkles = document.getElementById('sparkles');
	if (sparkles){
		setInterval(()=>{
			const s = document.createElement('div'); s.className='sparkle'; s.style.left = `${Math.random()*100}%`; s.style.top = `${Math.random()*60}%`;
			sparkles.appendChild(s); setTimeout(()=> s.remove(), 2500);
		}, 400);
	}
}

function initCountdown(){
	const nowDate = new Date();
	const birthMonth = 5; // June (0-indexed)
	const birthDay = 6;
	const birthHour = 00, birthMin = 00, birthSec = 01;
	const birthdayThisYear = new Date(nowDate.getFullYear(), birthMonth, birthDay, birthHour, birthMin, birthSec);
	const target = birthdayThisYear.getTime();
	const daysEl = document.getElementById('days'), hoursEl = document.getElementById('hours'), minutesEl = document.getElementById('minutes'), secondsEl = document.getElementById('seconds');
	const countdownStatus = document.getElementById('countdownStatus');
	const progressBar = document.getElementById('progressBar');
	const after = document.getElementById('afterCountdown');
	const countdownEl = document.getElementById('countdown');
	const openBtn = document.getElementById('openGift');
	const now = nowDate.getTime();

	if (openBtn){
		openBtn.addEventListener('click', ()=> window.location.href = 'surprise.html');
	}

	const showReadyState = ()=>{
		if (countdownEl) countdownEl.style.display = 'none';
		if (countdownStatus) countdownStatus.textContent = 'Your birthday surprise is ready — open your gift anytime.';
		if (after) after.hidden = false;
		if (progressBar) progressBar.style.width = '100%';
	};

	if (now >= target){
		showReadyState();
		return;
	}

	const start = now;
	const totalDuration = target - start;

	const tick = ()=>{
		const current = Date.now();
		const diff = target - current;
		if (diff <= 0){
			clearInterval(interval);
			showReadyState();
			return;
		}
		const days = Math.floor(diff / (1000*60*60*24));
		const hours = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
		const minutes = Math.floor((diff % (1000*60*60)) / (1000*60));
		const seconds = Math.floor((diff % (1000*60)) / 1000);
		daysEl.textContent = days; hoursEl.textContent = hours; minutesEl.textContent = minutes; secondsEl.textContent = seconds;
		if (countdownStatus) countdownStatus.textContent = getCountdownStatus(days, hours, minutes, seconds, diff);
		if (progressBar && totalDuration > 0){
			const progress = Math.min(100, Math.max(0, ((totalDuration - diff) / totalDuration) * 100));
			progressBar.style.width = `${progress}%`;
		}
	};
	tick(); const interval = setInterval(tick, 1000);

	function getCountdownStatus(days, hours, minutes, seconds, diff){
		if (diff < 60_000) return 'Less than a minute until your surprise — almost there!';
		if (hours === 0) return `Only ${minutes} minute${minutes === 1 ? '' : 's'} left.`;
		if (days === 0) return `Less than a day until the surprise.`;
		return `${days} day${days === 1 ? '' : 's'} until your birthday surprise.`;
	}
}

/* -------------------- Surprise Page Implementation -------------------- */
function initSurprisePage(){
	const app = document.getElementById('surpriseApp');
	const music = document.getElementById('music');
	const startBtn = document.getElementById('startBtn');
	const sceneWelcome = document.getElementById('sceneWelcome');
	const sceneCake = document.getElementById('sceneCake');
	const cakeContinueBtn = document.getElementById('cakeContinueBtn');
	const sceneBalloons = document.getElementById('sceneBalloons');
	const scenePhoto = document.getElementById('scenePhoto');
	const photoContinueBtn = document.getElementById('photoContinueBtn');
	const sceneMessage = document.getElementById('sceneMessage');
	const sceneFinale = document.getElementById('sceneFinale');
	const continueBtn = document.getElementById('continueBtn');
	const memoryCard = document.getElementById('memoryCard');
	const calcInput1 = document.getElementById('calcInput1');
	const calcInput2 = document.getElementById('calcInput2');
	const calcOperator = document.getElementById('calcOperator');
	const calcButton = document.getElementById('calcButton');
	const calcResult = document.getElementById('calcResult');
	const balloonStage = document.getElementById('balloons');
	const balloonTargetEl = document.getElementById('balloonTarget');
	const balloonCounter = document.getElementById('balloonCounter');

	// Welcome type lines
	const lines = Array.from(document.querySelectorAll('#sceneWelcome .line'));
	typeLines(lines, ()=> {
		// show start button after lines typed
		document.getElementById('startBtn').style.opacity = 1;
	});

	startBtn.addEventListener('click', async ()=>{
		// user interaction: start music
		try { await music.play(); } catch(e){}
		sceneWelcome.hidden = true; sceneCake.hidden = false;
		// show cake continue button after a short delay
		await delay(1200);
		cakeContinueBtn.hidden = false;
		cakeContinueBtn.focus();
	});

	// Cake continue button: move to balloons
	cakeContinueBtn.addEventListener('click', ()=>{
		sceneCake.hidden = true; sceneBalloons.hidden = false; cakeContinueBtn.hidden = true;
		startBalloons(balloonStage, 8, ()=>{
			// when finished
			sceneBalloons.hidden = true; scenePhoto.hidden = false;
			revealPhoto();
		});
	});

	photoContinueBtn?.addEventListener('click', ()=>{
		scenePhoto.hidden = true;
		photoContinueBtn.hidden = true;
		sceneMessage.hidden = false;
		startTypewriter(()=>{
			memoryCard.hidden = false;
			continueBtn.hidden = false;
			continueBtn.focus();
			setTimeout(revealFinale, 6000);
		});
	});

	// Calculator behavior in welcome scene
	const calcDisplay = document.getElementById('calcDisplay');
	const calcHistory = document.getElementById('calcHistory');
	const calcButtons = document.querySelectorAll('.calc-btn');
	let calcExpression = '';
	const historyEntries = [];

	function updateCalcDisplay(value){
		if (calcDisplay) calcDisplay.textContent = value || '0';
	}

	function addHistoryEntry(entry){
		historyEntries.push(entry);
		if (!calcHistory) return;
		calcHistory.innerHTML = historyEntries.map(item => `<div class="calc-history-item">${item}</div>`).join('');
	}

	function computeCalculator(expression){
		const normalized = expression.replace(/\s+/g, '');
		if (!normalized) return 'Enter a calculation to reveal the surprise.';
		if (normalized === '1+1') return 'I miss you ❤️';
		if (normalized === '2+2') return '22';
		if (normalized === '3+3') return '33';
		if (normalized === '4+4') return '44';
		if (normalized === '5+5') return '55';
		if (normalized.includes('+')) return 'Plus means more love? 💖';
		if (normalized.includes('-')) return 'Minus means missing you? 💔';
		if (normalized.includes('*')) return 'Times means extra hugs? 🤗';
		if (normalized.includes('/')) return 'Division is not for us — stay together 💞';
		if (normalized.includes('%')) return 'You are 100% special 💯';
		return 'That one is a secret message ✨';
	}

	if (calcButtons){
		calcButtons.forEach(button=>{
			button.addEventListener('click', ()=>{
				const value = button.dataset.value;
				if (value === 'C'){
					calcExpression = '';
					updateCalcDisplay('0');
					return;
				}
				if (value === '='){
					const result = computeCalculator(calcExpression);
					updateCalcDisplay(result);
					addHistoryEntry(result);
					calcExpression = '';
					return;
				}
				calcExpression += value;
				updateCalcDisplay(calcExpression);
			});
		});
	}

	// Replay
	document.getElementById('replayBtn').addEventListener('click', ()=> location.reload());

	// small helpers
	function revealPhoto(){
		const img = document.getElementById('specialPhoto');
		img.style.transform = 'scale(.9)'; img.style.opacity = 0;
		setTimeout(()=>{ img.style.transition='transform 700ms ease, opacity 700ms ease'; img.style.transform='scale(1)'; img.style.opacity=1; },50);
		setTimeout(()=>{
			photoContinueBtn.hidden = false;
			photoContinueBtn.focus();
		}, 1400);
	}

	function revealFinale(){
		if (!sceneFinale.hidden) return;
		sceneFinale.hidden = false;
		continueBtn.hidden = true;
		launchFinale();
	}

	continueBtn.addEventListener('click', revealFinale);

	function launchFinale(){
		const confettiEnabled = typeof confetti === 'function';
		if (!confettiEnabled) return;
		// sequence bursts
		const bursts = [ {x:0.2},{x:0.8},{x:0.5} ];
		let count=0; const id = setInterval(()=>{
			const b = bursts[count % bursts.length];
			confetti({ particleCount: 100, spread: 120, origin: { x: b.x, y: 0.6 } });
			count++; if (count>8) clearInterval(id);
		}, 700);
	}
}

/* --- Balloons mini-game --- */
function startBalloons(stage, target=8, onComplete){
	stage.innerHTML=''; let popped=0; document.getElementById('balloonTarget').textContent = target; updateCounter();
	const icons = ["🎈","🎉","✨","🌸","🎁","💖"];
	const total = target;
	for (let i=0;i<total;i++){
		const b = document.createElement('div');
		b.className='balloon';
		b.setAttribute('role','button');
		b.setAttribute('tabindex','0');
		b.textContent = icons[Math.floor(Math.random()*icons.length)];
		b.style.left = `${5 + Math.random()*90}%`;
		b.style.top='110%';
		b.style.animationDuration = `${6 + Math.random()*4}s`;
		stage.appendChild(b);

		const pop = ()=>{
			if (b.classList.contains('popped')) return;
			b.classList.add('popped');
			b.textContent='💥';
			if (typeof confetti==='function' && window.innerWidth > 420) confetti({ particleCount: 40, spread: 60, origin:{ x: Math.random(), y: 0.6 }});
			setTimeout(()=> b.remove(), 500);
			popped++; updateCounter(); if (popped>=target) onComplete();
		};

		b.addEventListener('click', pop);
		b.addEventListener('keydown', (e)=>{ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pop(); } });
	}
	function updateCounter(){ document.getElementById('balloonCounter').innerText = `${Math.min(popped,target)} / ${target}`; }
}

/* --- Typewriter helpers --- */
function typeLines(lines, done){ let i=0; (function nextLine(){ if (i>=lines.length){ done && done(); return;} const el = lines[i]; typeText(el, el.dataset.text || '', 40, ()=>{ i++; setTimeout(nextLine, 300); }); })(); }
function typeText(el, text, speed=40, cb){ el.textContent=''; let idx=0; const id = setInterval(()=>{ el.textContent += text[idx++]; if (idx>=text.length){ clearInterval(id); cb && cb(); } }, speed); }
function startTypewriter(cb){ const target = document.getElementById('typewriter'); const text = "Glenn wishes you the happiest birthday ever 💫"; target.textContent=''; let i=0; const cursor = document.createElement('span'); cursor.className='cursor'; cursor.textContent='|'; target.appendChild(cursor); const id = setInterval(()=>{ target.textContent = text.slice(0,i); target.appendChild(cursor); i++; if (i>text.length){ clearInterval(id); cursor.remove(); cb && cb(); } }, 50); }

/* --- Utilities --- */
function delay(ms){ return new Promise(res=>setTimeout(res, ms)); }

