// scripts/_build-nuevas-pilot-17.mjs
// TEMP (Phase 17 Plan 03): materializa las 40 variantes nuevas propuestas como
// ejercicios multiple-choice LEGACY AISLADOS (payload) en una fixture que
// validate-ai-pass.mjs + gsd-validate-exercise escanean (Pitfall 2 / A2: el
// VALIDATION-PROMPT es legacy-payload-céntrico). La explanation de cada temp
// = la explanation del slot destino (existente en preposiciones.json) o la
// nueva del doc para los 2 slots locativos. Se borra al final de Task 2.
import { readFileSync, writeFileSync } from 'node:fs';

const PREPO = JSON.parse(readFileSync('content/exercises/preposiciones.json', 'utf8'));
const slotExpl = (id) => {
  const s = PREPO.exercises.find((e) => e.id === id);
  if (!s) throw new Error(`slot no encontrado: ${id}`);
  return s.explanation;
};

// explanations NUEVAS de los 2 slots locativos (del 17-VARIANTES-NUEVAS.md, Bloque C)
const EXPL_IN_LOC = "Con ciertos lugares geográficos abiertos el italiano usa In SIN artículo como locución fija para indicar dónde se está o adónde se va: in spiaggia, in montagna, in campagna, in città. Vado in spiaggia equivale a 'voy a la playa'. Cuidado: el hispanohablante calca 'a la playa' y se inclina por A, pero estos lugares piden In sin artículo. Excepción dentro del grupo: el mar usa Al (al mare), no In.";
const EXPL_AL_MARE = "Para el mar el italiano usa Al (a + il) como excepción dentro de los locativos geográficos: andare al mare = 'ir a la playa / al mar'. Contrasta con in spiaggia, in montagna, in campagna, que van con In sin artículo. El mar es el caso especial que rompe la serie In: se dice al mare, nunca 'in mare' (que significaría 'dentro del agua') ni 'a mare'.";

// [tempId, slotDestino, prompt, options, correctIndex, explanationOverride?]
const V = [
  ['nv-di-origen','preposiciones-di-origen','Paolo è ___ Napoli di nascita.',['di','a','da','in'],0],
  ['nv-da-provenienza','preposiciones-da-provenienza','Arrivo a Napoli ___ Firenze stasera.',['di','a','da','in'],2],
  ['nv-in-paese','preposiciones-in-paese','Vivo ___ Francia da tre anni.',['a','in','da','su'],1],
  ['nv-con-compagnia','preposiciones-con-compagnia','Vado al cinema ___ mia sorella.',['di','per','con','tra'],2],
  ['nv-per-scopo','preposiciones-per-scopo','Lavoro ___ guadagnare bene.',['di','a','per','con'],2],
  ['nv-per-durata','preposiciones-per-durata',"Ieri ho dormito ___ otto ore. (en español: 'Ayer dormí durante ocho horas')",['a','per','in','da'],1],
  ['nv-a-ciudad','preposiciones-a-ciudad',"Quest'inverno vado ___ Milano per lavoro.",['in','a','da','per'],1],
  ['nv-a-hora','preposiciones-a-hora','Ceniamo ___ mezzanotte.',['in','per','a','tra'],2],
  ['nv-da-agente','preposiciones-da-agente',"La cena è preparata ___ lei. (en español: 'La cena está preparada por ella')",['da','di','per','con'],0],
  ['nv-in-trasporto','preposiciones-in-trasporto','Vado a scuola ___ treno.',['con','a','in','per'],2],
  ['nv-con-strumento','preposiciones-con-strumento','Taglio il pane ___ il coltello.',['a','con','di','per'],1],
  ['nv-del','preposiciones-del','Il tetto ___ palazzo è rosso.',['del','al','dal','nel'],0],
  ['nv-dello','preposiciones-dello','La fine ___ spettacolo è triste.',['del','dello','della','dei'],1],
  ['nv-della','preposiciones-della','Il colore ___ macchina è rosso.',['del','dello','della','dalla'],2],
  ['nv-dei','preposiciones-dei','Le voci ___ ragazzi sono allegre.',['dei','degli','delle','del'],0],
  ['nv-degli','preposiciones-degli','Il rumore ___ aerei è forte.',['dei','degli','delle','dello'],1],
  ['nv-delle','preposiciones-delle','Le pagine ___ riviste sono colorate.',['dei','degli','delle','della'],2],
  ['nv-allo','preposiciones-allo','Porto i bambini ___ zoo.',['al','allo','alla','agli'],1],
  ['nv-alla','preposiciones-alla','Andiamo ___ festa insieme.',['al','allo','alla','alle'],2],
  ['nv-ai','preposiciones-ai','Scrivo una mail ___ colleghi.',['ai','agli','alle','dei'],0],
  ['nv-agli','preposiciones-agli','Do da mangiare ___ uccelli.',['ai','agli','alle','allo'],1],
  ['nv-alle','preposiciones-alle',"Regalo dei fiori ___ mie cugine. (en español: 'Regalo flores a mis primas')",['ai','agli','alle','delle'],2],
  ['nv-nel','preposiciones-nel',"Il latte è ___ frigorifero. (en español: 'La leche está dentro del frigorífico')",['sul','nel','al','dal'],1],
  ['nv-nello','preposiciones-nello','Lavoro ___ studio del dentista.',['nel','nello','nella','negli'],1],
  ['nv-nella','preposiciones-nella','I bambini giocano ___ stanza.',['nel','nella','alla','dalla'],1],
  ['nv-nei','preposiciones-nei','I libri sono ___ cassetti.',['nei','negli','nelle','dei'],0],
  ['nv-negli','preposiciones-negli','I documenti sono ___ uffici.',['nei','negli','nelle','sugli'],1],
  ['nv-nelle','preposiciones-nelle','I biscotti sono ___ scatole.',['nei','negli','nelle','sulle'],2],
  ['nv-dal','preposiciones-dal','Torno ___ mercato adesso.',['dal','dallo','dalla','dai'],0],
  ['nv-dallo','preposiciones-dallo','Esco ___ stadio dopo la partita.',['dal','dallo','dalla','dai'],1],
  ['nv-dalla','preposiciones-dalla',"Esco ___ banca alle cinque. (en español: 'Salgo del banco a las cinco')",['dalla','alla','nella','sulla'],0],
  ['nv-dai','preposiciones-dai','Torno ___ nonni stasera.',['dai','dagli','dalle','degli'],0],
  ['nv-dagli','preposiciones-dagli','Vengo ___ zii in campagna.',['dai','dagli','dalle','degli'],1],
  ['nv-dalle','preposiciones-dalle','Torno ___ nonne domani.',['dai','dagli','dalle','delle'],2],
  ['nv-sullo','preposiciones-sullo','La giacca è ___ sgabello.',['sul','sullo','sulla','sui'],1],
  ['nv-sulla','preposiciones-sulla','Il libro è ___ scrivania.',['sul','sullo','sulla','alla'],2],
  ['nv-sui','preposiciones-sui','I piatti sono ___ tavoli.',['sui','sugli','sulle','nei'],0],
  ['nv-sugli','preposiciones-sugli','Le foto sono ___ scaffali.',['sui','sugli','sulle','negli'],1],
  ['nv-sulle','preposiciones-sulle','I bicchieri sono ___ mensole.',['sui','sugli','sulle','nelle'],2],
  ['nv-in-spiaggia','preposiciones-in-locativo',"D'estate andiamo ___ spiaggia ogni giorno.",['a','in','su','da'],1,EXPL_IN_LOC],
  ['nv-in-montagna','preposiciones-in-locativo',"Quest'inverno vado ___ montagna a sciare.",['a','in','su','da'],1,EXPL_IN_LOC],
  ['nv-in-campagna','preposiciones-in-locativo','I nonni vivono ___ campagna.',['a','in','su','da'],1,EXPL_IN_LOC],
  ['nv-al-mare','preposiciones-al-mare',"Quest'estate andiamo ___ mare in Sicilia.",['a','al','in','su'],1,EXPL_AL_MARE],
];

const exercises = V.map(([id, slot, prompt, options, correctIndex, explOverride]) => ({
  id,
  type: 'multiple-choice',
  categoryIds: ['preposiciones'],
  payload: {
    prompt,
    options,
    correctIndex,
    explanation: explOverride || slotExpl(slot),
  },
  notes: `TEMP Phase 17 P03 — variante nueva para slot ${slot}. Validar por quórum cross-vendor, luego mover a variants[] y borrar este temp.`,
  validation: { status: 'pending', passes: [] },
}));

writeFileSync('tests/fixtures/_nuevas-pilot-17.json', JSON.stringify({ exercises }, null, 2) + '\n');
console.log(`Escritas ${exercises.length} variantes temp en tests/fixtures/_nuevas-pilot-17.json`);
console.log('ids:', exercises.map((e) => e.id).join(', '));
