// Minimal runtime theme toggle using only generated role tokens.
(function(){
	const btn = document.getElementById('themeToggle');
	if(!btn) return;
	let dark=false;
	const root=document.documentElement;
	const DARK={
		'--color-role-bg-surface':'oklch(0.12 0.005 95)',
		'--color-role-bg-elevated':'oklch(0.17 0.005 95)',
		'--color-role-text-default':'oklch(0.95 0.01 95)',
		'--color-role-text-muted':'oklch(0.7 0.01 95)'
	};
	function apply(){
		if(dark){
			Object.entries(DARK).forEach(([k,v])=>root.style.setProperty(k,v));
			btn.textContent='Light Mode';
		} else {
			Object.keys(DARK).forEach(k=>root.style.removeProperty(k));
			btn.textContent='Dark Mode';
		}
	}
	btn.addEventListener('click',()=>{ dark=!dark; apply(); });
	apply();
})();
