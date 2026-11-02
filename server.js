import http from 'node:http';
import {readFile} from 'node:fs/promises';
const files = {'/':'index.html','/index.html':'index.html','/app.js':'app.js','/core.js':'core.js','/db.js':'db.js','/styles.css':'styles.css'};
const mime={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8'};
http.createServer(async(req,res)=>{
  const file=files[new URL(req.url,'http://localhost').pathname];
  if(!file){res.writeHead(404);res.end('Not found');return;}
  try {const body=await readFile(new URL(file,import.meta.url));res.writeHead(200,{'Content-Type':mime[file.split('.').pop()],'Cache-Control':'no-cache','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'",'X-Content-Type-Options':'nosniff'});res.end(body);}catch{res.writeHead(500);res.end('파일을 읽을 수 없습니다.');}
}).listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('MusicMate listening on port '+(process.env.PORT||3000)));
