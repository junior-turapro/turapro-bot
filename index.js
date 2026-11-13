// TURAPRO BOT FINAL - Numero del robot: 3105109092
// Tu personal: 3167615144 - NO se toca
// WHATSAPP_TOKEN = Token nuevo
// WHATSAPP_PHONE_ID = Phone ID nuevo
// VERIFY_TOKEN = TURAPRO123
// FIREBASE_URL = https://turapro-buenaventura-71f5d-default-rtdb.firebaseio.com

const ex = require('ex'+'press');
const ax = require('ax'+'ios');
const app = ex();
app.use(ex.json());
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const FB = process.env.FIREBASE_URL;

async function mandarWhatsApp(numero, texto){
  await ax.post('https://graph.facebook.com/v18.0/'+PHONE_ID+'/messages',
    {messaging_product:'whatsapp', to:numero, type:'text', text:{body:texto}},
    {headers:{Authorization:'Bearer '+TOKEN}});
}
async function buscarConductor(){
  let r = await ax.get(FB + '/conductores.json');
  let lista = Object.values(r.data||{}).filter(c=>c.conectado);
  return lista[0] || null;
}
app.post('/webhook', async (req,res)=>{
 console.log('LLEGO MENSAJE'); try{
    let msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if(!msg) return res.sendStatus(200);
    let numero = msg.from;
    let texto = (msg.text?.body||'').trim().toLowerCase();
    if(texto.includes('hola') || texto.includes('taxi') || texto.includes('quiero') || texto.includes('buenas')){
      await mandarWhatsApp(numero, 'Hola, soy TURAPRO BOT, el robot de Junior. Para donde vas? Escribeme asi: Paloseco a Centro');
    }
    else if(texto.includes(' a ')){
      let partes = texto.split(' a ');
      let origen = partes[0], destino = partes[1];
      await mandarWhatsApp(numero, 'Entendido. Buscando el taxi mas cerca de '+origen+'...');
      let cond = await buscarConductor();
      if(!cond){
        await mandarWhatsApp(numero, 'No hay conductor conectado ahorita. Intenta en 5 minutos.');
        return res.sendStatus(200);
      }
      await ax.put(FB + '/pedidos/activo.json', {pasajero:'Pasajera WhatsApp', pasajeroCel:numero, origen:origen, destino:destino, tarifa:8000, comision:1000, total:9000, estado:'buscando', asignadoA:cond.celular, hora:Date.now(), porBot:true});
      await mandarWhatsApp(numero, 'Ya encontre al mas cerca. Esperando que acepte...');
      setTimeout(async ()=>{
        let p = (await ax.get(FB + '/pedidos/activo.json')).data;
        if(p && p.estado==='aceptado'){
          await mandarWhatsApp(numero, 'Listo! Te llega '+p.conductor+' Placa: '+p.placa+' Celular: '+p.conductorCel+' De '+p.origen+' a '+p.destino+' Total: $'+p.total);
        } else {
          await mandarWhatsApp(numero, 'El conductor mas cerca no acepto. Buscando otro...');
        }
      }, 15000);
    }
    else {
      await mandarWhatsApp(numero, 'No te entendi. Escribeme: Paloseco a Centro');
    }
    res.sendStatus(200);
  }catch(e){ console.log(e.message); res.sendStatus(200); }
});
const VERIFY = process.env.VERIFY_TOKEN || 'TURAPRO123';
app.get('/webhook', (req,res)=>{
  console.log('LLEGO MENSAJE');if(req.query['hub.verify_token']===VERIFY) return res.send(req.query['hub.challenge']);
  return res.sendStatus(403);
});
app.get('/', (req,res)=>{ res.send('TURAPRO BOT Live'); });
app.listen(process.env.PORT || 3000, ()=>console.log('TURAPRO BOT 3105109092 corriendo'));
