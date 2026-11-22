var S={subj:"All",mode:"practice",ans:{},mark:{},extra:[],perm:{}};
function load(){try{var d=JSON.parse(localStorage.getItem("mdsPyq")||"{}");S.ans=d.ans||{};S.mark=d.mark||{};S.extra=d.extra||[];S.perm=d.perm||{}}catch(e){}}
function save(){try{localStorage.setItem("mdsPyq",JSON.stringify({ans:S.ans,mark:S.mark,extra:S.extra,perm:S.perm}))}catch(e){}}
function shuffled(n){var a=[],i,j,k,t;for(i=0;i<n;i++)a.push(i);for(j=n-1;j>0;j--){k=Math.floor(Math.random()*(j+1));t=a[j];a[j]=a[k];a[k]=t}return a}
function optsOf(q){var p=S.perm[q.id];if(!p||p.length!==q.opts.length)p=q.opts.map(function(_,i){return i});return{o:p.map(function(i){return q.opts[i]}),a:p.indexOf(q.ans)}}
function byId(id){return all().filter(function(q){return q.id===id})[0]}
function googleUrl(q){return"https://www.google.com/search?q="+encodeURIComponent(q.q+" NEET MDS")}
function issueUrl(q,guess){
  var v=optsOf(q),letters="ABCDEFGH";
  var body="**Subject:** "+q.subject+"\n**Year:** "+q.year+"\n**Question ID:** "+q.id+"\n\n**Question:** "+q.q+"\n\n**Options as shown:**\n"+
    v.o.map(function(x,i){return"- "+letters.charAt(i)+") "+x+(i===v.a?"  (marked correct in the app)":"")}).join("\n")+
    "\n\n**Correct answer (please fill this in):**\n"+(guess.trim()||"_not given_")+
    "\n\n**Why / source:**\n";
  return"https://github.com/lms-guides/NEET_MDS_PYQs/issues/new?title="+encodeURIComponent("Wrong answer: "+q.q.slice(0,80).trim())+"&body="+encodeURIComponent(body);
}
function all(){return SAMPLE.concat(S.extra)}
function $(i){return document.getElementById(i)}
function esc(t){var d=document.createElement("div");d.textContent=t==null?"":String(t);return d.innerHTML}
function subjectsList(){var s=SUBJECTS.slice();all().forEach(function(q){if(s.indexOf(q.subject)<0)s.push(q.subject)});return s}
function subjStat(list){
  var a=0,c=0;list.forEach(function(q){var p=S.ans[q.id];if(p!=null){a++;if(p===optsOf(q).a)c++}});
  return a+"/"+list.length+" · "+(a?Math.round(c*100/a)+"%":"–");
}
function renderNav(){
  var qs=all(),h='<button aria-current="'+(S.subj==="All")+'" data-s="All" title="attempted / total · accuracy">All subjects <small>'+subjStat(qs)+'</small></button>';
  subjectsList().forEach(function(s){var sub=qs.filter(function(q){return q.subject===s});
    h+='<button aria-current="'+(S.subj===s)+'" data-s="'+esc(s)+'" title="attempted / total · accuracy">'+esc(s)+' <small>'+subjStat(sub)+'</small></button>'});
  $("subjects").innerHTML=h;$("subjList").innerHTML=h;
  $("subjBtnLabel").textContent=S.subj==="All"?"All subjects":S.subj;
}
function renderYears(){
  var y=[];all().forEach(function(q){if(y.indexOf(String(q.year))<0)y.push(String(q.year))});
  y.sort().reverse();var cur=$("year").value||"All";
  $("year").innerHTML='<option>All</option>'+y.map(function(v){return'<option'+(v===cur?" selected":"")+'>'+esc(v)+'</option>'}).join("");
}
function renderResetSubj(){
  var cur=$("resSubj").value;
  var list=subjectsList().filter(function(s){return all().some(function(q){return q.subject===s})});
  if(cur&&list.indexOf(cur)<0)cur="";
  $("resSubj").innerHTML=list.map(function(s){return'<option'+(s===cur?" selected":"")+'>'+esc(s)+'</option>'}).join("");
}
function renderStats(){
  var qs=all(),a=0,c=0;qs.forEach(function(q){if(S.ans[q.id]!=null){a++;if(S.ans[q.id]===optsOf(q).a)c++}});
  $("stats").innerHTML='<div><b>'+a+'/'+qs.length+'</b>attempted</div><div><b>'+(a?Math.round(c*100/a)+'%':'–')+'</b>accuracy</div>';
}
function card(q){
    var picked=S.ans[q.id],show=picked!=null,v=optsOf(q);
    var o=v.o.map(function(x,i){
      var cls="opt";if(show){if(i===v.a)cls+=" ok";else if(i===picked)cls+=" bad"}
      return'<button class="'+cls+'" data-q="'+esc(q.id)+'" data-i="'+i+'"'+(show?" disabled":"")+'><i>'+"ABCDEFGH".charAt(i)+'</i><span>'+esc(x)+'</span></button>'}).join("");
    var w=show&&q.warn?'<div class="exp" style="border-color:var(--bad);background:var(--badbg)"><b>Check the key</b>'+esc(q.warn.replace(/^Check the key: /,''))+'</div>':'';var e=show?'<div class="exp"><b>Correct answer: '+"ABCDEFGH".charAt(v.a)+'. '+esc(v.o[v.a])+'</b>'+esc(q.exp||"The source gives no explanation for this question.")+'</div>'+w:"";
    return'<article class="q" data-id="'+esc(q.id)+'"><div class="meta"><span>'+esc(q.subject)+' · '+esc(q.year)+'</span><span class="acts"><a class="flag" href="'+googleUrl(q)+'" target="_blank" rel="noopener">Refer online</a><button class="flag" data-r="'+esc(q.id)+'">Report</button><button class="flag" data-m="'+esc(q.id)+'" aria-pressed="'+(!!S.mark[q.id])+'">'+(S.mark[q.id]?"Bookmarked":"Bookmark")+'</button></span></div><p class="qt">'+esc(q.q)+'</p>'+o+e+'</article>';
}
function refreshCard(id){
  var el=$("list").querySelector('article[data-id="'+id+'"]'),q=byId(id);
  if(el&&q)el.outerHTML=card(q);
}
function afterChange(id){
  if(S.mode==="review"||$("fNew").checked||$("fMark").checked)renderList();else refreshCard(id);
  renderStats();renderNav();
}
function renderList(){
  var t=$("search").value.toLowerCase(),y=$("year").value||"All",m=$("fMark").checked,n=$("fNew").checked;
  var qs=all().filter(function(q){
    return (S.subj==="All"||q.subject===S.subj)&&(y==="All"||String(q.year)===y)&&(!t||q.q.toLowerCase().indexOf(t)>=0||q.opts.some(function(o){return String(o).toLowerCase().indexOf(t)>=0}))&&(!m||S.mark[q.id])&&(!n||S.ans[q.id]==null)&&(S.mode!=="review"||S.ans[q.id]!=null)});
  if(!qs.length){$("list").innerHTML='<div class="empty">'+(S.mode==="review"?"No attempted questions match these filters. Answer some questions in Practice mode, then come back to review them.":"No questions match these filters. Clear a filter or import more questions below.")+'</div>';return}
  $("list").innerHTML=qs.map(card).join("");
}
function render(){renderNav();renderYears();renderResetSubj();renderStats();renderList()}
document.addEventListener("click",function(ev){
  var b=ev.target.closest("button");if(!b)return;
  if(b.dataset.s){S.subj=b.dataset.s;render();if($("subjDrawer").classList.contains("on"))setSubjMenu(false)}
  else if(b.dataset.q){S.ans[b.dataset.q]=+b.dataset.i;save();afterChange(b.dataset.q)}
  else if(b.dataset.m){S.mark[b.dataset.m]=!S.mark[b.dataset.m];save();afterChange(b.dataset.m)}
  else if(b.dataset.r){
    var q=byId(b.dataset.r);if(!q)return;
    var guess=prompt("Report this question\n\n"+q.q+"\n\nWhat do you think the correct answer is? (optional)","");
    if(guess===null)return;
    window.open(issueUrl(q,guess),"_blank","noopener");
  }
});
function setMode(m){S.mode=m;$("mPractice").setAttribute("aria-pressed",m==="practice");$("mReview").setAttribute("aria-pressed",m==="review");renderList()}
$("mPractice").onclick=function(){setMode("practice")};$("mReview").onclick=function(){setMode("review")};
["search","year","fMark","fNew"].forEach(function(i){$(i).addEventListener("input",renderList)});
$("bImp").onclick=function(){
  try{
    var a=JSON.parse($("imp").value);if(!Array.isArray(a))throw 0;var n=0;
    a.forEach(function(q){
      if(q&&q.subject&&q.q&&Array.isArray(q.opts)&&q.opts.length>1&&Number.isInteger(q.ans)&&q.ans>=0&&q.ans<q.opts.length){
        q.id="u"+Date.now().toString(36)+(n++);q.year=q.year||"Unknown";S.extra.push(q)}});
    save();render();$("imp").value="";$("msg").textContent=n+" question(s) imported."+(n<a.length?" "+(a.length-n)+" skipped because a field was missing or ans was out of range.":"");
  }catch(e){$("msg").textContent="That is not a valid JSON list. Check the format shown above."}
};
$("bExp").onclick=function(){
  $("exp").value=JSON.stringify(S.extra,null,1);
  $("gExp").open=true;$("exp").focus();$("exp").select();
  $("msg").textContent=S.extra.length?"Your imported questions are in the box above. Copy them to keep a backup.":"You have no imported questions to export.";
};
$("bRes").onclick=function(){if(confirm("Clear all attempts and bookmarks?")){S.ans={};S.mark={};save();render()}};
$("bResSubj").onclick=function(){
  var s=$("resSubj").value;if(!s)return;
  if(!confirm("Clear your attempts and bookmarks for "+s+" and shuffle its options?"))return;
  var n=0;all().forEach(function(q){if(q.subject!==s)return;delete S.ans[q.id];delete S.mark[q.id];S.perm[q.id]=shuffled(q.opts.length);n++});
  save();render();$("msg").textContent=n+" question(s) in "+s+" reset; their options are in a new random order.";
};
function lockScroll(){document.body.classList.toggle("no-scroll",$("drawer").classList.contains("on")||$("subjDrawer").classList.contains("on"))}
function panel(drawerId,scrimId,btnId,closeId,open){
  var d=$(drawerId),sc=$(scrimId),b=$(btnId);
  d.classList.toggle("on",open);sc.classList.toggle("on",open);
  d.setAttribute("aria-hidden",open?"false":"true");b.setAttribute("aria-expanded",open?"true":"false");d.inert=!open;
  lockScroll();
  if(open)$(closeId).focus();else b.focus();
}
function setMenu(open){panel("drawer","scrim","bMenu","bClose",open)}
function setSubjMenu(open){panel("subjDrawer","scrimS","bSubj","bCloseS",open)}
$("bMenu").onclick=function(){setMenu(true)};
$("bClose").onclick=function(){setMenu(false)};
$("scrim").onclick=function(){setMenu(false)};
$("bSubj").onclick=function(){setSubjMenu(true)};
$("bCloseS").onclick=function(){setSubjMenu(false)};
$("scrimS").onclick=function(){setSubjMenu(false)};
document.addEventListener("keydown",function(e){
  if(e.key!=="Escape")return;
  if($("drawer").classList.contains("on"))setMenu(false);
  else if($("subjDrawer").classList.contains("on"))setSubjMenu(false);
});
load();render();