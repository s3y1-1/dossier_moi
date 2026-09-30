/* ============ À MODIFIER ============ */
const CONFIG = {
  titre: "Dossier Moi",
  auteur: "Lyes Prévost",
  textes: [
    { titre: "Ma première blessure", fichier: "textes/texte1.docx" },
    { titre: "Ma première fois au football", fichier: "textes/texte2.docx" },
    { titre: "La première fois que j'ai assisté à un match de football", fichier: "textes/texte3.docx" },
    { titre: "Ma première fois au Maroc", fichier: "textes/texte4.docx" },
    { titre: "Mon premier gros voyage scolaire", fichier: "textes/texte5.docx" }
  ]
};
/* ==================================== */

const COULEURS = ["var(--soleil)", "var(--corail)", "var(--menthe)", "var(--violet)", "var(--ciel)"];
const $ = (id) => document.getElementById(id);
const N = CONFIG.textes.length;
let courant = 0;

document.title = CONFIG.titre;
$("titre").textContent = CONFIG.titre;
$("sous").textContent = CONFIG.sousTitre;
$("auteur").textContent = CONFIG.auteur;

// Convertit un fichier Word en HTML
async function convertir(buffer) {
  const r = await mammoth.convertToHtml({ arrayBuffer: buffer });
  return r.value;
}

// Charge chaque .docx du dossier "textes" au démarrage
async function chargerTout() {
  await Promise.all(CONFIG.textes.map(async (t) => {
    try {
      const rep = await fetch(t.fichier);
      if (!rep.ok) throw new Error("absent");
      t.html = await convertir(await rep.arrayBuffer());
    } catch (e) {
      t.html = null; // fichier absent (ou page ouverte sans serveur)
    }
  }));
  afficherCartes();
}

function afficherCartes() {
  $("cartes").innerHTML = "";
  CONFIG.textes.forEach((t, i) => {
    const b = document.createElement("button");
    b.className = "carte" + (t.html ? "" : " vide");
    b.style.setProperty("--c", COULEURS[i % COULEURS.length]);
    b.innerHTML = `<span class="num">${i + 1}</span><span><h3></h3><span class="etat">${t.html ? "Lire ce texte" : "Fichier manquant"}</span></span>`;
    b.querySelector("h3").textContent = t.titre;
    b.onclick = () => ouvrir(i);
    $("cartes").appendChild(b);
  });
}

function ouvrir(i) {
  courant = i;
  const t = CONFIG.textes[i];
  $("feuille").style.setProperty("--c", COULEURS[i % COULEURS.length]);
  $("lecture-titre").textContent = t.titre;
  const zone = $("lecture-texte");
  if (t.html) {
    zone.innerHTML = t.html;
  } else {
    zone.innerHTML = `<div class="manque"><p>Le fichier <b>${t.fichier}</b> n'a pas été trouvé.</p><p>Mets-le dans le dossier <b>textes</b> (et ouvre le site avec un serveur, voir le fichier LISEZMOI), ou choisis-le ici :</p><button class="action" id="choisir">Choisir le fichier Word</button></div>`;
    $("choisir").onclick = () => $("fichier").click();
  }
  $("prec").textContent = i > 0 ? "← " + CONFIG.textes[i - 1].titre : "";
  $("suiv").textContent = i < N - 1 ? CONFIG.textes[i + 1].titre + " →" : "";
  $("prec").onclick = () => ouvrir(courant - 1);
  $("suiv").onclick = () => ouvrir(courant + 1);
  $("accueil").hidden = true;
  $("lecture").hidden = false;
  scrollTo(0, 0);
}

// Solution de secours : choisir le fichier à la main
$("fichier").onchange = async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  CONFIG.textes[courant].html = await convertir(await f.arrayBuffer());
  e.target.value = "";
  ouvrir(courant);
};

$("retour").onclick = () => {
  $("lecture").hidden = true;
  $("accueil").hidden = false;
  afficherCartes();
  scrollTo(0, 0);
};

chargerTout();
