// ===== Configurazione =====
var simboli = ["❤️", "🔔", "🔥", "📢", "👍", "👤"];
var INTERVALLO_AD = 30;   // secondi tra una pubblicità e l'altra
var ATTESA_CHIUDI = 5;    // secondi prima che si possa chiudere

// Pubblicità: ogni 30 s ne esce una a caso. Sostituire i file in /assets con i vostri.
var pubblicita = [
  { tipo: "video", src: "assets/pubblicita.mp4" },
  { tipo: "video", src: "assets/pubblicita1.mp4" },
  { tipo: "video", src: "assets/pubblicita2.mp4" }
];

var esiti = {
  cuori:      { messaggio: "+50 like. Sensazione di approvazione sociale.", tipo: "festa" },
  campanelle: { messaggio: "12 nuove notifiche. Creazione dello stato d'ansia (FOMO).", tipo: "festa" },
  fiamme:     { messaggio: "Serie di 7 giorni. Meccanismo di dipendenza da continuità.", tipo: "festa" },
  megafoni:   { messaggio: "Attenzione monetizzata: è stata mostrata una pubblicità.", tipo: "pubblicita" },
  quasi:      { messaggio: "Quasi. La quasi-vincita stimola comunque il rilascio di dopamina.", tipo: "quasi" },
  niente:     { messaggio: "Nessun risultato. Il ciclo di ricerca riparte subito.", tipo: "niente" }
};

var info = {
  festa: { nome: "Ricompensa", prog: 30, spiega: "Premi imprevedibili (rinforzo a rapporto variabile): non sai quando arriva il prossimo, quindi continui a controllare. È il meccanismo più resistente all'abbandono." },
  quasi: { nome: "Quasi-vincita", prog: 32, spiega: "Due simboli uguali e uno diverso. Il cervello la vive come un successo mancato per poco e ti spinge a riprovare." },
  niente: { nome: "Nessun risultato", prog: 30, spiega: "Anche la perdita fa parte del ciclo: l'attesa del prossimo stimolo conta quanto il premio." },
  pubblicita: { nome: "Pubblicità (simbolo 📢)", prog: 8, spiega: "La tua attenzione, interrotta e venduta all'inserzionista." }
};

// ===== Stato =====
var giriFatti = 0, staGirando = false, oraInizio = Date.now();
var stats = { festa: 0, quasi: 0, niente: 0, pubblicita: 0 };
var adViste = 0, contaAd = 0, adAperta = false, adInAttesa = false, inPausa = false, adTimer = null;

function $(id) { return document.getElementById(id); }

// ===== Audio =====
var audioCtx = null;
function bip(freq, dur) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.frequency.value = freq; gain.gain.value = 0.05;
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + dur);
  } catch (e) {}
}
function suonoFesta() { bip(523.25, .1); setTimeout(function () { bip(659.25, .1); }, 100); setTimeout(function () { bip(783.99, .2); }, 200); }
function suonoDelusione() { bip(300, .15); setTimeout(function () { bip(220, .25); }, 150); }

// ===== Rulli =====
function popolaRulli() {
  for (var i = 1; i <= 3; i++) {
    var strip = $("strip" + i);
    strip.innerHTML = "";
    for (var j = 0; j < 15; j++) {
      var item = document.createElement("div");
      item.className = "rullo-item";
      item.textContent = simboli[Math.floor(Math.random() * simboli.length)];
      strip.appendChild(item);
    }
    strip.style.transition = "none";
    strip.style.transform = "translateY(0)";
  }
}
popolaRulli();

function casuale() { return simboli[Math.floor(Math.random() * simboli.length)]; }

function scegliEsito() {
  var n = Math.random() * 100;
  if (n < 10) return { target: ["❤️", "❤️", "❤️"], esito: esiti.cuori };
  if (n < 20) return { target: ["🔔", "🔔", "🔔"], esito: esiti.campanelle };
  if (n < 30) return { target: ["🔥", "🔥", "🔥"], esito: esiti.fiamme };
  if (n < 38) return { target: ["📢", "📢", "📢"], esito: esiti.megafoni };
  if (n < 70) {
    var s = casuale(), d = casuale();
    while (d === s) d = casuale();
    return { target: [s, s, d], esito: esiti.quasi };
  }
  return { target: [simboli[0], simboli[1], simboli[2]], esito: esiti.niente };
}

function avviaRullo(index, finale, durata) {
  var strip = $("strip" + (index + 1));
  var items = strip.querySelectorAll(".rullo-item");
  var h = items[0].offsetHeight;
  items[items.length - 1].textContent = finale;
  setTimeout(function () {
    strip.style.transition = "transform " + (durata / 1000) + "s cubic-bezier(0.1, 0.9, 0.2, 1)";
    strip.style.transform = "translateY(-" + ((items.length - 1) * h) + "px)";
  }, 50);
  var t = setInterval(function () { bip(200 + Math.random() * 100, .03); }, 90);
  setTimeout(function () { clearInterval(t); bip(350, .08); }, durata);
}

// ===== Leva =====
function tiraLeva() {
  if (staGirando) return;
  staGirando = true;
  giriFatti++;
  var leva = document.querySelector(".leva");
  var btn = $("btnLeva");
  btn.disabled = true;
  leva.classList.remove("risale");
  leva.classList.add("tirata");           // il pomello scende da solo
  $("messaggio").textContent = "Generazione dello stimolo...";

  var r = scegliEsito();
  var tempi = [1200, 2000, 2800];
  setTimeout(function () {                 // la slot parte quando la leva è in basso
    popolaRulli();
    for (var i = 0; i < 3; i++) avviaRullo(i, r.target[i], tempi[i]);
  }, 350);
  setTimeout(function () { leva.classList.add("risale"); leva.classList.remove("tirata"); }, 500);

  setTimeout(function () {
    $("messaggio").textContent = r.esito.messaggio;
    var t = r.esito.tipo;
    stats[t]++;
    if (t === "festa" || t === "pubblicita") suonoFesta(); else suonoDelusione();
    staGirando = false;
    btn.disabled = false;
    if (t === "pubblicita") mostraPubblicita();
    else if (adInAttesa) { adInAttesa = false; mostraPubblicita(); }
  }, 350 + tempi[2] + 200);
}
$("btnLeva").addEventListener("click", tiraLeva);

// ===== Pubblicità =====
function segnaposto(testo) {
  var d = document.createElement("div");
  d.className = "placeholder";
  d.textContent = testo;
  return d;
}

function mostraPubblicita() {
  if (adAperta) return;
  adAperta = true; adViste++; contaAd = 0;
  var ad = pubblicita[Math.floor(Math.random() * pubblicita.length)];
  var box = $("adMedia");
  box.innerHTML = "";
  var el;
  if (ad.tipo === "video") {
  el = document.createElement("video");
  el.playsInline = true; el.loop = true;
  el.src = ad.src;
  el.muted = false;
  var p = el.play();
  if (p && p.catch) p.catch(function () {
  // Il browser ha bloccato l'audio: parte muto e compaiono i controlli per attivarlo
    el.muted = true;
    el.controls = true;
    el.play();
    });
  } else {
    el = document.createElement("img");
    el.src = ad.src; el.alt = "Pubblicità";
  }
  el.onerror = function () { box.innerHTML = ""; box.appendChild(segnaposto("Segnaposto pubblicità: aggiungi il file " + ad.src)); };
  box.appendChild(el);
  $("pubblicita").classList.remove("nascosto");

  var btn = $("btnChiudiPubblicita"), resta = ATTESA_CHIUDI;
  btn.disabled = true;
  btn.textContent = "Chiudi tra " + resta + " s";
  clearInterval(adTimer);
  adTimer = setInterval(function () {
    resta--;
    if (resta > 0) btn.textContent = "Chiudi tra " + resta + " s";
    else { clearInterval(adTimer); btn.disabled = false; btn.textContent = "Chiudi e continua"; }
  }, 1000);
}

$("btnChiudiPubblicita").addEventListener("click", function () {
  $("adMedia").innerHTML = "";             // ferma il video
  $("pubblicita").classList.add("nascosto");
  adAperta = false;
});

// Timer: conta solo se non siamo nel resoconto né in una pubblicità
setInterval(function () {
  if (inPausa || adAperta) return;
  contaAd++;
  if (contaAd >= INTERVALLO_AD) {
    contaAd = 0;
    if (staGirando) adInAttesa = true;      // aspetta la fine del giro
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

function numero(valore, etichetta, classe) {
  return '<div class="numero ' + (classe || "") + '"><b>' + valore + "</b><span>" + etichetta + "</span></div>";
}
function barra(nome, val, max, colore) {
  var w = Math.round((val / max) * 100);
  return '<div class="barra-riga"><span>' + nome + '</span><div class="barra"><i style="width:' + w + "%;background:" + colore + '"></i></div><em>' + val + "</em></div>";
}
function fmt(n) { return n.toFixed(1).replace(".", ","); }

$("btnVediRisultato").addEventListener("click", function () {
  var stima = $("stima").value;
  var secondi = Math.max(1, Math.round((Date.now() - oraInizio) / 1000));
  var min = secondi / 60;
  var euro = (min / 60) * 10;

  $("numeri").innerHTML =
    numero(Math.floor(secondi / 60) + " m " + (secondi % 60) + " s", "sulla piattaforma") +
    numero(giriFatti, "leve tirate") +
    numero(euro.toFixed(2).replace(".", ",") + " €", "valore generato per gli inserzionisti") +
    numero(adViste, "pubblicità subite", "rosso");

  var max = Math.max(giriFatti, Number(stima) || 0, 1);
  var html = "", diff = "";
  if (stima !== "") {
    var v = Number(stima);
    html += barra("Tua stima", v, max, "var(--muted)");
    if (v < giriFatti) diff = "Hai sottostimato di " + (giriFatti - v) + " tiri: il tempo sembrava passare più in fretta del reale.";
    else if (v > giriFatti) diff = "Hai sovrastimato di " + (v - giriFatti) + " tiri.";
    else diff = "Stima esatta, un caso raro in una sessione così.";
  } else diff = "Non hai inserito una stima.";
  html += barra("Reale", giriFatti, max, "var(--red)");
  $("barre").innerHTML = html;
  $("testoGiri").textContent = diff;

  var righe = "";
  ["festa", "quasi", "niente", "pubblicita"].forEach(function (k) {
    var ott = giriFatti ? Math.round((stats[k] / giriFatti) * 100) : 0;
    righe += '<div class="esito"><div class="esito-testa">' + info[k].nome + ": " + stats[k] +
      "<span>programmato " + info[k].prog + "% · ottenuto " + ott + "%</span></div><p>" + info[k].spiega + "</p></div>";
  });
  $("esiti").innerHTML = righe;

  $("testoAlternative").textContent =
    "In " + Math.floor(secondi / 60) + " minuti e " + (secondi % 60) + " secondi avresti potuto camminare per " +
    fmt((min / 60) * 5) + " km oppure leggere circa " + Math.round((min / 60) * 40) + " pagine.";

  $("passoDomanda").classList.add("nascosto");
  $("passoRisultati").classList.remove("nascosto");
});

$("btnRigioca").addEventListener("click", function () {
  $("resoconto").classList.add("nascosto");
  giriFatti = 0; adViste = 0; contaAd = 0; adInAttesa = false;
  stats = { festa: 0, quasi: 0, niente: 0, pubblicita: 0 };
  oraInizio = Date.now();
  inPausa = false;
  $("messaggio").textContent = "Tira la leva per iniziare.";
  $("stima").value = "";
});
