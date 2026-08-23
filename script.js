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
// 2. VARIABLES GLOBALES ET THÈME
// ==========================================
let agentFirstName = "";
let agentLastName = "";
let filiereActuelle = "";
let niveauActuel = 0;

// Tracking: stocke la couleur finale obtenue pour chaque mission
let moduleTracking = [];

let anomaliesTotales = 0;
let anomaliesTrouvees = 0;
let couleursImageEnCours = []; // Stocke les couleurs obtenues pour les anomalies de l'image en cours

let anomalieEnCours = null;
let selectionId = null;
let selectionJustif = null;

function toggleTheme() {
    var html = document.documentElement;
    var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('arago-theme', next);
    document.getElementById('toggle-label').textContent = next === 'dark' ? 'Mode sombre' : 'Mode clair';
}

// Gestion des écrans principaux
function changerEcran(idEcran) {
    document.querySelectorAll('.screen').forEach(e => e.classList.remove('active'));
    document.getElementById(idEcran).classList.add('active');
}

// Gestion des vues à l'intérieur du Dashboard
function changerVueInterne(idVue) {
    document.querySelectorAll('.inner-view').forEach(e => e.classList.remove('active'));
    document.getElementById(idVue).classList.add('active');
}

// ==========================================
// 3. WORKFLOW: ACCUEIL -> BRIEFING -> JEU
// ==========================================
function retourAccueil() {
    changerEcran('ecran-accueil');
}

function choisirParcours(filiere) {
    filiereActuelle = filiere;
    let titre = filiere === 'incendie' ? 'Briefing - Parcours Incendie' : 'Briefing - Parcours Sûreté';
    document.getElementById('briefing-titre').innerText = titre;
    changerEcran('ecran-briefing');
}

function loginAgent() {
    const nom = document.getElementById('agent-nom').value.trim();
    const prenom = document.getElementById('agent-prenom').value.trim();
    if(!nom || !prenom) {
        alert("La prise de service exige un Nom et un Prénom.");
        return;
    }
    agentLastName = nom;
    agentFirstName = prenom;
    document.getElementById('display-agent-name').innerText = prenom.toUpperCase() + " " + nom.toUpperCase();
    
    // Initialisation du tracking
    moduleTracking = new Array(10).fill(null).map(() => ({ played: false, color: 'vide' }));
    
    changerEcran('dashboard-layout');
    changerVueInterne('jeu-view');
    niveauActuel = 0;
    chargerNiveau();
    renderSidebar();
}

function renderSidebar() {
    const list = document.getElementById('sidebar-progress-list');
    list.innerHTML = '';
    
    let titreText = filiereActuelle === 'incendie' ? 'Ronde SSIAP' : 'Ronde Sûreté';
    const card = document.createElement('div');
    card.className = 'sidebar-module-card';
    card.innerHTML = `<h5 style="color:var(--white); margin:0 0 10px 0; font-size:1.1em;">${titreText}</h5>`;
    
    const dotsRow = document.createElement('div');
    dotsRow.style.cssText = "display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;";
    
    moduleTracking.forEach((m, i) => {
        const dot = document.createElement('div');
        dot.style.cssText = "width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:10px; color:var(--gray);";
        dot.innerText = i + 1;
        
        if (m.played) {
            dot.style.color = "white";
            dot.style.border = "none";
            if (m.color === 'vert') dot.style.background = 'var(--bar-green)';
            else if (m.color === 'jaune') dot.style.background = 'var(--bar-yellow)';
            else if (m.color === 'rouge') dot.style.background = 'var(--bar-red)';
        } else if (i === niveauActuel) {
            dot.style.border = "2px solid var(--accent)";
            dot.style.color = "var(--white)";
        }
        dotsRow.appendChild(dot);
    });
    
    card.appendChild(dotsRow);
    list.appendChild(card);
}

// ==========================================
// 4. SAUVEGARDE ET CHARGEMENT (JSON)
// ==========================================
function exportProgress() {
    try {
        const saveData = {
            firstName: agentFirstName, lastName: agentLastName,
            filiere: filiereActuelle, tracking: moduleTracking
        };
        const blob = new Blob([JSON.stringify(saveData)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url; link.download = 'ronde_sauvegarde.json';
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
                filiereActuelle = data.filiere || filiereActuelle;
                moduleTracking = data.tracking;
                agentFirstName = data.firstName; agentLastName = data.lastName;
                document.getElementById('display-agent-name').innerText = agentFirstName.toUpperCase() + " " + agentLastName.toUpperCase();
                
                // Reprise au premier niveau non joué
                niveauActuel = moduleTracking.findIndex(m => !m.played);
                if(niveauActuel === -1) { changerVueInterne('bilan-view'); afficherBilan(); } 
                else { changerEcran('dashboard-layout'); changerVueInterne('jeu-view'); chargerNiveau(); }
                
                renderSidebar();
                alert("Ronde rechargée avec succès !");
            } else { alert("Erreur : Identifiants incompatibles avec cette sauvegarde."); }
        } catch (error) { alert("Erreur de lecture du fichier."); }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// ==========================================
// 5. MOTEUR D'INSPECTION ET HITBOXES TEST
// ==========================================
function chargerNiveau() {
    if(niveauActuel >= 10) {
        afficherBilan();
        return;
    }

    const donnees = baseDeDonnees[filiereActuelle][niveauActuel];
    let anomaliesDeLimage = donnees.anomalies;

    // INJECTION DES HITBOXES DE TEST EN A1, C4, E8
    if (anomaliesDeLimage.length === 0) {
        const qcmTest = {
            id: [ { texte: "Constat correct", correct: true }, { texte: "Constat erroné", correct: false } ],
            justif: [ { texte: "Évaluation du risque exacte", correct: true }, { texte: "Évaluation sans lien", correct: false } ],
            explication: "Test système pour la validation des couleurs."
        };
        anomaliesDeLimage = [
            { top: "0%", left: "0%", width: "10%", height: "20%", qcm: Object.assign({titre: "Zone Test A1"}, qcmTest) },
            { top: "40%", left: "30%", width: "10%", height: "20%", qcm: Object.assign({titre: "Zone Test C4"}, qcmTest) },
            { top: "80%", left: "70%", width: "10%", height: "20%", qcm: Object.assign({titre: "Zone Test E8"}, qcmTest) }
        ];
    }

    anomaliesTrouvees = 0;
    anomaliesTotales = anomaliesDeLimage.length;
    couleursImageEnCours = []; // Réinitialisation pour la nouvelle image
    
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
    renderSidebar();
}

function terminerImage(source) {
    let finalColor = 'vert';
    
    if (source === 'RAS' && anomaliesTrouvees < anomaliesTotales) {
        // L'agent a validé la zone sans trouver toutes les anomalies
        finalColor = 'rouge';
    } else {
        // L'agent a trouvé les anomalies, on regarde ses scores (couleurs)
        if (couleursImageEnCours.includes('rouge')) finalColor = 'rouge';
        else if (couleursImageEnCours.includes('jaune')) finalColor = 'jaune';
        else finalColor = 'vert'; // Si pas d'anomalie du tout, c'est vert
    }
    
    moduleTracking[niveauActuel] = { played: true, color: finalColor };
    niveauActuel++;
    
    setTimeout(() => { chargerNiveau(); }, 500); 
}

// Action sur le bouton RAS
document.getElementById('btn-passer-mission').addEventListener('click', () => terminerImage('RAS'));

function afficherBilan() {
    changerVueInterne('bilan-view');
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
// 6. GESTION DU QCM (Logique 3 couleurs)
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

    // LOGIQUE DU SCORE : 2/2 = Vert, 1/2 = Jaune, 0/2 = Rouge
    if (idCorrect && justifCorrect) {
        couleurObtenue = 'vert';
        selectionId.classList.add('correct'); selectionJustif.classList.add('correct');
        feedback.classList.add('success');
        feedback.innerHTML = `<strong>✓ EXCELLENT (2/2)</strong><br>${donneesQcm.explication}`;
    } 
    else if (idCorrect || justifCorrect) {
        couleurObtenue = 'jaune';
        if (!idCorrect) selectionId.classList.add('wrong');
        if (!justifCorrect) selectionJustif.classList.add('wrong');
        feedback.classList.add('warning');
        feedback.innerHTML = `<strong>⚠ PARTIEL (1/2)</strong><br>${donneesQcm.explication}`;
    } 
    else {
        couleurObtenue = 'rouge';
        selectionId.classList.add('wrong'); selectionJustif.classList.add('wrong');
        feedback.classList.add('error');
        feedback.innerHTML = `<strong>✗ ERREUR (0/2)</strong><br>${donneesQcm.explication}`;
    }

    // On stocke la couleur obtenue et on marque l'anomalie comme traitée
    couleursImageEnCours.push(couleurObtenue);
    anomalieEnCours.classList.add('traitee');
    anomalieEnCours.classList.remove('visible');
    
    anomaliesTrouvees++;
    document.getElementById('score-image').textContent = anomaliesTrouvees;

    btnFermer.style.display = 'inline-block';
    if(anomaliesTrouvees === anomaliesTotales) {
        btnFermer.textContent = "Validation (Fin de l'inspection)";
        btnFermer.onclick = () => { modal.classList.add('cache'); terminerImage('FINI'); };
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
document.getElementById('btn-toggle-grille').addEventListener('click', () => grilleOverlay.classList.toggle('cache'));