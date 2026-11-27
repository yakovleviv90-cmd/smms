// Keep old Home Screen drafts and the previously downloaded offline editor accessible.
const oldHome=self.registration.scope;
const oldIndex=new URL('index.html',oldHome).href;
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
  if(event.request.mode!=='navigate')return;
  const url=new URL(event.request.url);
  url.search='';
  if(url.href!==oldHome && url.href!==oldIndex)return;
  event.respondWith((async()=>{
    try{
      const response=await fetch(event.request,{cache:'no-cache'});
      if(response.ok)return response;
    }catch{ /* Offline installations may still have the original editor. */ }
    return await caches.match(oldIndex) || Response.redirect(new URL('/palosa-studio/',oldHome).href);
  })());
});

