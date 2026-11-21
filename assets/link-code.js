/* Keeps the ?src= code of the link a visitor arrived by (a flyer's QR code, a post) for 30 days, and hands it
   to the sign-up forms as "channel". The app's server cleans it again and counts it on Admin > Recruitment
   (delivery-app server/signup-channel.ts). A later link with its own code replaces it. */
(function(){
  var KEY="pagar.linkCode", DAYS=30;
  function clean(v){ return String(v||"").trim().toLowerCase().replace(/[^a-z0-9._-]+/g,"-").slice(0,40).replace(/^[-._]+|[-._]+$/g,""); }
  function fromUrl(){ try{ var p=new URLSearchParams(location.search); return clean(p.get("src")||p.get("utm_source")); }catch(e){ return ""; } }
  var seen=fromUrl();
  if(seen){ try{ localStorage.setItem(KEY,JSON.stringify({c:seen,t:Date.now()})); }catch(e){} }
  window.pagarLinkCode=function(){
    if(seen) return seen;
    try{ var s=JSON.parse(localStorage.getItem(KEY)||"null"); if(s&&s.c&&Date.now()-s.t<DAYS*864e5) return clean(s.c)||null; }catch(e){}
    return null;
  };
})();
