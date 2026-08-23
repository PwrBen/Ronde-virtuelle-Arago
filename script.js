// ==========================================
// 1. BASE DE DONNÉES (10 IMAGES PAR PARCOURS)
// ==========================================
const baseDeDonnees = {
    "incendie": [ 
        { image: "incendie-photo1.jpg", anomalies: [] }, { image: "incendie-photo2.jpg", anomalies: [] },
        { image: "incendie-photo3.jpg", anomalies: [] }, { image: "incendie-photo4.jpg", anomalies: [] },
        { image: "incendie-photo5.jpg", anomalies: [] }, { image: "incendie-photo6.jpg", anomalies: [] },
        { image: "incendie-photo7.jpg", anomalies: [] }, { image: "incendie-photo8.jpg", anomalies: [] },
        { image: "incendie-photo9.jpg", anomalies: [] }, { image: "incendie-photo10.jpg", anomalies: [] }
    ],
    "surete": [ 
        { image: "surete-photo1.jpg", anomalies: [] }, { image: "surete-photo2.jpg", anomalies: [] },
        { image: "surete-photo3.jpg", anomalies: [] }, { image: "surete-photo4.jpg", anomalies: [] },
        { image: "surete-photo5.jpg", anomalies: [] }, { image: "surete-photo6.jpg", anomalies: [] },
        { image: "surete-photo7.jpg", anomalies: [] }, { image: "surete-photo8.jpg", anomalies: [] },
        { image: "surete-photo9.jpg", anomalies: [] }, { image: "surete-photo10.jpg", anomalies: [] }
    ]
};

// ==========================================
// 2. VARIABLES GLOBALES
// ==========================================
let agentFirstName = "";
let agentLastName = "";
let filiereActuelle = "";
let niveauActuel = 0;

let moduleTracking = [];
let anomaliesTotales = 0;
let anomaliesTrouvees = 0;
let couleursImageEnCours = [];

let anomalieEnCours = null;
let selectionId = null;
let selectionJustif = null;

// ==========================================
// 3. THÈME CLAIR / SOMBRE
// ==========================================
function toggleTheme() {
    var html = document.documentElement;
    var isDark = html.getAttribute('data-theme') === 'dark';
    var next = isDark ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('arago-theme', next);
    document.getElementById('toggle-label').textContent = next === 'dark' ? 'Mode sombre' : 'Mode clair';
}

// ==========================================
// 4. PLEIN ÉCRAN (Fullscreen API)
// ==========================================
document.getElementById('btn-fullscreen').addEventListener('click', () => {
    const elem = document.getElementById('vue-jeu');
    
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        // Alerte si on est sur mobile/tablette en mode portrait
        if (window.innerHeight > window.innerWidth && window.innerWidth < 1024) {
            alert("📱 ASTUCE : Tournez votre appareil en mode paysage (à l'horizontale) pour une meilleure immersion !");
        }
        
        if (elem.requestFullscreen) { elem.requestFullscreen(); } 
        else if (elem.webkitRequestFullscreen) { elem.webkitRequestFullscreen(); }
    } else {
        forceExitFullscreen();
    }
});

function forceExitFullscreen() {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
}

// Changer le texte du bouton selon l'état
document.addEventListener('fullscreenchange', updateFullscreenBtn);
document.addEventListener('webkitfullscreenchange', updateFullscreenBtn);

function updateFullscreenBtn() {
    const btn = document.getElementById('btn-fullscreen');
    if (document.fullscreenElement || document.webkitFullscreenElement) {
        btn.innerHTML = "🔳 Quitter le plein écran";
    } else {
        btn.innerHTML = "🔲 Plein écran";
    }
}

// ==========================================
// 5. NAVIGATION ENTRE ÉCRANS ET VUES
// ==========================================
function changerEcran(idEcran) {
    document.querySelectorAll('.screen').forEach(e => e.classList.remove('active'));
    document.getElementById(idEcran).classList.add('active');
}

function changerVueInterne(idVue) {
    document.querySelectorAll('.sub-view').forEach(e => e.classList.remove('active'));
    document.getElementById(idVue).classList.add('active');
}

function quitterService() {
    changerEcran('ecran-login');
}

function retourChoix() {
    forceExitFullscreen(); // On quitte le plein écran si l'agent interrompt la ronde
    changerVueInterne('vue-choix');
    document.getElementById('sidebar-progress-list').innerHTML = '<p style="color:var(--gray); font-size:0.9em; text-align:center;">Veuillez choisir une mission pour afficher les indicateurs.</p>';
}

// ==========================================
// 6. LOGIN ET SAUVEGARDE
// ==========================================
function loginAgent() {
    const nom = document.getElementById('agent-nom').value.trim();
    const prenom = document.getElementById('agent-prenom').value.trim();
    
    if(!nom || !prenom) {
        alert("La prise de service exige la saisie de votre Nom et Prénom.");
        return;
    }
    
    agentLastName = nom;
    agentFirstName = prenom;
    document.getElementById('display-agent-name').innerText = prenom.toUpperCase() + " " + nom.toUpperCase();
    
    changerEcran('dashboard-layout');
    changerVueInterne('vue-choix');
}

function exportProgress() {
    if (!filiereActuelle) {
        alert("Démarrez d'abord une ronde pour pouvoir la sauvegarder.");
        return;
    }
    try {
        const saveData = {
            firstName: agentFirstName, 
            lastName: agentLastName,
            filiere: filiereActuelle, 
            tracking: moduleTracking
        };
        const blob = new Blob([JSON.stringify(saveData)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url; link.download = 'sauvegarde_ronde.json';
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch(e) { alert("Erreur de sauvegarde."); }
}

function importProgress(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if(data.firstName === document.getElementById('agent-prenom').value.trim() && data.lastName === document.getElementById('agent-nom').value.trim()) {
                filiereActuelle = data.filiere;
                moduleTracking = data.tracking;
                agentFirstName = data.firstName; 
                agentLastName = data.lastName;
                document.getElementById('display-agent-name').innerText = agentFirstName.toUpperCase() + " " + agentLastName.toUpperCase();
                
                changerEcran('dashboard-layout');
                
                niveauActuel = moduleTracking.findIndex(m => !m.played);
                if(niveauActuel === -1) { 
                    changerVueInterne('vue-bilan'); 
                    afficherBilan(); 
                } else { 
                    changerVueInterne('vue-jeu'); 
                    chargerNiveau(); 
                }
                
                alert("Ronde rechargée avec succès !");
            } else { 
                alert("Erreur : Ce fichier de sauvegarde n'appartient pas à l'agent dont les noms sont saisis."); 
            }
        } catch (error) { alert("Erreur de lecture du fichier."); }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// ==========================================
// 7. MOTEUR D'INSPECTION ET HITBOXES TEST
// ==========================================
function lancerJeu(filiere) {
    filiereActuelle = filiere;
    niveauActuel = 0;
    moduleTracking = new Array(10).fill(null).map(() => ({ played: false, color: 'vide' }));
    
    changerVueInterne('vue-jeu');
    chargerNiveau();
}

function renderSidebar() {
    const list = document.getElementById('sidebar-progress-list');
    list.innerHTML = '';
    
    let titreText = filiereActuelle === 'incendie' ? 'Parcours Incendie' : 'Parcours Sûreté';
    
    const div = document.createElement('div');
    div.style.background = 'var(--desc-card-bg)';
    div.style.padding = '15px';
    div.style.borderRadius = '6px';
    div.style.border = '1px solid var(--border)';
    
    div.innerHTML = `<h5 style="color:var(--white); margin:0 0 10px 0; font-size:1.1em; text-align:center;">${titreText}</h5>`;
    
    const dotsRow = document.createElement('div');
    dotsRow.style.cssText = "display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;";
    
    moduleTracking.forEach((m, i) => {
        const dot = document.createElement('div');
        dot.style.cssText = "width: 25px; height: 25px; border-radius: 50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold;";
        dot.innerText = i + 1;
        
        if (m.played) {
            dot.style.color = "white";
            if (m.color === 'vert') dot.style.background = 'var(--bar-green)';
            else if (m.color === 'jaune') { dot.style.background = 'var(--bar-yellow)'; dot.style.color = '#1a1a1a'; }
            else if (m.color === 'rouge') dot.style.background = 'var(--bar-red)';
            else { dot.style.background = 'var(--info-bg)'; dot.style.border = '2px dashed var(--gray)'; dot.style.color = 'var(--gray)'; }
        } else if (i === niveauActuel) {
            dot.style.background = "var(--accent)";
            dot.style.color = "var(--white)";
            dot.style.border = "2px solid var(--white)";
            dot.style.transform = "scale(1.1)";
        } else {
            dot.style.background = 'var(--card)';
            dot.style.border = '2px solid var(--border)';
            dot.style.color = 'var(--gray)';
        }
        dotsRow.appendChild(dot);
    });
    
    div.appendChild(dotsRow);
    list.appendChild(div);
}

function chargerNiveau() {
    if(niveauActuel >= 10) {
        afficherBilan();
        return;
    }

    renderSidebar();

    const donnees = baseDeDonnees[filiereActuelle][niveauActuel];
    let anomaliesDeLimage = donnees.anomalies;

    // INJECTION DES HITBOXES EN A1, C4, E8 SI L'IMAGE EST VIDE
    if (anomaliesDeLimage.length === 0) {
        const qcmTest = {
            id: [ { texte: "Constat correct", correct: true }, { texte: "Constat erroné", correct: false } ],
            justif: [ { texte: "Analyse du risque exacte", correct: true }, { texte: "Évaluation sans lien", correct: false } ],
            explication: "Ceci est un QCM de test généré par le système."
        };
        anomaliesDeLimage = [
            { top: "0%", left: "0%", width: "10%", height: "20%", qcm: Object.assign({titre: "Zone A1"}, qcmTest) },
            { top: "40%", left: "30%", width: "10%", height: "20%", qcm: Object.assign({titre: "Zone C4"}, qcmTest) },
            { top: "80%", left: "70%", width: "10%", height: "20%", qcm: Object.assign({titre: "Zone E8"}, qcmTest) }
        ];
    }

    anomaliesTrouvees = 0;
    anomaliesTotales = anomaliesDeLimage.length;
    couleursImageEnCours = [];
    
    document.getElementById('titre-mission').textContent = `Situation ${niveauActuel + 1} / 10`;
    document.getElementById('image-fond').src = donnees.image;
    document.getElementById('score-image').textContent = "0";
    document.getElementById('total-image').textContent = anomaliesTotales;

    const conteneur = document.getElementById('conteneur-anomalies');
    conteneur.innerHTML = '';
    
    anomaliesDeLimage.forEach(anomalie => {
        let div = document.createElement('div');
        div.classList.add('anomalie');
        div.style.top = anomalie.top;
        div.style.left = anomalie.left;
        div.style.width = anomalie.width;
        div.style.height = anomalie.height;
        
        div.addEventListener('click', () => {
            if(!div.classList.contains('traitee')){
                anomalieEnCours = div;
                ouvrirQCM(anomalie.qcm);
            }
        });
        conteneur.appendChild(div);
    });
}

function terminerImage(source) {
    let finalColor = 'vert';
    
    if (source === 'RAS' && anomaliesTrouvees < anomaliesTotales) {
        // R.A.S prématuré = Rouge direct
        finalColor = 'rouge';
    } else if (couleursImageEnCours.length > 0) {
        if (couleursImageEnCours.includes('rouge')) finalColor = 'rouge';
        else if (couleursImageEnCours.includes('jaune')) finalColor = 'jaune';
        else finalColor = 'vert';
    }
    
    moduleTracking[niveauActuel] = { played: true, color: finalColor };
    niveauActuel++;
    
    setTimeout(() => { chargerNiveau(); }, 500); 
}

// Action sur le bouton RAS
document.getElementById('btn-passer-mission').addEventListener('click', () => terminerImage('RAS'));

function afficherBilan() {
    forceExitFullscreen(); // Fin de la ronde : on quitte le plein écran
    changerVueInterne('vue-bilan');
    const grille = document.getElementById('grille-resultats');
    grille.innerHTML = '';
    
    moduleTracking.forEach((res, index) => {
        let pastille = document.createElement('div');
        pastille.className = `pastille ${res.color}`;
        pastille.textContent = index + 1;
        grille.appendChild(pastille);
    });
    renderSidebar(); 
}

// ==========================================
// 8. GESTION DU QCM (Logique Vert / Jaune / Rouge)
// ==========================================
const modal = document.getElementById('qcm-modal');
const btnValider = document.getElementById('btn-valider-analyse');
const feedback = document.getElementById('qcm-feedback');
const btnFermer = document.getElementById('btn-fermer');

function ouvrirQCM(donneesQcm) {
    document.getElementById('qcm-titre').textContent = donneesQcm.titre;
    selectionId = null; selectionJustif = null;
    
    const contId = document.getElementById('options-id'); contId.innerHTML = '';
    const contJustif = document.getElementById('options-justif'); contJustif.innerHTML = '';
    
    feedback.classList.add('cache'); feedback.classList.remove('active');
    btnFermer.style.display = 'none';
    btnValider.style.display = 'inline-block'; btnValider.disabled = true; btnValider.style.opacity = '0.5';

    const shuffle = arr => [...arr].sort(() => 0.5 - Math.random());

    shuffle(donneesQcm.id).forEach(opt => {
        let btn = document.createElement('button'); btn.classList.add('choice-btn');
        btn.textContent = opt.texte; btn.dataset.correct = opt.correct;
        btn.onclick = () => { selectionId = selectionnerOption(contId, btn); verifierValidation(); };
        contId.appendChild(btn);
    });

    shuffle(donneesQcm.justif).forEach(opt => {
        let btn = document.createElement('button'); btn.classList.add('choice-btn');
        btn.textContent = opt.texte; btn.dataset.correct = opt.correct;
        btn.onclick = () => { selectionJustif = selectionnerOption(contJustif, btn); verifierValidation(); };
        contJustif.appendChild(btn);
    });

    modal.classList.remove('cache');
    btnValider.onclick = () => verifierReponse(donneesQcm);
}

function selectionnerOption(conteneur, boutonClique) {
    conteneur.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
    boutonClique.classList.add('selected');
    return boutonClique;
}

function verifierValidation() {
    if (selectionId && selectionJustif) {
        btnValider.disabled = false; btnValider.style.opacity = '1';
    }
}

function verifierReponse(donneesQcm) {
    const idCorrect = selectionId.dataset.correct === "true";
    const justifCorrect = selectionJustif.dataset.correct === "true";

    document.querySelectorAll('.choice-btn').forEach(b => {
        b.disabled = true;
        if(b.dataset.correct === "true") b.classList.add('correct');
    });
    
    btnValider.style.display = 'none';
    feedback.classList.remove('cache', 'success', 'warning', 'error');
    feedback.classList.add('active');

    let couleurObtenue = '';

    if (idCorrect && justifCorrect) {
        couleurObtenue = 'vert';
        selectionId.classList.add('correct'); selectionJustif.classList.add('correct');
        feedback.classList.add('success');
        feedback.innerHTML = `<strong>✓ PARFAIT (2/2)</strong><br>${donneesQcm.explication}`;
    } 
    else if (idCorrect || justifCorrect) {
        couleurObtenue = 'jaune';
        if (!idCorrect) selectionId.classList.add('wrong');
        if (!justifCorrect) selectionJustif.classList.add('wrong');
        feedback.classList.add('warning');
        feedback.innerHTML = `<strong>⚠ ANALYSE PARTIELLE (1/2)</strong><br>${donneesQcm.explication}`;
    } 
    else {
        couleurObtenue = 'rouge';
        selectionId.classList.add('wrong'); selectionJustif.classList.add('wrong');
        feedback.classList.add('error');
        feedback.innerHTML = `<strong>✗ ÉCHEC DE L'ANALYSE (0/2)</strong><br>${donneesQcm.explication}`;
    }

    couleursImageEnCours.push(couleurObtenue);
    anomalieEnCours.classList.add('traitee');
    anomalieEnCours.classList.remove('visible');
    
    anomaliesTrouvees++;
    document.getElementById('score-image').textContent = anomaliesTrouvees;

    btnFermer.style.display = 'inline-block';
    if(anomaliesTrouvees === anomaliesTotales) {
        btnFermer.textContent = "Fin de l'inspection de la zone";
        btnFermer.onclick = () => { modal.classList.add('cache'); terminerImage('FIN_NORMALE'); };
    } else {
        btnFermer.textContent = "Continuer la ronde";
        btnFermer.onclick = () => modal.classList.add('cache');
    }
}

document.getElementById('fermer-croix').addEventListener('click', () => modal.classList.add('cache'));

// Bouton Aide (Afficher / Masquer les Hitboxes)
document.getElementById('btn-toggle-zones').addEventListener('click', () => {
    document.querySelectorAll('.anomalie:not(.traitee)').forEach(z => z.classList.toggle('visible'));
});

// ==========================================
// 9. OUTIL DÉVELOPPEUR : GRILLE DE POSITIONNEMENT
// ==========================================
const grilleOverlay = document.getElementById('grille-overlay');
const lettresLignes = ['A', 'B', 'C', 'D', 'E'];
for (let i = 0; i < 5; i++) {
    for (let j = 1; j <= 10; j++) {
        let cell = document.createElement('div');
        cell.classList.add('cellule-grille');
        cell.textContent = lettresLignes[i] + j;
        grilleOverlay.appendChild(cell);
    }
}
document.getElementById('btn-toggle-grille').addEventListener('click', () => grilleOverlay.classList.toggle('cache'));