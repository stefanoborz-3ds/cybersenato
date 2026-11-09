// ===== Configurazione =====
var simboli = ["cuore", "campanella", "fiamma", "megafono", "like", "utente"];

// Icone neon 2D: tutte con lo stesso stile (solo contorno). Il colore e il glow sono nel CSS.
var ICONE = {
  cuore: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  campanella: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  fiamma: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  megafono: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  like: '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
  utente: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
};
function icona(nome) {
  return '<svg class="icona ' + nome + '" viewBox="0 0 24 24">' + ICONE[nome] + "</svg>";
}
var INTERVALLO_AD = 30;  // secondi tra una pubblicità e l'altra
var ATTESA_CHIUDI = 7;   // secondi prima che si possa chiudere
var TEMPI_RULLI = [1200, 2000, 2800];

// Ogni pubblicità ha il suo file e il suo messaggio educativo (modifica i testi come vuoi)
var pubblicita = [
  { file: "assets/pubblicita.mp4",  verticale: true, messaggio: "Il tuo tempo ha un valore. Non lasciare che siano i social a decidere come spenderlo. Usa la tecnologia, non lasciare che sia lei a usare te." },
  { file: "assets/pubblicita1.mp4", verticale: true, messaggio: "A volte ci perdiamo così tanto nel mondo dei social da dimenticarci di vivere quello reale. Non lasciare che uno schermo ti rubi il tempo, le esperienze e i momenti che contano davvero." },
  { file: "assets/pubblicita2.mp4", verticale: true, messaggio: "Non tutto quello che trovi sui social è vero. Prima di credere a una notizia o condividerla, fermati, verifica la fonte e informati. Essere online non significa essere informati." }
];

// Esiti: simbolo vincente (o null), messaggio, categoria
var vincite = [
  { simbolo: "cuore", tipo: "festa", messaggio: "Nuova Vincita!" },
  { simbolo: "campanella", tipo: "festa", messaggio: "Nuova Vincita!" },
  { simbolo: "fiamma", tipo: "festa", messaggio: "Nuova Vincita!" },
  { simbolo: "megafono", tipo: "pubblicita", messaggio: "Attenzione monetizzata." }
];
var MSG_QUASI = "Quasi. La quasi-vincita stimola comunque il rilascio di dopamina.";
var MSG_NIENTE = "Nessuna vincita.";

var info = {
  festa: { nome: "Ricompensa", prog: 20, spiega: "Premi: non sai quando arriva il prossimo, quindi continui a tirare la leva. È il meccanismo più resistente per farti continuare a giocare." },
  quasi: { nome: "Quasi-vincita", prog: 32, spiega: "Due simboli uguali e uno diverso. Il cervello la vive come un successo mancato per poco e ti spinge a riprovare." },
  niente: { nome: "Nessun risultato", prog: 40, spiega: "Anche la perdita fa parte del ciclo: l'attesa del prossimo stimolo conta quanto il premio." },
  pubblicita: { nome: "Pubblicità (simbolo megafono)", prog: 8, spiega: "La tua attenzione, interrotta e venduta all'inserzionista." }
};

// ===== Stato =====
var giri = 0, staGirando = false, inizio = Date.now();
var stats = { festa: 0, quasi: 0, niente: 0, pubblicita: 0 };
var ultimoTipo = "", serie = 0;   // serie = quante volte di fila è uscito lo stesso esito
var adViste = 0, secondiAd = 0, adAperta = false, adInAttesa = false, inPausa = false, timerChiudi = null;

function $(id) { return document.getElementById(id); }
var boxStato = document.querySelector(".message-box");
function casuale() { return simboli[Math.floor(Math.random() * simboli.length)]; }

// ===== Suoni =====
// Il suono va mentre i rulli girano e si ferma a fine giro (quindi anche prima di una pubblicità).
// Se il file manca non succede nulla.
var suonoGiro = new Audio("assets/audio.mp3");
suonoGiro.loop = true;   // se il file è più corto del giro, riparte da capo

function avviaSuono() {
  suonoGiro.currentTime = 0;
  suonoGiro.play().catch(function () {});
}
function fermaSuono() {
  suonoGiro.pause();
}
var suonoVittoria = new Audio("assets/win.mp3");
function avviaVittoria() {
  suonoVittoria.currentTime = 0;
  suonoVittoria.play().catch(function () {});
}

// ===== Rulli =====
function resetRulli() {
  for (var i = 1; i <= 3; i++) {
    var strip = $("strip" + i);
    strip.innerHTML = "";
    strip.style.transition = "none";
    strip.style.transform = "translateY(0)";
    for (var j = 0; j < 15; j++) {
      var item = document.createElement("div");
      item.className = "rullo-item";
      item.innerHTML = icona(casuale());
      strip.appendChild(item);
    }
  }
}
resetRulli();

var vincenti = ["cuore", "campanella", "fiamma", "like", "utente"];

function scegliEsito() {
  var n = Math.random() * 100;
  if (n < 20) {
    var s = vincenti[Math.floor(n / 4)];   // 5 simboli x 4% = 20%
    return { simboli: [s, s, s], tipo: "festa", messaggio: "Nuova Vincita!" };
  }
  if (n < 28) return { simboli: ["megafono", "megafono", "megafono"], tipo: "pubblicita", messaggio: vincite[3].messaggio };
  if (n < 60) {
    var a = casuale(), b = casuale();
    while (b === a) b = casuale();
    var coppia = [a, a, b];
    // la coppia non è sempre nelle prime due posizioni
    var pos = Math.floor(Math.random() * 3);
    if (pos === 1) coppia = [a, b, a];
    if (pos === 2) coppia = [b, a, a];
    return { simboli: coppia, tipo: "quasi", messaggio: MSG_QUASI };
  }
  // niente: 3 simboli tutti diversi, in ordine casuale
  var mix = simboli.slice();
  for (var i = mix.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = mix[i]; mix[i] = mix[j]; mix[j] = t;
  }
  return { simboli: [mix[0], mix[1], mix[2]], tipo: "niente", messaggio: MSG_NIENTE };
}

function giraRullo(i, simbolo, durata) {
  var strip = $("strip" + (i + 1));
  var voci = strip.children;
  voci[voci.length - 1].innerHTML = icona(simbolo);
  var altezza = voci[0].offsetHeight;
  setTimeout(function () {
    strip.style.transition = "transform " + durata / 1000 + "s cubic-bezier(0.1, 0.9, 0.2, 1)";
    strip.style.transform = "translateY(-" + (voci.length - 1) * altezza + "px)";
  }, 50);
}

// ===== Coriandoli =====
var cv = $("coriandoli");
var ctx = cv.getContext("2d");
var pezzi = [];
var animazioneAttiva = false;
var COLORI_CONF = ["#ffc83d", "#ff2fd6", "#22e3ff", "#2ecc71", "#e63946", "#ffffff"];

function adattaCanvas() {
  cv.width = window.innerWidth;
  cv.height = window.innerHeight;
}
adattaCanvas();
window.addEventListener("resize", adattaCanvas);

function lanciaCoriandoli() {
  // due cannoni, uno per lato, che sparano verso il centro
  for (var i = 0; i < 1000; i++) {
    var daSinistra = i % 2 === 0;
    var angolo = (daSinistra ? -1 : -1) * (Math.PI / 4 + Math.random() * Math.PI / 4);
    var velocita = 10 + Math.random() * 12;
    pezzi.push({
      x: daSinistra ? 0 : cv.width,
      y: cv.height * 0.75,
      vx: (daSinistra ? 1 : -1) * Math.abs(Math.cos(angolo)) * velocita,
      vy: Math.sin(angolo) * velocita,
      w: 6 + Math.random() * 8,
      h: 10 + Math.random() * 10,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.4,
      colore: COLORI_CONF[Math.floor(Math.random() * COLORI_CONF.length)],
      vita: 0
    });
  }
  if (!animazioneAttiva) {
    animazioneAttiva = true;
    requestAnimationFrame(animaCoriandoli);
  }
}

function animaCoriandoli() {
  ctx.clearRect(0, 0, cv.width, cv.height);
  for (var i = pezzi.length - 1; i >= 0; i--) {
    var p = pezzi[i];
    p.vy += 0.35;          // gravità
    p.vx *= 0.99;          // attrito dell'aria
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.vita++;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.colore;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
    if (p.y > cv.height + 40) pezzi.splice(i, 1);
  }
  if (pezzi.length > 0) {
    requestAnimationFrame(animaCoriandoli);
  } else {
    animazioneAttiva = false;
    ctx.clearRect(0, 0, cv.width, cv.height);
  }
}

// ===== Leva =====
$("btnLeva").addEventListener("click", function () {
  if (staGirando) return;
  staGirando = true;
  giri++;
  $("btnLeva").disabled = true;
  $("messaggio").textContent = "Generazione dello stimolo...";
  boxStato.className = "message-box";

  var leva = document.querySelector(".leva");
  leva.classList.remove("risale");
  leva.classList.add("tirata");
  setTimeout(function () { leva.classList.remove("tirata"); leva.classList.add("risale"); }, 500);

  var esito = scegliEsito();
  setTimeout(function () {
    resetRulli();
    avviaSuono();
    for (var i = 0; i < 3; i++) giraRullo(i, esito.simboli[i], TEMPI_RULLI[i]);
  }, 350);

  setTimeout(function () {
    $("messaggio").textContent = esito.messaggio;
    boxStato.className = "message-box stato-" + esito.tipo;
    stats[esito.tipo]++;
    if (esito.tipo === "festa") lanciaCoriandoli();

    // Conta quante volte di fila esce lo stesso tipo di esito
    if (esito.tipo === ultimoTipo) serie++;
    else serie = 1;
    ultimoTipo = esito.tipo;

    if (serie === 3) {
      $("messaggio").textContent = esito.messaggio;
    }

    fermaSuono();
    if (esito.tipo === "festa") avviaVittoria();
    staGirando = false;
    $("btnLeva").disabled = false;
    if (esito.tipo === "pubblicita" || adInAttesa) {
      adInAttesa = false;
      mostraPubblicita();
    }
  }, 350 + TEMPI_RULLI[2] + 200);
});

// ===== Pubblicità =====
function mostraPubblicita() {
  if (adAperta) return;
  adAperta = true;
  adViste++;
  secondiAd = 0;

  var box = $("adMedia");
  var v = document.createElement("video");
  var ad = pubblicita[Math.floor(Math.random() * pubblicita.length)];
  box.className = "ad-media" + (ad.verticale ? " verticale" : "");
  v.src = ad.file;
  document.querySelector(".piccolo").innerHTML = "<strong>Messaggio educativo:</strong> " + ad.messaggio;
  v.loop = true;
  v.playsInline = true;
  v.play().catch(function () {      // audio bloccato dal browser: parte muto con i controlli
    v.muted = true;
    v.controls = true;
    v.play();
  });
  v.onerror = function () {
    box.innerHTML = '<div class="placeholder">Segnaposto pubblicità: aggiungi il file ' + v.getAttribute("src") + "</div>";
  };
  box.innerHTML = "";
  box.appendChild(v);
  $("pubblicita").classList.remove("nascosto");

  var btn = $("btnChiudiPubblicita");
  var resta = ATTESA_CHIUDI;
  btn.disabled = true;
  btn.textContent = "Chiudi tra " + resta + " s";
  clearInterval(timerChiudi);
  timerChiudi = setInterval(function () {
    resta--;
    if (resta > 0) {
      btn.textContent = "Chiudi tra " + resta + " s";
    } else {
      clearInterval(timerChiudi);
      btn.disabled = false;
      btn.textContent = "Chiudi e continua";
    }
  }, 1000);
}

$("btnChiudiPubblicita").addEventListener("click", function () {
  $("adMedia").innerHTML = "";   // ferma il video
  $("pubblicita").classList.add("nascosto");
  adAperta = false;
});

// Ogni 30 secondi (fuori da resoconto e pubblicità) compare una pubblicità
setInterval(function () {
  if (inPausa || adAperta) return;
  secondiAd++;
  if (secondiAd >= INTERVALLO_AD) {
    secondiAd = 0;
    if (staGirando) adInAttesa = true;
    else mostraPubblicita();
  }
}, 1000);

// ===== Resoconto =====
$("btnEsci").addEventListener("click", function () {
  if (staGirando) return;
  inPausa = true;
  $("resoconto").classList.remove("nascosto");
  $("passoDomanda").classList.remove("nascosto");
  $("passoRisultati").classList.add("nascosto");
});

function riquadro(valore, etichetta, classe) {
  return '<div class="numero ' + (classe || "") + '"><b>' + valore + "</b><span>" + etichetta + "</span></div>";
}

function barra(nome, valore, max, colore) {
  var larghezza = Math.round((valore / max) * 100);
  return '<div class="barra-riga"><span>' + nome + '</span><div class="barra"><i style="width:' +
    larghezza + "%;background:" + colore + '"></i></div><em>' + valore + "</em></div>";
}

$("btnVediRisultato").addEventListener("click", function () {
  var stimaTesto = $("stima").value;
  var stima = Number(stimaTesto);
  var secondi = Math.max(1, Math.round((Date.now() - inizio) / 1000));
  var ore = secondi / 3600;
  var m = Math.floor(secondi / 60), s = secondi % 60;

  $("numeri").innerHTML =
    riquadro(m + " m " + s + " s", "sulla piattaforma") +
    riquadro(giri, "leve tirate") +
    riquadro((ore * 10 + 0.10 * adViste).toFixed(2).replace(".", ",") + " €", "Valore teorico generato per l'azienda") +
    riquadro(adViste, "pubblicità subite", "rosso");

  // Stima e realtà
  var max = Math.max(giri, stima, 1);
  var html = "", testo;
  if (stimaTesto === "") {
    testo = "Non hai inserito una stima.";
  } else {
    html += barra("Tua stima", stima, max, "var(--muted)");
    if (stima < giri) testo = "Hai sottostimato di " + (giri - stima) + " tiri: il tempo sembrava passare più in fretta del reale.";
    else if (stima > giri) testo = "Hai sovrastimato di " + (stima - giri) + " tiri.";
    else testo = "Stima esatta, un caso raro in una sessione così.";
  }
  $("barre").innerHTML = html + barra("Reale", giri, max, "var(--red)");
  $("testoGiri").textContent = testo;

  // Esiti ottenuti vs programmati
  var righe = "";
  for (var tipo in info) {
    var ottenuto = giri ? Math.round((stats[tipo] / giri) * 100) : 0;
    righe += '<div class="esito"><div class="esito-testa">' + info[tipo].nome + ": " + stats[tipo] +
      "<span>programmato " + info[tipo].prog + "% · ottenuto " + ottenuto + "%</span></div><p>" +
      info[tipo].spiega + "</p></div>";
  }
  $("esiti").innerHTML = righe;

  var km = (ore * 5).toFixed(1).replace(".", ",");
  $("testoAlternative").textContent = "In " + m + " minuti e " + s + " secondi avresti potuto camminare per " +
    km + " km oppure leggere circa " + Math.round(ore * 40) + " pagine.";

  $("passoDomanda").classList.add("nascosto");
  $("passoRisultati").classList.remove("nascosto");
});

$("btnRigioca").addEventListener("click", function () {
  $("resoconto").classList.add("nascosto");
  ultimoTipo = ""; serie = 0;
  giri = 0; adViste = 0; secondiAd = 0; adInAttesa = false; inPausa = false;
  stats = { festa: 0, quasi: 0, niente: 0, pubblicita: 0 };
  inizio = Date.now();
  $("messaggio").textContent = "Tira la leva per iniziare.";
  boxStato.className = "message-box";
  $("stima").value = "";
});
