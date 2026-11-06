// Simboli e logiche di sensibilizzazione
var simboli = ["❤️", "🔔", "🔥", "📢", "👍", "👤"];
var giriFatti = 0;
var oraInizio = Date.now();
var staGirando = false;

var cuori = { messaggio: "🎉 +50 Like! Sensazione di approvazione sociale.", tipo: "festa" };
var campanelle = { messaggio: "🔔 12 Nuove notifiche! Creazione dello stato d'ansia (FOMO).", tipo: "festa" };
var fiamme = { messaggio: "🔥 Streak di 7 giorni! Meccanismo di dipendenza da continuità.", tipo: "festa" };
var megafoni = { messaggio: "📢 Attenzione monetizzata! Mostrata una pubblicità.", tipo: "pubblicita" };
var quasi = { messaggio: "😮 Quasi! La quasi-vincita stimola comunque il rilascio di dopamina.", tipo: "delusione" };
var niente = { messaggio: "Nessun risultato... Il ciclo di ricerca riparte subito.", tipo: "delusione" };

// Web Audio API
var audioCtx = null;
function bip(freq, dur) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.frequency.value = freq;
    gain.gain.value = 0.05;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch(e){}
}

function suonoFesta() {
  bip(523.25, 0.1);
  setTimeout(function(){ bip(659.25, 0.1); }, 100);
  setTimeout(function(){ bip(783.99, 0.2); }, 200);
}

function suonoDelusione() {
  bip(300, 0.15);
  setTimeout(function(){ bip(220, 0.25); }, 150);
}

// Inizializzazione Rulli
function popolaRulli() {
  for (var i = 1; i <= 3; i++) {
    var strip = document.getElementById("strip" + i);
    strip.innerHTML = "";
    for (var j = 0; j < 15; j++) {
      var item = document.createElement("div");
      item.className = "rullo-item";
      item.textContent = simboli[Math.floor(Math.random() * simboli.length)];
      strip.appendChild(item);
    }
  }
}
popolaRulli();

function scegliEsito() {
  var n = Math.random() * 100;
  if (n < 10) return { target: ["❤️", "❤️", "❤️"], esito: cuori };
  if (n < 20) return { target: ["🔔", "🔔", "🔔"], esito: campanelle };
  if (n < 30) return { target: ["🔥", "🔥", "🔥"], esito: fiamme };
  if (n < 38) return { target: ["📢", "📢", "📢"], esito: megafoni };
  if (n < 70) {
    var s = simboli[Math.floor(Math.random() * simboli.length)];
    var d = simboli[Math.floor(Math.random() * simboli.length)];
    while(d === s) d = simboli[Math.floor(Math.random() * simboli.length)];
    return { target: [s, s, d], esito: quasi };
  }
  var s1 = simboli[0], s2 = simboli[1], s3 = simboli[2];
  return { target: [s1, s2, s3], esito: niente };
}

function avviaRulloScorrimento(index, simboloFinale, delayStop) {
  var strip = document.getElementById("strip" + (index + 1));
  var items = strip.querySelectorAll(".rullo-item");
  items[items.length - 1].textContent = simboloFinale;

  strip.style.transition = "none";
  strip.style.transform = "translateY(0px)";

  setTimeout(function() {
    strip.style.transition = "transform " + (delayStop / 1000) + "s cubic-bezier(0.1, 0.9, 0.2, 1)";
    strip.style.transform = "translateY(-" + ((items.length - 1) * 100) + "px)";
  }, 50);

  var audioTimer = setInterval(function() { bip(200 + Math.random() * 100, 0.03); }, 90);

  setTimeout(function() {
    clearInterval(audioTimer);
    bip(350, 0.08);
  }, delayStop);
}

function gira() {
  if (staGirando) return;
  staGirando = true;
  giriFatti++;
  
  document.getElementById("btnGira").disabled = true;
  document.getElementById("messaggio").textContent = "Generazione stimolo dopaminergico...";

  var risultato = scegliEsito();
  popolaRulli();

  var tempi = [1200, 2000, 2800];
  for (var i = 0; i < 3; i++) {
    avviaRulloScorrimento(i, risultato.target[i], tempi[i]);
  }

  setTimeout(function() {
    document.getElementById("messaggio").textContent = risultato.esito.messaggio;
    if (risultato.esito.tipo === "festa") suonoFesta();
    else if (risultato.esito.tipo === "delusione") suonoDelusione();
    else if (risultato.esito.tipo === "pubblicita") {
      suonoFesta();
      document.getElementById("pubblicita").classList.remove("nascosto");
    }
    
    staGirando = false;
    document.getElementById("btnGira").disabled = false;
    document.getElementById("sliderSpin").value = 0;
  }, tempi[2] + 200);
}

// Gestione Eventi Slider & Pulsanti
var slider = document.getElementById("sliderSpin");
slider.addEventListener("input", function() {
  if (this.value >= 70 && !staGirando) {
    gira();
  }
});

document.getElementById("btnGira").addEventListener("click", gira);

document.getElementById("btnEsci").addEventListener("click", function() {
  if (staGirando) return;
  document.getElementById("resoconto").classList.remove("nascosto");
  document.getElementById("passoDomanda").classList.remove("nascosto");
  document.getElementById("passoRisultati").classList.add("nascosto");
});

document.getElementById("btnChiudiPubblicita").addEventListener("click", function() {
  document.getElementById("pubblicita").classList.add("nascosto");
});

document.getElementById("btnVediRisultato").addEventListener("click", function() {
  var stima = document.getElementById("stima").value;
  var fine = Date.now();
  var secondi = Math.max(1, Math.round((fine - oraInizio) / 1000));
  var minuti = secondi / 60;
  var euro = (minuti / 60) * 10;
  var fattore = (minuti / 20).toFixed(1);

  document.getElementById("testoTempo").textContent = 
    "Hai trascorso " + Math.floor(secondi / 60) + " m e " + (secondi % 60) + " s sulla piattaforma.";
  
  document.getElementById("testoAlternative").textContent = 
    "In questo tempo avresti potuto: guardare " + fattore + " episodi di una serie, percorrere " + 
    (fattore * 2).toFixed(1) + " km a piedi o leggere circa " + Math.round(fattore * 10) + " pagine.";

  document.getElementById("testoSoldi").textContent = 
    "Valutando la tua attenzione 10 €/ora, hai fatto guadagnare circa " + 
    euro.toFixed(2).replace(".", ",") + " € agli inserzionisti.";

  var diff = "";
  if (stima !== "") {
    var val = Number(stima);
    if (val < giriFatti) diff = " (Hai sottostimato di " + (giriFatti - val) + " giri!)";
    else if (val > giriFatti) diff = " (Hai sovrastimato!)";
    else diff = " (Stima esatta!)";
  }

  document.getElementById("testoGiri").textContent = 
    "Stima inserita: " + (stima || "N.D.") + " | Giri reali effettuati: " + giriFatti + diff;

  document.getElementById("passoDomanda").classList.add("nascosto");
  document.getElementById("passoRisultati").classList.remove("nascosto");
});

document.getElementById("btnRigioca").addEventListener("click", function() {
  document.getElementById("resoconto").classList.add("nascosto");
  giriFatti = 0;
  oraInizio = Date.now();
  document.getElementById("messaggio").textContent = "Trascina lo slider a destra o premi il pulsante per iniziare!";
  document.getElementById("stima").value = "";
});