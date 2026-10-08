const http=require('http');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const DATA=path.join(__dirname,'data','events.json');
const PUBLIC=path.join(__dirname,'public');
if(!fs.existsSync(path.dirname(DATA))) fs.mkdirSync(path.dirname(DATA),{recursive:true});
if(!fs.existsSync(DATA)) fs.writeFileSync(DATA,'{}');
const read=()=>JSON.parse(fs.readFileSync(DATA,'utf8')||'{}');
const write=x=>{const tmp=DATA+'.tmp';fs.writeFileSync(tmp,JSON.stringify(x,null,2));fs.renameSync(tmp,DATA)};
const id=()=>crypto.randomBytes(6).toString('base64url');
const json=(res,status,obj)=>{const b=JSON.stringify(obj);res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':'*'});res.end(b)};
const body=req=>new Promise((resolve,reject)=>{let s='';req.on('data',c=>{s+=c;if(s.length>1e6) reject(new Error('body too large'))});req.on('end',()=>{try{resolve(s?JSON.parse(s):{})}catch(e){reject(e)}});});
function serve(res,file){fs.readFile(file,(e,b)=>{if(e){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':'application/javascript; charset=utf-8'});res.end(b)})}
const server=http.createServer(async(req,res)=>{
 try{
  const u=new URL(req.url,'http://localhost');
  if(req.method==='GET'&&u.pathname==='/api/health') return json(res,200,{ok:true});
  if(req.method==='POST'&&u.pathname==='/api/events'){
   const x=await body(req); if(!x.name) return json(res,400,{error:'일정 이름이 필요합니다.'});
   const events=read(), eventId=id();
   events[eventId]={id:eventId,name:String(x.name).slice(0,100),startDate:x.startDate||'',endDate:x.endDate||'',startTime:x.startTime||'09:00',endTime:x.endTime||'18:00',days:x.days||[],slots:x.slots||[],participants:[],createdAt:new Date().toISOString()};
   write(events); return json(res,201,{event:events[eventId]});
  }
  const m=u.pathname.match(/^\/api\/events\/([^/]+)$/);
  if(m&&req.method==='GET') {const e=read()[m[1]]; return e?json(res,200,{event:e}):json(res,404,{error:'일정을 찾을 수 없습니다.'})}
  if(m&&req.method==='POST') {const events=read(),e=events[m[1]];if(!e)return json(res,404,{error:'일정을 찾을 수 없습니다.'});const x=await body(req);if(!x.name)return json(res,400,{error:'이름이 필요합니다.'});
   const slots=Array.isArray(x.slots)?[...new Set(x.slots.filter(v=>typeof v==='string').slice(0,5000))]:[]; const p={name:String(x.name).trim().slice(0,50),slots,updatedAt:new Date().toISOString()};
   e.participants=(e.participants||[]).filter(q=>q.name!==p.name);e.participants.push(p);write(events);return json(res,200,{event:e});
  }
  if(req.method==='GET') {let file=u.pathname==='/'?path.join(PUBLIC,'index.html'):path.join(PUBLIC,u.pathname.replace(/^\//,''));if(!file.startsWith(PUBLIC))return res.end('Forbidden');return serve(res,file)}
  res.writeHead(405);res.end('Method Not Allowed');
 }catch(e){console.error(e);json(res,500,{error:'서버 오류가 발생했습니다.'})}
});
const port=Number(process.env.PORT)||3000;server.listen(port,()=>console.log(`Meetly running at http://localhost:${port}`));
