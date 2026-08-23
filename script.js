// ==========================================
// 1. BASE DE DONNÉES DES PARCOURS (10 IMAGES CHACUN)
// ==========================================
const baseDeDonnees = {
    "incendie": [ // PARCOURS SSIAP
        {
            image: "incendie-photo1.jpg", 
            anomalies: [
                { 
                    top: "40%", left: "65%", width: "12%", height: "35%", 
                    qcm: {
                        titre: "Porte coupe-feu",
                        id: [
                            { texte: "Cale sous la porte coupe-feu", correct: true },
                            { texte: "Porte verrouillée", correct: false }
                        ],
                        justif: [
                            { texte: "Empêche le compartimentage en cas d'incendie.", correct: true },
                            { texte: "Gêne la circulation des personnes.", correct: false }
                        ],
                        explication: "Une porte coupe-feu ne doit jamais être calée ouverte."
                    }
                }
            ]
        },
        // PRÉ-POSITIONNEMENT DES IMAGES 2 À 10 (SSIAP)
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
        {
            image: "surete-photo1.jpg", // Votre photo du grillage par exemple
            anomalies: [
                { 
                    top: "45%", left: "16%", width: "15%", height: "25%", 
                    qcm: {
                        titre: "Périmètre extérieur",
                        id: [
                            { texte: "Grillage découpé", correct: true },
                            { texte: "Grillage rouillé", correct: false }
                        ],
                        justif: [
                            { texte: "Effraction avérée, intrusion possible.", correct: true },
                            { texte: "Problème esthétique.", correct: false }
                        ],
                        explication: "Alerter le PC et figer les lieux."
                    }
                }
            ]
        },
        // PRÉ-POSITIONNEMENT DES IMAGES 2 À 10 (SÛRETÉ)
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
// 2. MOTEUR DU JEU
// ==========================================
let filiereActuelle = "";
let niveauActuel = 0;
let erreursImageEnCours = 0;
let historiqueResultats = []; // Va stocker 'vert', 'jaune' ou 'rouge'
let anomaliesTrouvees = 0;
let anomaliesTotales = 0;

let anomalieEnCours = null;
let selectionId = null;
let selectionJustif = null;

// Navigation Écrans
function changerEcran(idEcran) {
    document.querySelectorAll('.ecran').forEach(e => e.classList.remove('active'));
    document.getElementById(idEcran).classList.add('active');
}

// Lancement au clic sur la filière
document.getElementById('choix-incendie').addEventListener('click', () => lancerJeu('incendie'));
document.getElementById('choix-surete').addEventListener('click', () => lancerJeu('surete'));

function lancerJeu(filiere) {
    filiereActuelle = filiere;
    niveauActuel = 0;
    historiqueResultats = [];
    changerEcran('ecran-jeu');
    chargerNiveau();
}

function chargerNiveau() {
    if(niveauActuel >= 10) {
        afficherBilan();
        return;
    }

    const donnees = baseDeDonnees[filiereActuelle][niveauActuel];
    erreursImageEnCours = 0;
    anomaliesTrouvees = 0;
    anomaliesTotales = donnees.anomalies.length;
    
    // Si pas d'anomalie configurée (mode création), on passe au niveau suivant
    if(anomaliesTotales === 0) {
        historiqueResultats.push('jaune'); // Valeur neutre
        niveauActuel++;
        chargerNiveau();
        return;
    }

    document.getElementById('titre-mission').textContent = `Mission ${niveauActuel + 1} / 10`;
    document.getElementById('image-fond').src = donnees.image;
    document.getElementById('score-image').textContent = "0";
    document.getElementById('total-image').textContent = anomaliesTotales;

    const conteneur = document.getElementById('conteneur-anomalies');
    conteneur.innerHTML = '';
    
    // Injecter les zones
    donnees.anomalies.forEach(anomalie => {
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
    
    historiqueResultats.push(couleur);
    niveauActuel++;
    
    setTimeout(() => {
        chargerNiveau();
    }, 1500); // Laisse le temps de lire le dernier feedback
}

function afficherBilan() {
    changerEcran('ecran-bilan');
    const grille = document.getElementById('grille-resultats');
    grille.innerHTML = '';
    
    historiqueResultats.forEach((couleur, index) => {
        let pastille = document.createElement('div');
        pastille.classList.add('pastille', couleur);
        pastille.textContent = index + 1;
        grille.appendChild(pastille);
    });
}

document.getElementById('btn-rejouer').addEventListener('click', () => changerEcran('ecran-accueil'));

// ==========================================
// 3. GESTION DU QCM (Logique existante)
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
    feedback.classList.add('cache'); btnFermer.classList.add('cache');
    btnValider.classList.remove('cache'); btnValider.disabled = true;

    donneesQcm.id.forEach(opt => {
        let btn = document.createElement('button'); btn.classList.add('btn-option');
        btn.textContent = opt.texte; btn.dataset.correct = opt.correct;
        btn.onclick = () => { selectionId = selectionnerOption(conteneurId, btn); verifierValidation(); };
        conteneurId.appendChild(btn);
    });

    donneesQcm.justif.forEach(opt => {
        let btn = document.createElement('button'); btn.classList.add('btn-option');
        btn.textContent = opt.texte; btn.dataset.correct = opt.correct;
        btn.onclick = () => { selectionJustif = selectionnerOption(conteneurJustif, btn); verifierValidation(); };
        conteneurJustif.appendChild(btn);
    });

    modal.classList.remove('cache');
    
    // Attacher les données au bouton valider pour ce tour
    btnValider.onclick = () => verifierReponse(donneesQcm);
}

function selectionnerOption(conteneur, boutonClique) {
    conteneur.querySelectorAll('.btn-option').forEach(b => b.classList.remove('selectionne'));
    boutonClique.classList.add('selectionne');
    return boutonClique;
}

function verifierValidation() {
    if (selectionId && selectionJustif) btnValider.disabled = false;
}

function verifierReponse(donneesQcm) {
    const idCorrect = selectionId.dataset.correct === "true";
    const justifCorrect = selectionJustif.dataset.correct === "true";

    document.querySelectorAll('.btn-option').forEach(b => b.disabled = true);
    btnValider.classList.add('cache');
    feedback.classList.remove('cache');

    if (idCorrect && justifCorrect) {
        selectionId.classList.add('correct'); selectionJustif.classList.add('correct');
        feedback.textContent = "Bonne analyse ! " + donneesQcm.explication;
        feedback.style.color = "#2ecc71";
        
        anomalieEnCours.classList.add('traitee');
        anomalieEnCours.classList.remove('visible');
        anomaliesTrouvees++;
        document.getElementById('score-image').textContent = anomaliesTrouvees;

        btnFermer.classList.remove('cache');
        
        // Si toutes les anomalies de l'image sont trouvées
        if(anomaliesTrouvees === anomaliesTotales) {
            btnFermer.onclick = () => {
                modal.classList.add('cache');
                terminerImage();
            };
        } else {
            btnFermer.onclick = () => modal.classList.add('cache');
        }

    } else {
        erreursImageEnCours++; // On compte une erreur pour le bilan final
        if (!idCorrect) selectionId.classList.add('erreur');
        if (!justifCorrect) selectionJustif.classList.add('erreur');
        feedback.innerHTML = "Analyse incorrecte.<br>" + donneesQcm.explication;
        feedback.style.color = "#e74c3c";
        
        btnFermer.classList.remove('cache');
        btnFermer.onclick = () => modal.classList.add('cache');
    }
}

document.getElementById('fermer-croix').addEventListener('click', () => modal.classList.add('cache'));

// Bouton d'aide (Ajoute une pénalité si on veut être strict, ici on compte juste l'affichage)
document.getElementById('btn-toggle-zones').addEventListener('click', () => {
    // Optionnel : erreursImageEnCours++; si l'utilisation de l'aide pénalise la couleur
    document.querySelectorAll('.anomalie:not(.traitee)').forEach(z => z.classList.toggle('visible'));
});