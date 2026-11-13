// TURAPRO BOT FINAL - Numero del robot: 3105109092
// Tu personal: 3167615144 - NO se toca
// Cuando 【entity-Meta¦canonical_name=Meta】 te de el Token y el Phone ID REAL del 3105109092, los pegas en Render:
// WHATSAPP_TOKEN = Token nuevo
// WHATSAPP_PHONE_ID = Phone ID nuevo del 3105109092
// VERIFY_TOKEN = TURAPRO123
// FIREBASE_URL = https://turapro-buenaventura-71f5d-default-rtdb.firebaseio.com

const 【entity-express¦canonical_name=express】 = require('【entity-express¦canonical_name=express】');
const 【entity-axios¦canonical_name=axios】 = require('【entity-axios¦canonical_name=axios】');
const app = 【entity-express¦canonical_name=express】();
app.use(【entity-express¦canonical_name=express】.json());
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const FB = process.env.FIREBASE_URL;

async function mandarWhatsApp(numero, texto){
  await 【entity-axios¦canonical_name=axios】.post('https://graph.facebook.com/v18.0/'+PHONE_ID+'/messages',
    {messaging_product:'whatsapp', to:numero, type:'text', text:{body:texto}},
    {headers:{Authorization:'Bearer '+TOKEN}});
}
async function buscarConductor(){
  let r = await 【entity-axios¦canonical_name=axios】.get(FB + '/conductores.json');
  let lista = Object.values(r.data||{}).filter(c=>c.conectado);
  return lista[0] || null;
}
app.post('/webhook', async (req,res)=>{
  try{
    let msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if(!msg) return res.sendStatus(200);
    let numero = msg.from;
    let texto = (msg.text?.body||'').trim().toLowerCase();
    if(texto.includes('hola') || texto.includes('taxi') || texto.includes('quiero') || texto.includes('buenas')){
      await mandarWhatsApp(numero, '🚕 Hola, soy TURAPRO BOT, el robot de Junior.\n\n¿Para dónde vas? Escríbeme así:\n\n*Paloseco a Centro*\n\nY yo te busco el taxi más cerca.');
    }
    else if(texto.includes(' a ')){
      let partes = texto.split(' a ');
      let origen = partes[0], destino = partes[1];
      await mandarWhatsApp(numero, '✅ Entendido. Buscando el taxi más cerca de '+origen+'...');
      let cond = await buscarConductor();
      if(!cond){
        await mandarWhatsApp(numero, '😔 No hay conductor conectado ahorita. Intenta en 5 minutos.');
        return res.sendStatus(200);
      }
      await 【entity-axios¦canonical_name=axios】.put(FB + '/pedidos/activo.json', {pasajero:'Pasajera WhatsApp', pasajeroCel:numero, origen:origen, destino:destino, tarifa:8000, comision:1000, total:9000, estado:'buscando', asignadoA:cond.celular, hora:Date.now(), porBot:true});
      await mandarWhatsApp(numero, '🔍 Ya encontré al más cerca. Esperando que acepte...');
      setTimeout(async ()=>{
        let p = (await 【entity-axios¦canonical_name=axios】.get(FB + '/pedidos/activo.json')).data;
        if(p && p.estado==='aceptado'){
          await mandarWhatsApp(numero, '🎉 ¡Listo! Te llega *'+p.conductor+'*\nPlaca: *'+p.placa+'*\n📱 Celular del conductor que aceptó: *'+p.conductorCel+'*\nDe '+p.origen+' a '+p.destino+'\nTotal: $'+p
