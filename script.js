
        lucide.createIcons();
        AOS.init({ duration: 800, once: true, offset: 100 });

        const serverIP = "https://cfx.re/join/y9v9pkj"; 
        const cfxId = "y9v9pkj"; 
        const directJsonUrl = `http://${serverIP}:30120/players.json`;

        /* --- GESTION MENU MOBILE --- */
        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('active');
        }

        /* --- GESTION MODALES (Lightbox) --- */
        function openModal(id) { document.getElementById(id).classList.add('active'); }
        function closeModal(id) { document.getElementById(id).classList.remove('active'); }

        function openLightbox(element) {
            const style = element.currentStyle || window.getComputedStyle(element, false);
            const url = style.backgroundImage.slice(4, -1).replace(/"/g, "");
            document.getElementById('lightbox-img').src = url;
            openModal('lightbox');
        }
        function closeLightbox() { closeModal('lightbox'); }

        /* --- GESTION ACCORDION REGLES --- */
        function toggleRule(header) {
            const item = header.parentElement;
            item.classList.toggle('open');
        }

        /* --- STATUS SERVEUR (CACHE & FAST LOAD) --- */
        
        // 1. CHARGEMENT DU CACHE (IMMEDIAT)
        function loadCachedData() {
            const cached = localStorage.getItem('server_status_cache');
            if (cached) {
                try {
                    const data = JSON.parse(cached);
                    const elPlayers = document.getElementById('player-count');
                    if (elPlayers) {
                        elPlayers.innerText = data.players || "--";
                        document.getElementById('max-players').innerText = data.max || "256";
                        document.getElementById('ping-value').innerText = data.ping || "--";
                    }
                } catch(e) { console.log("Cache error", e); }
            }
        }
        
        loadCachedData();

        // 2. RECUPERATION DONNEES FRAICHES
        async function fetchServerData() {
            let foundData = false;
            try {
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(directJsonUrl)}`;
                const response = await fetch(proxyUrl);
                const data = await response.json();
                if (data && data.contents) {
                    const players = JSON.parse(data.contents);
                    if (Array.isArray(players)) { updateUI(players.length, "256", true); foundData = true; }
                }
            } catch (e) { console.log("Lecture directe échouée..."); }

            if (!foundData) {
                try {
                    const response = await fetch(`https://servers-frontend.fivem.net/api/servers/single/${cfxId}?_=${Date.now()}`);
                    if (!response.ok) throw new Error("API FiveM HS");
                    const data = await response.json();
                    if (data && data.Data) { updateUI(data.Data.clients, data.Data.sv_maxclients, false); }
                } catch (error) {
                    if (!localStorage.getItem('server_status_cache')) {
                        document.getElementById('status-text').innerText = "Hors Ligne";
                        document.getElementById('status-text').style.color = "#ef4444";
                        document.getElementById('status-dot').className = "status-dot offline";
                    }
                }
            }
        }

        function updateUI(players, maxPlayers, isDirect) {
            document.getElementById('player-count').innerText = players;
            document.getElementById('max-players').innerText = maxPlayers;
            const statusText = document.getElementById('status-text');
            const statusDot = document.getElementById('status-dot');
            statusText.innerText = "En Ligne";
            statusText.style.color = "#10b981";
            statusDot.className = "status-dot online";
            
            let ping = "--";
            if (players > 0) {
                 ping = Math.floor(Math.random() * (28 - 12 + 1) + 12);
                 document.getElementById('ping-value').innerText = ping;
            } else {
                 document.getElementById('ping-value').innerText = "--";
            }

            localStorage.setItem('server_status_cache', JSON.stringify({
                players: players,
                max: maxPlayers,
                ping: ping,
                timestamp: Date.now()
            }));
        }

        fetchServerData();
        setInterval(fetchServerData, 30000);

        /* --- COPIE IP --- */
        function copyIP() {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(serverIP).then(showToast).catch(fallbackCopy);
            } else { fallbackCopy(); }
        }

        function fallbackCopy() {
            const textArea = document.createElement("textarea");
            textArea.value = serverIP;
            textArea.style.position = "fixed"; textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.focus(); textArea.select();
            try { const successful = document.execCommand('copy'); if(successful) showToast(); } catch (err) { alert("IP : " + serverIP); }
            document.body.removeChild(textArea);
        }

        function showToast() {
            const toast = document.getElementById('toast');
            const label = document.getElementById('ip-label');
            toast.classList.add('active');
            setTimeout(() => { toast.classList.remove('active'); }, 3000);
            if(label) {
                const original = label.innerText;
                label.innerText = "Copié !";
                setTimeout(() => { label.innerText = original; }, 2000);
            }
        }