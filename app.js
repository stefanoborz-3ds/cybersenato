// =====================================================
// GIRA LA RUOTA - Script commentato passo per passo
// =====================================================

// ---------- 1. I DATI DI PARTENZA ----------

// I simboli che possono comparire sui rulli
var simboli = ["❤️", "🔔", "🔥", "📢", "👍", "👤"];

// Il "contatore nascosto": quanti giri e da quando giochi
var giriFatti = 0;
var oraInizio = Date.now();   // Date.now() = ora attuale in millisecondi
var staGirando = false;       // serve a non far premere "Gira" due volte insieme

// I messaggi per ogni combinazione
var cuori = {
  messaggio: "🎉 +50 like! Che fortuna!",
  meccanismo: "Ricompensa variabile: a volte vinci, a volte no, e non sai quando."
};
var campanelle = {
  messaggio: "🔔 Hai 12 nuove notifiche! Gira ancora per vederle...",
  meccanismo: "FOMO: la paura di perdere qualcosa ti spinge a continuare."
};
var fiamme = {
  messaggio: "🔥 Streak di 7 giorni! Non interromperla!",
  meccanismo: "Obbligo di continuità: l'app ti fa sentire in colpa se smetti."
};
var megafoni = {
  messaggio: "📢 Ecco una pubblicità!",
  meccanismo: "La tua attenzione è il prodotto: i social la vendono agli inserzionisti."
};
var quasi = {
  messaggio: "😮 Quasi!!! Ci sei andato vicinissimo...",
  meccanismo: "Momento di incertezza: la quasi-vincita ti fa venire voglia di riprovare."
};
var niente = {
  messaggio: "Niente stavolta... gira ancora!",
  meccanismo: "Il gioco continua comunque: non c'è mai un 'hai finito', come lo scroll infinito."
};


// ---------- 2. COLLEGO IL JAVASCRIPT AGLI ELEMENTI HTML ----------

var rulli = [
  document.getElementById("rullo1"),
  document.getElementById("rullo2"),
  document.getElementById("rullo3")
];
var messaggio = document.getElementById("messaggio");
var btnGira = document.getElementById("btnGira");
var btnEsci = document.getElementById("btnEsci");
var pubblicita = document.getElementById("pubblicita");
var resoconto = document.getElementById("resoconto");


// ---------- 3. IL SUONO ----------
// Crea un "bip" con la frequenza (altezza) e la durata che gli dai.
// Non servono file audio.

var audio = null;

function bip(frequenza, durata) {
  if (audio === null) {
    audio = new (window.AudioContext || window.webkitAudioContext)();
  }
  var oscillatore = audio.createOscillator();
  var volume = audio.createGain();
  oscillatore.frequency.value = frequenza;
  volume.gain.value = 0.1;
  oscillatore.connect(volume);
  volume.connect(audio.destination);
  oscillatore.start();
  oscillatore.stop(audio.currentTime + durata);
}

// Suono di festa: tre note che salgono
function suonoFesta() {
  bip(500, 0.15);
  setTimeout(function () { bip(650, 0.15); }, 150);
  setTimeout(function () { bip(800, 0.3); }, 300);
}

// Suono di delusione: due note che scendono
function suonoDelusione() {
  bip(300, 0.2);
  setTimeout(function () { bip(200, 0.4); }, 200);
}


// ---------- 4. SCEGLIERE IL RISULTATO ----------

// Restituisce un simbolo a caso
function simboloACaso() {
  return simboli[Math.floor(Math.random() * simboli.length)];
}

// Sceglie cosa succede in questo giro e quali simboli mostrare.
// Restituisce i 3 simboli e l'oggetto con messaggio e meccanismo.
function scegliRisultato() {
  var n = Math.random() * 100;   // numero a caso da 0 a 100

  // 8% tre cuori
  if (n < 8) {
    return { simboli: ["❤️", "❤️", "❤️"], esito: cuori, suono: "festa" };
  }
  // 6% tre campanelle
  if (n < 14) {
    return { simboli: ["🔔", "🔔", "🔔"], esito: campanelle, suono: "festa" };
  }
  // 6% tre fiamme
  if (n < 20) {
    return { simboli: ["🔥", "🔥", "🔥"], esito: fiamme, suono: "festa" };
  }
  // 5% tre megafoni
  if (n < 25) {
    return { simboli: ["📢", "📢", "📢"], esito: megafoni, suono: "festa" };
  }
  // 35% quasi: due uguali e uno diverso
  if (n < 60) {
    var uguale = simboloACaso();
    var diverso = simboloACaso();
    while (diverso === uguale) {
      diverso = simboloACaso();   // ripeto finché è davvero diverso
    }
    return { simboli: [uguale, uguale, diverso], esito: quasi, suono: "delusione" };
  }
  // 40% niente: tre simboli tutti diversi
  var a = simboli[0];
  var b = simboli[1];
  var c = simboli[2];
  // mescolo un po' i simboli per variare
  var mescolati = simboli.slice().sort(function () { return Math.random() - 0.5; });
  return { simboli: [mescolati[0], mescolati[1], mescolati[2]], esito: niente, suono: "delusione" };
}


// ---------- 5. IL GIRO ----------

function gira() {
  if (staGirando) {
    return;   // se sta già girando, non fare nulla
  }
  staGirando = true;
  btnGira.disabled = true;
  giriFatti = giriFatti + 1;     // aggiorno il contatore nascosto
  messaggio.textContent = "Gira, gira, gira...";

  var risultato = scegliRisultato();

  // Fermo i rulli uno alla volta, sempre più tardi (rallentamento)
  var tempiStop = [1000, 1800, 2800];

  for (var i = 0; i < 3; i++) {
    avviaRullo(i, risultato.simboli[i], tempiStop[i]);
  }

  // Quando l'ultimo rullo si ferma, mostro l'esito
  setTimeout(function () {
    mostraEsito(risultato);
  }, tempiStop[2] + 100);
}

// Fa girare un rullo cambiando simbolo ogni pochi millisecondi
function avviaRullo(numero, simboloFinale, tempoStop) {
  var rullo = rulli[numero];
  rullo.classList.add("gira");

  // Ogni 80 ms cambio simbolo e faccio un bip: il suono sale col tempo
  var contatore = 0;
  var timer = setInterval(function () {
    rullo.textContent = simboloACaso();
    contatore = contatore + 1;
    bip(200 + contatore * 15, 0.05);
  }, 80);

  // Allo scadere del tempo, fermo il rullo sul simbolo scelto
  setTimeout(function () {
    clearInterval(timer);
    rullo.textContent = simboloFinale;
    rullo.classList.remove("gira");
    bip(300, 0.1);   // "clic" di arresto
  }, tempoStop);
}

// Mostra il messaggio, il suono e aggiorna il diario
function mostraEsito(risultato) {
  messaggio.textContent = risultato.esito.messaggio;

  if (risultato.suono === "festa") {
    suonoFesta();
  } else {
    suonoDelusione();
  }

  // Se sono 3 megafoni, mostro la pubblicità a schermo intero
  if (risultato.esito === megafoni) {
    pubblicita.classList.remove("nascosto");
  }

  staGirando = false;
  btnGira.disabled = false;
}


// ---------- 6. IL RESOCONTO FINALE ----------

function esci() {
  if (staGirando) {
    return;
  }
  resoconto.classList.remove("nascosto");
  document.getElementById("passoDomanda").style.display = "block";
  document.getElementById("passoRisultati").style.display = "none";
}

function mostraRisultati() {
  var stima = document.getElementById("stima").value;

  // Calcoli
  var fine_ora = Date.now();
  var secondi = Math.round((fine_ora - oraInizio) / 1000);
  var minuti = secondi / 60;
  var euro = minuti / 60 * 10;     // 1 ora = 10 euro

  // Tempo speso
  var minutiInteri = Math.floor(secondi / 60);
  var secondiResto = secondi % 60;
  document.getElementById("testoTempo").textContent =
    "Hai passato " + minutiInteri + " minuti e " + secondiResto + " secondi sulla ruota.";

  // Confronto con le alternative (20 minuti = 1 episodio, 2 km, 10 pagine, 1 allenamento)
  var fattore = minuti / 20;
  document.getElementById("testoAlternative").textContent =
    "Nello stesso tempo avresti potuto: guardare circa " + fattore.toFixed(1) +
    " episodi di una serie, fare " + (fattore * 2).toFixed(1) +
    " km di passeggiata, leggere " + Math.round(fattore * 10) +
    " pagine di un libro, oppure fare " + fattore.toFixed(1) + " allenamenti brevi.";

  // Soldi
  document.getElementById("testoSoldi").textContent =
    "Se 1 ora della tua attenzione vale 10 €, in questo tempo hai fatto guadagnare circa " +
    euro.toFixed(2).replace(".", ",") + " € all'azienda, senza essere pagato.";

  // Giri: stima contro realtà
  var testoGiri = "";
  if (stima === "") {
    testoGiri = "Non hai dato una stima. I giri reali sono stati " + giriFatti + ".";
  } else {
    testoGiri = "Hai stimato " + stima + ", ne hai fatti " + giriFatti + ".";
    if (Number(stima) < giriFatti) {
      testoGiri = testoGiri + " Hai sottostimato: succede quasi a tutti!";
    }
  }
  document.getElementById("testoGiri").textContent = testoGiri;

  // Mostro i risultati e nascondo la domanda
  document.getElementById("passoDomanda").style.display = "none";
  document.getElementById("passoRisultati").style.display = "block";
}

// Torna al gioco e riparte da zero
function rigioca() {
  resoconto.classList.add("nascosto");
  giriFatti = 0;
  oraInizio = Date.now();
  messaggio.textContent = "Premi il pulsante per giocare!";
  document.getElementById("stima").value = "";
}


// ---------- 7. COLLEGO I PULSANTI ALLE FUNZIONI ----------

btnGira.addEventListener("click", gira);
btnEsci.addEventListener("click", esci);
document.getElementById("btnVediRisultato").addEventListener("click", mostraRisultati);
document.getElementById("btnRigioca").addEventListener("click", rigioca);
document.getElementById("btnChiudiPubblicita").addEventListener("click", function () {
  pubblicita.classList.add("nascosto");
});
