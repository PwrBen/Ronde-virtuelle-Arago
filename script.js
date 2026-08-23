// ==========================================
// 1. BASE DE DONNÉES (10 IMAGES PAR PARCOURS)
// ==========================================
const baseDeDonnees = {
    "incendie": [ // PARCOURS SSIAP
        { image: "incendie-photo1.jpg", anomalies: [] },
        { image: "incendie-photo2.jpg", anomalies: [] },
        { image: "incendie-photo3.jpg", anomalies: [] },
        { image: "incendie-photo4.jpg", anomalies: [] },
        { image: "incendie-photo5.jpg", anomalies: [] },
        { image: "incendie-photo6.jpg", anomalies: [] },
        { image: "incendie-photo7.jpg", anomalies: [] },
        { image: "incendie-photo8.jpg", anomalies: [] },
        { image: "incendie-photo9.jpg", anomalies: [] },
        { image: "incendie-photo10.jpg", anomalies: [] }
    ],
    "surete": [ // PARCOURS SÛRETÉ
        { image: "surete-photo1.jpg", anomalies: [] },
        { image: "surete-photo2.jpg", anomalies: [] },
        { image: "surete-photo3.jpg", anomalies: [] },
        { image: "surete-photo4.jpg", anomalies: [] },
        { image: "surete-photo5.jpg", anomalies: [] },
        { image: "surete-photo6.jpg", anomalies: [] },
        { image: "surete-photo7.jpg", anomalies: [] },
        { image: "surete-photo8.jpg", anomalies: [] },
        { image: "surete-photo9.jpg", anomalies: [] },
        { image: "surete-photo10.jpg", anomalies: [] }
    ]
};

// ==========================================
// 2. GESTION AGENT ET THÈME
// ==========================================
let agentFirstName = "";
let agentLastName = "";
let saveCount = 0;

let globalModuleTracking = {
    incendie: { array: new Array(10).fill(null).map(() => ({played:false, score:0, color:'vide'})) },
    surete: { array: new Array(10).fill(null).map(() => ({played:false, score:0, color:'vide'})) }
};

let filiereActuelle = "";
let niveauActuel = 0;
let erreursImageEnCours = 0;
let anomaliesTrouvees = 0;
let anomaliesTotales = 0;
let anomalieEnCours = null;
let selectionId = null;
let selectionJustif = null;

function loginAgent() {
    const nom = document.getElementById('agent-nom').value.trim();
    const prenom = document.getElementById('agent-prenom').value.trim();
    if(!nom || !prenom) {
        alert("Veuillez saisir votre Nom et Prénom.");
        return;
    }
    agentLastName = nom;
    agentFirstName = prenom;
    document.getElementById('display-agent-name').innerText = prenom + " " + nom;
    
    // Passage propre du Login au Tableau de Bord
    document.getElementById('welcome-screen').classList.remove('active');
    document.getElementById('dashboard-layout').classList.add('active');
    changerVueInterne('menu-view');
    renderGlobalSidebar();
}

function toggleTheme() {
    var html = document.documentElement;
    var isDark = html.getAttribute('data-theme') === 'dark';
    var next = isDark ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('arago-theme', next);
    document.getElementById('toggle-label').textContent = next === 'dark' ? 'Mode sombre' : 'Mode clair';
}

function changerVueInterne(idVue) {
    document.querySelectorAll('.inner-view').forEach(e => e.classList.remove('active'));
    document.getElementById(idVue).classList.add('active');
}

function goHome() {
    changerVueInterne('menu-view');
    renderGlobalSidebar();
}

function renderGlobalSidebar() {
    const list = document.getElementById('sidebar-progress-list');
    list.innerHTML = '';
    
    Object.keys(globalModuleTracking).forEach(id => {
        const track = globalModuleTracking[id].array;
        const played = track.filter(q => q.played).length;
        const pct = (played / 10) * 100;
        
        let barColor = "var(--bar-red)"; 
        if (pct > 0 && pct < 100) barColor = "var(--bar-orange)"; 
        else if (pct === 100) barColor = "var(--bar-green)"; 
        
        let titleText = id === 'incendie' ? 'Parcours Incendie (SSIAP)' : 'Parcours Sûreté';
        
        const card = document.createElement('div');
        card.className = 'sidebar-module-card';
        card.innerHTML = `
            <h5 style="color:var(--white); margin:0 0 5px 0;">${titleText}</h5>
            <div class="progress-wrapper">
                <div class="progress-inner-bar" style="width: ${pct}%; background-color: ${barColor};">
                    ${pct > 0 ? pct + '%' : ''}
                </div>
            </div>
        `;
        
        const dotsRow = document.createElement('div');
        dotsRow.style.cssText = "display: flex; gap: 5px; flex-wrap: wrap;";
        track.forEach(q => {
            const dot = document.createElement('div');
            dot.style.cssText = "width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--border);";
            if (q.played) {
                if (q.color === 'vert') dot.style.background = 'var(--bar-green)';
                else if (q.color === 'jaune') dot.style.background = 'var(--bar-yellow)';
                else if (q.color === 'rouge') dot.style.background = 'var(--bar-red)';
                dot.style.border = 'none';
            }
            dotsRow.appendChild(dot);
        });
        card.appendChild(dotsRow);
        list.appendChild(card);
    });
}

// ==========================================
// 3. SAUVEGARDE ET CHARGEMENT (JSON)
// ==========================================
function exportProgress() {
    try {
        saveCount++;
        const saveData = {
            firstName: agentFirstName,
            lastName: agentLastName,
            saves: saveCount,
            tracking: globalModuleTracking
        };
        const blob = new Blob([JSON.stringify(saveData)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'progression_rondes_arago.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch(e) {
        alert("Erreur lors de la sauvegarde.");
    }
}

function importProgress(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if(importedData && importedData.tracking) {
                if(importedData.firstName === agentFirstName && importedData.lastName === agentLastName) {
                    globalModuleTracking = importedData.tracking;
                    saveCount = importedData.saves || 0;
                    renderGlobalSidebar();
                    alert("Progression chargée avec succès !");
                } else {
                    alert("Erreur : Ce fichier de sauvegarde n'appartient pas à l'agent connecté.");
                }
            }
        } catch (error) {
            alert("Erreur de lecture du fichier.");
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// ==========================================
// 4. MOTEUR DU JEU ET HITBOXES (A1, C4, E8)
// ==========================================
function lancerJeu(filiere) {
    filiereActuelle = filiere;
    niveauActuel = 0;
    changerVueInterne('jeu-view');
    chargerNiveau();
}

function chargerNiveau() {
    if(niveauActuel >= 10) {
        afficherBilan();
        return;
    }

    const donnees = baseDeDonnees[filiereActuelle][niveauActuel];
    let anomaliesDeLimage = donnees.anomalies;

    // INJECTION AUTOMATIQUE DES 3 HITBOX DE TEST EN A1, C4 ET E8
    if (anomaliesDeLimage.length === 0) {
        const qcmTest = {
            titre: "Zone de Test (QCM Vierge)",
            id: [
                { texte: "Constat correct (Test)", correct: true },
                { texte: "Constat erroné", correct: false }
            ],
            justif: [
                { texte: "Analyse du risque exacte", correct: true },
                { texte: "Évaluation sans lien", correct: false }
            ],
            explication: "Ceci est une explication de test générée automatiquement."
        };

        anomaliesDeLimage = [
            { top: "0%", left: "0%", width: "10%", height: "20%", qcm: qcmTest },    // Case A1
            { top: "40%", left: "30%", width: "10%", height: "20%", qcm: qcmTest },  // Case C4
            { top: "80%", left: "70%", width: "10%", height: "20%", qcm: qcmTest }   // Case E8
        ];
    }

    erreursImageEnCours = 0;
    anomaliesTrouvees = 0;
    anomaliesTotales = anomaliesDeLimage.length;
    
    // Génération de l'indicateur visuel (Bulles 1 à 10)
    const indicateur = document.getElementById('indicateur-progression');
    indicateur.innerHTML = ''; 
    for(let i = 0; i < 10; i++) {
        let bulle = document.createElement('div');
        bulle.classList.add('bulle-progression');
        if (i === niveauActuel) bulle.classList.add('active');
        if (globalModuleTracking[filiereActuelle].array[i].played) bulle.classList.add('fait');
        bulle.textContent = i + 1;
        indicateur.appendChild(bulle);
    }

    document.getElementById('titre-mission').textContent = `Mission ${niveauActuel + 1} / 10`;
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

function terminerImage() {
    let couleur = 'vert';
    if (erreursImageEnCours > 0 && erreursImageEnCours <= 2) couleur = 'jaune';
    if (erreursImageEnCours >= 3) couleur = 'rouge';
    
    globalModuleTracking[filiereActuelle].array[niveauActuel] = { played: true, score: 1, color: couleur };
    niveauActuel++;
    
    setTimeout(() => { chargerNiveau(); }, 1000); 
}

function afficherBilan() {
    changerVueInterne('bilan-view');
    const grille = document.getElementById('grille-resultats');
    grille.innerHTML = '';
    
    globalModuleTracking[filiereActuelle].array.forEach((res, index) => {
        let pastille = document.createElement('div');
        pastille.className = `pastille ${res.color}`;
        pastille.textContent = index + 1;
        grille.appendChild(pastille);
    });
    renderGlobalSidebar();
}

// ==========================================
// 5. ACTION : PASSER (R.A.S.)
// ==========================================
document.getElementById('btn-passer-mission').addEventListener('click', () => {
    if (anomaliesTrouvees < anomaliesTotales) {
        alert("Attention, vous avez manqué des éléments sur cette zone !");
        globalModuleTracking[filiereActuelle].array[niveauActuel] = { played: true, score: 0, color: 'rouge' };
    } else {
        globalModuleTracking[filiereActuelle].array[niveauActuel] = { played: true, score: 1, color: 'vert' };
    }
    niveauActuel++;
    chargerNiveau();
});

// ==========================================
// 6. GESTION DU QCM
// ==========================================
const modal = document.getElementById('qcm-modal');
const titreQcm = document.getElementById('qcm-titre');
const conteneurId = document.getElementById('options-id');
const conteneurJustif = document.getElementById('options-justif');
const btnValider = document.getElementById('btn-valider-analyse');
const feedback = document.getElementById('qcm-feedback');
const btnFermer = document.getElementById('btn-fermer');

function ouvrirQCM(donneesQcm) {
    titreQcm.textContent = donneesQcm.titre;
    selectionId = null; selectionJustif = null;
    conteneurId.innerHTML = ''; conteneurJustif.innerHTML = '';
    feedback.classList.add('cache'); feedback.classList.remove('active');
    btnFermer.classList.add('cache');
    btnValider.style.display = 'block'; btnValider.disabled = true; btnValider.style.opacity = '0.5';

    const shuffle = arr => [...arr].sort(() => 0.5 - Math.random());

    shuffle(donneesQcm.id).forEach(opt => {
        let btn = document.createElement('button'); btn.classList.add('choice-btn');
        btn.textContent = opt.texte; btn.dataset.correct = opt.correct;
        btn.onclick = () => { selectionId = selectionnerOption(conteneurId, btn); verifierValidation(); };
        conteneurId.appendChild(btn);
    });

    shuffle(donneesQcm.justif).forEach(opt => {
        let btn = document.createElement('button'); btn.classList.add('choice-btn');
        btn.textContent = opt.texte; btn.dataset.correct = opt.correct;
        btn.onclick = () => { selectionJustif = selectionnerOption(conteneurJustif, btn); verifierValidation(); };
        conteneurJustif.appendChild(btn);
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
        btnValider.disabled = false;
        btnValider.style.opacity = '1';
    }
}

function verifierReponse(donneesQcm) {
    const idCorrect = selectionId.dataset.correct === "true";
    const justifCorrect = selectionJustif.dataset.correct === "true";

    document.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);
    btnValider.style.display = 'none';
    feedback.classList.remove('cache');
    feedback.classList.add('active');

    if (idCorrect && justifCorrect) {
        selectionId.classList.add('correct'); selectionJustif.classList.add('correct');
        feedback.innerHTML = `<strong>✓ VALIDÉ</strong><br>${donneesQcm.explication}`;
        
        anomalieEnCours.classList.add('traitee');
        anomalieEnCours.classList.remove('visible');
        anomaliesTrouvees++;
        document.getElementById('score-image').textContent = anomaliesTrouvees;

        btnFermer.classList.remove('cache');
        if(anomaliesTrouvees === anomaliesTotales) {
            btnFermer.textContent = "Terminer la ronde";
            btnFermer.onclick = () => { modal.classList.add('cache'); terminerImage(); };
        } else {
            btnFermer.textContent = "Continuer";
            btnFermer.onclick = () => modal.classList.add('cache');
        }
    } else {
        erreursImageEnCours++; 
        if (!idCorrect) selectionId.classList.add('wrong');
        if (!justifCorrect) selectionJustif.classList.add('wrong');
        feedback.innerHTML = `<strong>✗ ERREUR D'ANALYSE</strong><br>${donneesQcm.explication}`;
        
        btnFermer.classList.remove('cache');
        btnFermer.textContent = "Revoir la zone";
        btnFermer.onclick = () => modal.classList.add('cache');
    }
}

document.getElementById('fermer-croix').addEventListener('click', () => modal.classList.add('cache'));

// Bouton Aide (Afficher / Masquer les Hitboxes)
document.getElementById('btn-toggle-zones').addEventListener('click', () => {
    document.querySelectorAll('.anomalie:not(.traitee)').forEach(z => {
        z.classList.toggle('visible');
    });
});

// ==========================================
// 7. OUTIL DÉVELOPPEUR : GRILLE DE POSITIONNEMENT
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

document.getElementById('btn-toggle-grille').addEventListener('click', () => {
    grilleOverlay.classList.toggle('cache');
});