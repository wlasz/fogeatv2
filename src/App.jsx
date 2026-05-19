import { useState, useEffect, useRef, useCallback } from "react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { ACHIEVEMENT_CHAINS, buildAchievementState } from './domain/achievements.js';
import { CATEGORIES, DEFAULT_VENUES, filterVenues, getVenueColor, sortVenues } from './domain/catalog.js';
import { LIMITS, LIMIT_ERROR_CODES } from './domain/limits.js';
import { INITIAL_USER } from './domain/user.js';
import { VENUE_TAG_GROUPS, getSuggestedVenueTags, hasVenueTag, mergeVenueTags, parseVenueTags, toggleVenueTag } from './domain/venueTags.js';
import { adminService } from './services/adminService.js';
import { appDataService } from './services/appDataService.js';
import { authService } from './services/authService.js';
import { checkinService } from './services/checkinService.js';
import { favoriteService } from './services/favoriteService.js';
import { menuPhotoService } from './services/menuPhotoService.js';
import { profileService } from './services/profileService.js';
import { venueCatalogService } from './services/venueCatalogService.js';
import { venueDataService } from './services/venueDataService.js';
import { venueSubmissionService } from './services/venueSubmissionService.js';
import { wishlistService } from './services/wishlistService.js';

const getInstagramUrl = (handle) => `https://www.instagram.com/${handle}`;
const BASE_VENUE_CATEGORIES = CATEGORIES.filter((category) => category.k !== "all");

export default function App(){
  return <ErrorBoundary><AuthWrapper/></ErrorBoundary>;
}

function AuthWrapper(){
  const[session,setSession]=useState(undefined); // undefined = loading

  useEffect(()=>{
    authService.getSession().then(setSession);
    return authService.onSessionChange(setSession);
  },[]);

  if(session===undefined)return(
    <div style={{background:"#090c08",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontFamily:"'Dela Gothic One',sans-serif",fontSize:32,color:"#7fd458",letterSpacing:3}}>FOG<span style={{color:"#e8a838"}}>EAT</span></div>
    </div>
  );

  if(!session)return<AuthScreen/>;
  return<FogEat session={session}/>;
}

function AuthScreen(){
  const[mode,setMode]=useState("login"); // login | register
  const[email,setEmail]=useState("");
  const[password,setPassword]=useState("");
  const[username,setUsername]=useState("");
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState("");
  const[success,setSuccess]=useState("");

  const handle=async()=>{
    setError("");setSuccess("");setLoading(true);
    if(mode==="login"){
      const{error}=await authService.signIn(email,password);
      if(error)setError(error.message);
    } else {
      if(!username.trim()){setError("Введи username");setLoading(false);return;}
      const{data,error}=await authService.signUp(email,password);
      if(error){setError(error.message);}
      else if(data.user){
        await profileService.createProfile(data.user.id,username.trim().toLowerCase());
        setSuccess("Проверь email — отправили письмо для подтверждения");
      }
    }
    setLoading(false);
  };

  return(
    <div style={{background:"#090c08",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Nunito',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Nunito:wght@400;700;800&display=swap');`}</style>
      <div style={{marginBottom:32,textAlign:"center"}}>
        <div style={{fontFamily:"'Dela Gothic One',sans-serif",fontSize:36,color:"#7fd458",letterSpacing:3}}>FOG<span style={{color:"#e8a838"}}>EAT</span></div>
        <div style={{fontSize:12,color:"#5a5648",marginTop:4}}>Владикавказ · Твой дневник мест</div>
      </div>

      <div style={{width:"100%",maxWidth:360,background:"#0f1410",borderRadius:16,border:"1px solid #222820",padding:24}}>
        <div style={{display:"flex",gap:0,marginBottom:20,background:"#1a201a",borderRadius:10,padding:3}}>
          {["login","register"].map(m=>(
            <button key={m} onClick={()=>{setMode(m);setError("");setSuccess("");}}
              style={{flex:1,padding:"8px",borderRadius:8,border:"none",background:mode===m?"#3d6b25":"transparent",color:mode===m?"#fff":"#5a5648",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer"}}>
              {m==="login"?"Войти":"Регистрация"}
            </button>
          ))}
        </div>

        {mode==="register"&&(
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:800,color:"#9a9480",marginBottom:4}}>Username</div>
            <input value={username} onChange={e=>setUsername(e.target.value)}
              placeholder="например: wlasz"
              style={{width:"100%",padding:"10px 12px",background:"#1a201a",border:"1px solid #222820",borderRadius:10,color:"#ddd8cc",fontFamily:"'Nunito'",fontSize:13,outline:"none"}}/>
          </div>
        )}

        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:800,color:"#9a9480",marginBottom:4}}>Email</div>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email"
            placeholder="your@email.com"
            style={{width:"100%",padding:"10px 12px",background:"#1a201a",border:"1px solid #222820",borderRadius:10,color:"#ddd8cc",fontFamily:"'Nunito'",fontSize:13,outline:"none"}}/>
        </div>

        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,fontWeight:800,color:"#9a9480",marginBottom:4}}>Пароль</div>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password"
            placeholder="минимум 6 символов"
            style={{width:"100%",padding:"10px 12px",background:"#1a201a",border:"1px solid #222820",borderRadius:10,color:"#ddd8cc",fontFamily:"'Nunito'",fontSize:13,outline:"none"}}/>
        </div>

        {error&&<div style={{color:"#c05050",fontSize:11,marginBottom:12,textAlign:"center"}}>{error}</div>}
        {success&&<div style={{color:"#7fd458",fontSize:11,marginBottom:12,textAlign:"center"}}>{success}</div>}

        <button onClick={handle} disabled={loading||!email||!password}
          style={{width:"100%",padding:12,borderRadius:10,border:"none",background:"linear-gradient(90deg,#e8a838,#ffc857)",color:"#090c08",fontFamily:"'Nunito'",fontWeight:800,fontSize:14,cursor:"pointer",opacity:loading||!email||!password?0.5:1}}>
          {loading?"...":(mode==="login"?"Войти":"Создать аккаунт")}
        </button>
      </div>
    </div>
  );
}

function FogEat({session}){
  const currentUser=session?.user;
  const uid=currentUser?.id||'anonymous';
  const[isAdmin,setIsAdmin]=useState(false);
  const mapRef=useRef(null),mapInst=useRef(null),markersRef=useRef([]);
  const[mapReady,setMapReady]=useState(0);
  const[fontsReady,setFontsReady]=useState(true);
  const[isMobile,setIsMobile]=useState(()=>{try{return window.innerWidth<768;}catch(e){return true;}});
  const[sheetOpen,setSheetOpen]=useState(true);
  const[sheetHeight,setSheetHeight]=useState(55);
  const[confirmDeleteCheckin,setConfirmDeleteCheckin]=useState(null);
  const sheetDragRef=useRef(null);
  const sheetElRef=useRef(null);
  useEffect(()=>{
    const fn=()=>setIsMobile(window.innerWidth<768);
    window.addEventListener("resize",fn);
    return()=>window.removeEventListener("resize",fn);
  },[]);
  const[tab,setTab]=useState("map");
  const[mm,setMm]=useState("city");
  const[cf,setCf]=useState("all");
  const[sv,setSv]=useState(null);
  const[sc,setSc]=useState(false);
  const[cs,setCs]=useState(1);
  const[cr,setCr]=useState(0);
  const[checkinPhoto,setCheckinPhoto]=useState(null);
  const[sr,setSr]=useState(false);
  const[srType,setSrType]=useState("checkin");
  const[wt,setWt]=useState("venues");
  const[sideOpen,setSideOpen]=useState(true);
  const[search,setSearch]=useState("");
  const[checkins,setCheckins]=useState([]);
  const[wishVenues,setWishVenues]=useState([]);
  const[wishDishes,setWishDishes]=useState([]);
  const[user,setUser]=useState(INITIAL_USER);

  const[dishNote,setDishNote]=useState("");
  const[dishName,setDishName]=useState("");
  const[reviewText,setReviewText]=useState("");
  const[price,setPrice]=useState("");
  const[selectedVenueForCheckin,setSelectedVenueForCheckin]=useState(null);
  const[menuPhotos,setMenuPhotos]=useState({});
  const[showMenuModal,setShowMenuModal]=useState(false);
  const[menuUploading,setMenuUploading]=useState(false);
  const[photoViewer,setPhotoViewer]=useState(null);
  const[viewProfile,setViewProfile]=useState(null); // {userId, username}
  const[checkinPhotos,setCheckinPhotos]=useState({});
  const[venueNotes,setVenueNotes]=useState({});
  const[customLabels,setCustomLabels]=useState([]);   // [{id,name,emoji,color}]
  const[venueLabels,setVenueLabels]=useState({});     // {venueId: [labelId,...]}
  const[showLabelManager,setShowLabelManager]=useState(false);
  const[newLabelName,setNewLabelName]=useState("");
  const[newLabelEmoji,setNewLabelEmoji]=useState("⭐");
  const[newLabelColor,setNewLabelColor]=useState("#e8a838");
  const[showVisitModal,setShowVisitModal]=useState(false);
  const[visitNote,setVisitNote]=useState("");
  const[visitRating,setVisitRating]=useState(0);
  const[adminEditVenue,setAdminEditVenue]=useState(null);
  const[adminVenueSaving,setAdminVenueSaving]=useState(false);
  const[showAddVenue,setShowAddVenue]=useState(false);
  const[catalogVenues,setCatalogVenues]=useState(DEFAULT_VENUES);
  const[customVenues,setCustomVenues]=useState([]);
  const[venueRatings,setVenueRatings]=useState({}); // {venueId: {avg, count}}
  const[sortBy,setSortBy]=useState("rating_desc"); // default | rating_desc | rating_asc
  const[newV,setNewV]=useState({n:"",a:"",c:"Ресторан",s:"",r:"",ig:"",lat:"",lng:""});
  const[venueSubmitting,setVenueSubmitting]=useState(false);
  const[placingMarker,setPlacingMarker]=useState(false);
  const placingMarkerRef=useRef(false);
  const tempMarkerRef=useRef(null);

  useEffect(()=>{
    const load=async()=>{
      const data=await appDataService.loadUserAppData(uid);

      if(data.profile?.role==='admin')setIsAdmin(true);
      if(data.profile?.username)setUser(u=>({...u,name:data.profile.username}));
      setCheckins(data.checkins);
      setWishVenues(data.wishVenues);
      setWishDishes(data.wishDishes);
      setVenueNotes(data.venueNotes);
      setCustomLabels(data.customLabels);
      setVenueLabels(data.venueLabels);
      setCatalogVenues(data.catalogVenues);
      setCustomVenues(data.customVenues);
      setVenueRatings(data.venueRatings);
      setMenuPhotos(prev=>({...prev,...data.menuPhotos}));
    };
    load();

    const onVisible=()=>{if(document.visibilityState==="visible")load();};
    document.addEventListener("visibilitychange",onVisible);
    return()=>document.removeEventListener("visibilitychange",onVisible);
  },[uid]);

  const placeTempMarker=(lat,lng)=>{
    if(!mapInst.current)return;
    if(tempMarkerRef.current)tempMarkerRef.current.remove();
    const html=`<div style="width:28px;height:28px;border-radius:50%;background:#e8a838;border:3px solid #fff;box-shadow:0 0 0 2px #e8a838,0 4px 12px rgba(0,0,0,.5);cursor:move;display:flex;align-items:center;justify-content:center;font-size:14px">📍</div>`;
    const icon=L.divIcon({html,className:"",iconSize:[28,28],iconAnchor:[14,14]});
    const m=L.marker([lat,lng],{icon,draggable:true}).addTo(mapInst.current);
    m.on("dragend",e=>{
      const p=e.target.getLatLng();
      setNewV(v=>({...v,lat:p.lat.toFixed(5),lng:p.lng.toFixed(5)}));
    });
    tempMarkerRef.current=m;
    setNewV(v=>({...v,lat:lat.toFixed(5),lng:lng.toFixed(5)}));
    mapInst.current.flyTo([lat,lng],17,{duration:.6});
  };



  const saveMenuPhotos=async()=>{}; // persisted by menuPhotoService

  const saveVenueNotes=async(data)=>venueDataService.saveVenueNotes(uid,data);

  const saveCustomLabels=async(data)=>venueDataService.saveCustomLabels(uid,data);

  const saveVenueLabels=async(data)=>venueDataService.saveVenueLabels(uid,data);

  const saveCheckins=async()=>{}; // persisted by checkinService

  const saveWishVenues=async(data)=>wishlistService.saveWishVenues(uid,data);

  const saveWishDishes=async(data)=>wishlistService.saveWishDishes(uid,data);

  const saveUser=async()=>{}; // XP/level are still in memory

  const saveCustomVenues=async(data)=>venueDataService.saveCustomVenues(uid,data);

  const openAdminVenueEditor=(venue)=>{
    if(!isAdmin||venue.custom)return;
    setAdminEditVenue({
      id:venue.id,
      n:venue.n||"",
      a:venue.a||"",
      c:venue.c||"Ресторан",
      s:venue.s||"",
      i:venue.i||"📍",
      r:String(venue.r||0),
      ig:venue.ig||"",
      lat:venue.lat,
      lng:venue.lng,
    });
  };

  const saveAdminVenue=async()=>{
    if(!adminEditVenue?.n?.trim()){alert("Введи название заведения");return;}
    if(!adminEditVenue?.c?.trim()){alert("Выбери категорию");return;}
    setAdminVenueSaving(true);
    try{
      const updated=await venueCatalogService.updateCatalogVenue(adminEditVenue.id,adminEditVenue);
      setCatalogVenues(venues=>venues.map(venue=>String(venue.id)===String(updated.id)?updated:venue));
      setSv(current=>String(current?.id)===String(updated.id)?{...current,...updated,_confirmDelete:false}:current);
      setAdminEditVenue(null);
      alert("Заведение обновлено");
    }catch(e){
      console.error(e);
      alert(`Не удалось сохранить заведение: ${e?.message || "неизвестная ошибка"}`);
    }finally{
      setAdminVenueSaving(false);
    }
  };

  useEffect(()=>{
    if(!sv)return;
    const load=async()=>{
      const photos=await checkinService.getPhotoMapForVenue(checkins,sv.id);
      setCheckinPhotos(p=>({...p,...photos}));
    };
    load();
  },[sv,checkins]);

  useEffect(()=>{
    const t=setTimeout(()=>setFontsReady(true),1500);
    try{document.fonts.ready.then(()=>{clearTimeout(t);setTimeout(()=>setFontsReady(true),200);});}catch(e){}
    return()=>clearTimeout(t);
  },[]);

  useEffect(()=>{
    if(!mapRef.current)return;

    if(mapInst.current){
      mapInst.current.remove();
      mapInst.current=null;
      markersRef.current=[];
    }

    const m=L.map(mapRef.current,{zoomControl:false,attributionControl:false}).setView([43.033,44.678],14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
      maxZoom:19,
      updateWhenIdle:true,
      keepBuffer:3,
      crossOrigin:true,
    }).addTo(m);
    L.control.zoom({position:"topright"}).addTo(m);
    mapInst.current=m;
    setMapReady(v=>v+1);
    setTimeout(()=>m.invalidateSize(),100);
    setTimeout(()=>m.invalidateSize(),500);
    setTimeout(()=>m.invalidateSize(),1000);
    m.on("click",e=>{
      if(!placingMarkerRef.current)return;
      placeTempMarker(e.latlng.lat,e.latlng.lng);
      placingMarkerRef.current=false;
      setPlacingMarker(false);
      setShowAddVenue(true);
    });
    return()=>{
      m.remove();
      if(mapInst.current===m)mapInst.current=null;
      markersRef.current=[];
    };
  },[isMobile]);

  useEffect(()=>{if(mapInst.current)setTimeout(()=>mapInst.current.invalidateSize(),310)},[sideOpen,sheetOpen,sheetHeight,sv,fontsReady]);

  const visitedIds=new Set(checkins.map(c=>String(c.venueId)));
  const deletedIds=new Set(customVenues.filter(v=>v.deleted).map(v=>String(v.id)));
  const customVenueCount=customVenues.filter(v=>!v.deleted).length;
  const allVenues=[...catalogVenues.filter(v=>!deletedIds.has(String(v.id))),...customVenues.filter(v=>!v.deleted)];
  const activeCategory=mm==="city"&&cf.startsWith("lbl_")?"all":cf;

  const filteredVenues=filterVenues({venues:allVenues,search,category:activeCategory,venueLabels:mm==="my"?venueLabels:{}});
  const fl=sortVenues(filteredVenues,sortBy,venueRatings);
  const mapVenues=filteredVenues;

  useEffect(()=>{
    if(mm==="city"&&cf.startsWith("lbl_"))setCf("all");
  },[mm,cf]);

  const getPersonalVenueTags=(venueId)=>(
    (venueLabels[String(venueId)]||[])
      .map(labelId=>customLabels.find(label=>label.id===labelId))
      .filter(Boolean)
  );

  const getVenueDisplayTags=(venue)=>(
    mm==="my"
      ? getPersonalVenueTags(venue.id).map(label=>({id:`personal_${label.id}`,label:`${label.emoji} ${label.name}`,color:label.color}))
      : parseVenueTags(venue.s).map(tag=>({id:`city_${tag}`,label:tag}))
  );

  const getVenueSubtitle=(venue)=>{
    const tagText=getVenueDisplayTags(venue).map(tag=>tag.label).join(" · ");
    return tagText?`${venue.a} · ${tagText}`:venue.a;
  };

  const getVenueTagStyle=(tag)=>tag.color?{borderColor:tag.color,background:`${tag.color}22`,color:tag.color}:undefined;

  const toggleVenuePersonalLabel=(venueId,labelId)=>{
    const key=String(venueId);
    const cur=venueLabels[key]||[];
    const has=cur.includes(labelId);
    const next=has?cur.filter(id=>id!==labelId):[...cur,labelId];
    const updated={...venueLabels};
    if(next.length)updated[key]=next;
    else delete updated[key];
    setVenueLabels(updated);
    saveVenueLabels(updated);
  };

  const um=useCallback(()=>{
    if(!mapInst.current)return;
    markersRef.current.forEach(m=>m.remove());markersRef.current=[];

    // зелёный(5) → жёлтый(2.5) → красный(0.5) по рейтингу
    const ratingColor=(r)=>{
      if(!r||r===0)return{border:"#444",bg:"#1a1a1a"};
      const t=Math.max(0,Math.min(1,(r-0.5)/4.5));
      // green #3d8a1a → yellow #c8a000 → red #a01010
      let border;
      if(t>=0.5){
        const s=(t-0.5)*2;
        const ri=Math.round(0x3d+(0xc8-0x3d)*(1-s));
        const gi=Math.round(0x8a+(0xa0-0x8a)*(1-s));
        const bi=Math.round(0x1a+(0x00-0x1a)*(1-s));
        border=`rgb(${ri},${gi},${bi})`;
      } else {
        const s=t*2;
        const ri=Math.round(0xa0+(0xc8-0xa0)*s);
        const gi=Math.round(0x10+(0xa0-0x10)*s);
        const bi=Math.round(0x10+(0x00-0x10)*s);
        border=`rgb(${ri},${gi},${bi})`;
      }
      const bg=`rgba(${parseInt(border.slice(4),10)||0},${0},${0},0.15)`;
      return{border, bg:`#141414`};
    };

    mapVenues.forEach(v=>{
      const isVisited=visitedIds.has(String(v.id));
      const showQuestion=mm==="my"&&!isVisited;
      const icon_char=showQuestion?"?":v.i;

      const isWishlisted=wishVenues.some(w=>w.id===v.id);

      let bg, border;
      if(mm==="my"&&!isVisited){
        bg=isWishlisted?"#0e1f0e":"#1a1a1a";
        border=isWishlisted?"#3a6a3a":"#383838";
      } else {
        const rc=ratingColor(v.r);
        bg=rc.bg; border=rc.border;
      }

      const font=showQuestion?"14px":"16px";
      const color=showQuestion?(isWishlisted?"#fff":"#555"):"#fff";
      const fontW=showQuestion?"700":"normal";
      const shadow=showQuestion&&isWishlisted
        ? `0 0 10px rgba(90,200,80,.8), 0 2px 8px ${border}66`
        : `0 2px 8px ${border}66`;
      const html=`<div class="map-marker" style="width:34px;height:34px;border-radius:50%;background:${bg};border:2.5px solid ${border};display:flex;align-items:center;justify-content:center;font-size:${font};font-weight:${fontW};color:${color};box-shadow:${shadow};cursor:pointer;transition:box-shadow .2s,transform .2s">${icon_char}</div>`;
      const icon=L.divIcon({html,className:"",iconSize:[34,34],iconAnchor:[17,17]});
      const marker=L.marker([v.lat,v.lng],{icon}).addTo(mapInst.current);
      marker.bindTooltip(
        `<div style="font-family:'Nunito',sans-serif;font-size:12px;font-weight:800;color:#e8e4da;background:#0f1410;border:1px solid #222820;border-radius:8px;padding:5px 10px;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,.5)">${v.i} ${v.n}${v.r>0&&mm==="city"?` <span style="color:#e8a838">★${v.r}</span>`:""}</div>`,
        {permanent:false,direction:"top",offset:[0,-18],opacity:1,className:"fogeat-tip"}
      );
      marker.on("click",()=>{setSv(v);mapInst.current.flyTo([v.lat,v.lng],16,{duration:.5})});
      markersRef.current.push(marker);
    });
  },[mapVenues,visitedIds,wishVenues,mm,venueRatings]);

  useEffect(()=>{um()},[um,mapReady]);

  const doCheckin=async()=>{
    const venue=selectedVenueForCheckin||sv;
    if(!venue)return;
    const now=new Date();
    const id=Date.now();
    let photoKey=null;
    let photoUrl=null;
    if(checkinPhoto){
      try{
        const uploaded=await checkinService.uploadCheckinPhoto({venueId:venue.id,checkinId:id,photoDataUrl:checkinPhoto});
        photoKey=uploaded.photoKey;
        photoUrl=uploaded.photoUrl;
      }catch(e){}
    }
    const newCheckin={
      id,venueId:venue.id,venueName:venue.n,
      dish:dishName||"Блюдо",rating:cr,review:reviewText,
      price:price,date:now.toLocaleDateString("ru-RU"),
      time:`${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`,
      photoKey,photoUrl,
    };
    try{
      await checkinService.createCheckin(currentUser.id,newCheckin);
    }catch(e){}
    const updated=[newCheckin,...checkins];
    setCheckins(updated);
    saveCheckins(updated);
    const newUser={...user,xp:user.xp+50,checkins:user.checkins+1};
    setUser(newUser);saveUser(newUser);
    setSc(false);setCs(1);setCr(0);setCheckinPhoto(null);setDishName("");setReviewText("");setPrice("");
    setSrType("checkin");setSr(true);setTimeout(()=>setSr(false),2500);
  };

  const doQuickVisit=async()=>{
    const venue=sv;
    if(!venue)return;
    const now=new Date();
    const id=Date.now();
    const newCheckin={
      id,venueId:venue.id,venueName:venue.n,
      dish:"",rating:visitRating,review:visitNote,price:"",
      date:now.toLocaleDateString("ru-RU"),
      time:`${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`,
      type:"visit",
    };
    try{
      await checkinService.createCheckin(currentUser.id,newCheckin);
    }catch(e){}
    const updated=[newCheckin,...checkins];
    setCheckins(updated);saveCheckins(updated);
    const newUser={...user,xp:user.xp+20,checkins:user.checkins+1};
    setUser(newUser);saveUser(newUser);
    setShowVisitModal(false);setVisitNote("");setVisitRating(0);
    setSrType("visit");setSr(true);setTimeout(()=>setSr(false),2500);
  };

  const addWishVenue=(v)=>{
    if(wishVenues.find(w=>w.id===v.id))return;
    const updated=[{id:v.id,n:v.n,c:v.i,no:""},...wishVenues];
    setWishVenues(updated);saveWishVenues(updated);
  };

  const removeWishVenue=(id)=>{
    const updated=wishVenues.filter(w=>w.id!==id);
    setWishVenues(updated);saveWishVenues(updated);
  };

  const hasWishDish=(venue,dish)=>wishDishes.some(w=>String(w.venueId)===String(venue.id)&&String(w.dishId)===String(dish.id));

  const toggleWishDish=(venue,dish)=>{
    if(hasWishDish(venue,dish)){
      const updated=wishDishes.filter(w=>!(String(w.venueId)===String(venue.id)&&String(w.dishId)===String(dish.id)));
      setWishDishes(updated);saveWishDishes(updated);
      return;
    }

    const updated=[{
      venueId:venue.id,
      dishId:dish.id,
      v:venue.n,
      d:dish.nm,
      e:dish.ph,
      tag:dish.tg,
    },...wishDishes];
    setWishDishes(updated);saveWishDishes(updated);
  };

  const removeWishDish=(dish)=>{
    const updated=wishDishes.filter(w=>!(String(w.venueId)===String(dish.venueId)&&String(w.dishId)===String(dish.dishId)));
    setWishDishes(updated);saveWishDishes(updated);
  };

  const deleteUserCheckin=async(checkin)=>{
    await checkinService.deleteCheckin(checkin.id,checkin.photoKey);
    const updated=checkins.filter(ch=>ch.id!==checkin.id);
    setCheckins(updated);
    setCheckinPhotos(p=>{const n={...p};delete n[checkin.id];return n;});
    setConfirmDeleteCheckin(null);
  };

  const removeMenuPhoto=async(venueId,index)=>{
    const photo=menuPhotos[venueId]?.[index];
    if(photo?.path)await menuPhotoService.removeMenuPhotoFile(photo.path);
    const updated={...menuPhotos,[venueId]:(menuPhotos[venueId]||[]).filter((_,j)=>j!==index)};
    setMenuPhotos(updated);saveMenuPhotos(updated);
  };

  const Stars=({v,onChange})=>(
    <div style={{display:"flex",justifyContent:"center",gap:6,margin:"8px 0"}}>
      {[1,2,3,4,5].map(i=>(
        <span key={i} onClick={()=>onChange&&onChange(i)}
          style={{fontSize:26,cursor:onChange?"pointer":"default",color:i<=v?"#e8a838":"#2a2a2a",transition:"all .15s",display:"inline-block",transform:i<=v?"scale(1.1)":"scale(1)"}}>★</span>
      ))}
    </div>
  );

  const swipeClose=(onClose)=>({
    onTouchStart:e=>{e.currentTarget._sx=e.touches[0].clientX;e.currentTarget._sy=e.touches[0].clientY;e.currentTarget._moved=false;},
    onTouchMove:e=>{const dx=e.touches[0].clientX-e.currentTarget._sx;const dy=Math.abs(e.touches[0].clientY-e.currentTarget._sy);if(dx>10&&dy<80)e.currentTarget._moved=true;},
    onTouchEnd:e=>{const dx=e.changedTouches[0].clientX-e.currentTarget._sx;if(e.currentTarget._moved&&dx>80)onClose();}
  });

  const myCheckins=checkins.filter(c=>c.venueId===sv?.id);
  const isWished=sv&&wishVenues.find(w=>w.id===sv.id);

  const computedAchs=buildAchievementState(ACHIEVEMENT_CHAINS,{
    visitedIds,
    checkins,
    allVenues,
    customVenues,
    wishVenues,
  });

  const TAB_ICONS={map:"📍",wishlist:"📌",checkins:"✅",top:"🏆",profile:"👤"};

  return(<>
    <style>{`
@keyframes splashFade{0%{opacity:1;pointer-events:all}80%{opacity:1}100%{opacity:0;pointer-events:none}}
@keyframes splashPulse{0%,100%{opacity:.7;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}
@keyframes spin{to{transform:rotate(360deg)}}
:root{
  --bg:#090c08;--bg2:#0f1410;--bg3:#1a201a;--card:#141a14;
  --gold:#e8a838;--gold2:#ffc857;--gold3:#fff0c0;
  --grn:#3d6b25;--grn2:#5a9c35;--grn3:#7fd458;
  --txt:#ddd8cc;--txt2:#9a9480;--txt3:#5a5648;
  --border:#222820;--rad:10px;
}
*{margin:0;padding:0;box-sizing:border-box}
html,body,#root{height:100%;overflow:hidden}
.app{display:flex;flex-direction:column;height:100vh;height:100dvh;background:var(--bg);font-family:'Nunito',sans-serif;color:var(--txt);overflow:hidden}

/* MOBILE */
.mob-map{position:fixed;top:0;left:0;right:0;bottom:0;z-index:0}
.mob-hdr{position:fixed;top:0;left:0;right:0;height:50px;background:var(--bg2);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 12px;gap:8px;z-index:500}
.mob-tabs{position:fixed;bottom:0;left:0;right:0;background:var(--bg2);border-top:1px solid var(--border);display:flex;z-index:600;padding-bottom:env(safe-area-inset-bottom,16px);height:calc(56px + env(safe-area-inset-bottom,16px))}
.mob-tab{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:9px;font-weight:800;color:var(--txt3);border:none;background:none;cursor:pointer;font-family:'Nunito';padding:6px 0}
.mob-tab.a{color:var(--gold)}
.mob-tab .ico{font-size:18px}
.mob-sheet{position:fixed;left:0;right:0;bottom:calc(56px + env(safe-area-inset-bottom,16px));background:var(--bg2);border-top:1px solid var(--border);border-radius:16px 16px 0 0;z-index:400;display:flex;flex-direction:column;overflow:hidden}
.mob-sheet-handle{width:100%;height:36px;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;position:relative}.mob-sheet-handle::after{content:"";display:block;width:36px;height:4px;background:var(--txt3);border-radius:2px;opacity:.6}.mob-sheet-tip{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:9px;color:var(--txt3);font-family:'Nunito';font-weight:700;opacity:.45;pointer-events:none}
.mob-vp{position:fixed;inset:0;bottom:56px;background:var(--bg2);z-index:600;overflow-y:auto;animation:slideUp .25s ease}
@keyframes slideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}

/* HEADER */
.hdr{display:flex;align-items:center;padding:0 14px;height:54px;background:var(--bg2);border-bottom:1px solid var(--border);gap:10px;z-index:20;flex-shrink:0}
.logo{font-family:'Dela Gothic One';font-size:20px;letter-spacing:2px;color:var(--grn3)}.logo span{color:var(--gold)}
.hmode{display:flex;background:var(--bg3);border-radius:8px;padding:2px;gap:2px;border:1px solid var(--border)}
.hmode button{padding:4px 12px;border:none;border-radius:6px;font-family:'Nunito';font-weight:800;font-size:11px;cursor:pointer;background:transparent;color:var(--txt3);transition:all .2s}
.hmode button.a{background:var(--grn);color:#fff}
.hprog{flex:1;display:flex;align-items:center;gap:7px;max-width:200px}
.hprog-txt{font-size:10px;color:var(--txt3);white-space:nowrap;font-weight:700}
.hprog-bar{flex:1;height:4px;background:var(--bg3);border-radius:4px;overflow:hidden}
.hprog-fill{height:100%;background:linear-gradient(90deg,var(--grn),var(--grn3));border-radius:4px;transition:width .5s}
.havatar{display:flex;align-items:center;gap:7px;margin-left:auto;cursor:pointer;padding:4px 8px;border-radius:8px;transition:background .2s}
.havatar:hover{background:var(--bg3)}
.hav-icon{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--grn),var(--grn3));display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:#fff;border:2px solid var(--gold);flex-shrink:0}
.hav-name{font-weight:800;font-size:12px}.hav-lvl{font-size:10px;color:var(--grn3)}

/* LAYOUT */
.main{display:flex;flex:1;overflow:hidden}
.side{width:340px;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;transition:width .3s ease;flex-shrink:0}
.side.cl{width:0;border-right:none}
.tog{position:absolute;left:0;top:80px;width:18px;height:44px;background:var(--bg2);border:1px solid var(--border);border-left:none;border-radius:0 7px 7px 0;cursor:pointer;color:var(--txt3);font-size:10px;z-index:1100;display:flex;align-items:center;justify-content:center}

/* TABS */
.tabs{display:flex;border-bottom:1px solid var(--border);flex-shrink:0}
.tab-btn{flex:1;padding:10px 2px 8px;text-align:center;font-size:16px;color:var(--txt3);border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;position:relative}
.tab-btn.a{color:var(--gold);border-color:var(--gold)}
.tab-btn .tab-lbl{display:block;font-size:8px;font-weight:700;font-family:'Nunito';margin-top:2px;color:inherit}

/* SCROLL AREA */
.sc{flex:1;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--grn) transparent}
.sc::-webkit-scrollbar{width:4px}
.sc::-webkit-scrollbar-track{background:transparent}
.sc::-webkit-scrollbar-thumb{background:var(--grn);border-radius:4px}
.sc::-webkit-scrollbar-thumb:hover{background:var(--grn2)}
.fogeat-tip{background:transparent!important;border:none!important;box-shadow:none!important;padding:0!important}
.fogeat-tip::before{display:none!important}
.map-marker:hover{box-shadow:0 0 0 6px rgba(90,200,80,.35),0 0 18px rgba(90,200,80,.5)!important;transform:scale(1.15)}

/* SEARCH */
.srch-wrap{padding:10px 10px 6px;position:relative}
.srch{width:100%;padding:8px 12px 8px 34px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--rad);color:var(--txt);font-family:'Nunito';font-size:12px;outline:none;transition:border-color .2s}
.srch:focus{border-color:var(--grn2)}
.srch-ico{position:absolute;left:20px;top:50%;transform:translateY(-50%);font-size:13px;pointer-events:none}

/* CHIPS */
.chips{display:flex;gap:4px;padding:4px 10px 8px;overflow-x:auto;flex-shrink:0;cursor:grab;user-select:none}
.chips::-webkit-scrollbar{display:none}
.chips{scrollbar-width:none;-ms-overflow-style:none}
.chips.dragging{cursor:grabbing}
.chip{padding:4px 9px;border-radius:20px;background:var(--bg3);font-size:10px;font-weight:700;cursor:pointer;color:var(--txt2);border:1px solid var(--border);transition:all .15s;white-space:nowrap}
.chip.a{background:var(--grn);color:#fff;border-color:var(--grn2)}

/* VENUE ITEM */
.vi{display:flex;align-items:center;gap:0;cursor:pointer;transition:background .15s;border-bottom:1px solid var(--border);overflow:hidden}
.vi:hover{background:var(--bg3)}
.vi-strip{width:3px;align-self:stretch;flex-shrink:0}
.vi-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;margin:10px 8px 10px 10px}
.vi-info{flex:1;min-width:0;padding:10px 0}
.vi-name{font-weight:800;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--txt)}
.vi-sub{font-size:10px;color:var(--txt3);margin-top:1px}
.vi-right{display:flex;flex-direction:column;align-items:flex-end;gap:3px;padding:10px 10px 10px 6px;flex-shrink:0}
.vi-rating{background:var(--bg3);border-radius:5px;padding:2px 6px;font-size:10px;font-weight:800;color:var(--gold);border:1px solid #333}
.vi-visited{width:7px;height:7px;border-radius:50%;background:var(--gold);flex-shrink:0}

/* MAP */
.ma{flex:1;position:relative}
#mapEl{width:100%;height:100%}
.fab{position:absolute;bottom:22px;right:22px;width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--grn),var(--grn3));border:none;color:#fff;font-size:30px;font-weight:900;cursor:pointer;z-index:1500;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(90,156,53,.5);transition:transform .2s,box-shadow .2s}
.fab:hover{transform:scale(1.08);box-shadow:0 6px 24px rgba(90,156,53,.7)}

/* VENUE PANEL */
.vp{position:absolute;right:0;top:0;bottom:0;width:360px;background:var(--bg2);z-index:1000;overflow-y:auto;border-left:1px solid var(--border);display:flex;flex-direction:column;animation:slideIn .25s ease}
@keyframes slideIn{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}
.vp-hero{padding:20px 16px 14px;position:relative;flex-shrink:0}
.vp-hero::before{content:"";position:absolute;inset:0;opacity:.07;pointer-events:none}
.vp-close{position:absolute;top:12px;right:12px;width:28px;height:28px;border-radius:50%;background:var(--bg3);border:1px solid var(--border);color:var(--txt2);font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
.vp-close:hover{background:var(--border);color:var(--txt)}
.vp-emoji{font-size:40px;margin-bottom:8px;display:block;line-height:1}
.vp-name{font-family:'Dela Gothic One';font-size:18px;line-height:1.2;margin-bottom:4px}
.vp-addr{font-size:11px;color:var(--txt3);margin-bottom:8px}
.vp-tags{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px}
.vp-tag{padding:3px 9px;border-radius:12px;font-size:10px;font-weight:700;background:var(--bg3);color:var(--txt2);border:1px solid var(--border)}
.vp-tag.gold{background:rgba(232,168,56,.15);color:var(--gold);border-color:rgba(232,168,56,.3)}
.vp-tag.grn{background:rgba(90,156,53,.15);color:var(--grn3);border-color:rgba(90,156,53,.3)}
.vp-actions{display:flex;gap:7px;padding:0 14px 12px;flex-shrink:0}
.btn-primary{flex:1;padding:9px;border-radius:var(--rad);background:var(--gold);color:var(--bg);font-family:'Nunito';font-weight:800;font-size:12px;cursor:pointer;border:none;transition:all .2s}
.btn-primary:hover{background:var(--gold2)}
.btn-outline{flex:1;padding:9px;border-radius:var(--rad);background:transparent;color:var(--gold);font-family:'Nunito';font-weight:800;font-size:12px;cursor:pointer;border:1.5px solid var(--gold);transition:all .2s}
.btn-outline:hover{background:rgba(232,168,56,.1)}
.btn-outline.active{background:rgba(232,168,56,.2);color:var(--gold2)}

/* SECTION */
.sec-hdr{font-weight:800;font-size:11px;padding:10px 14px 5px;color:var(--txt3);text-transform:uppercase;letter-spacing:.5px;display:flex;align-items:center;justify-content:space-between}

/* DISH ROW */
.dr{display:flex;align-items:center;gap:9px;padding:8px 14px;border-bottom:1px solid var(--border)}
.de{font-size:22px;width:32px;text-align:center;flex-shrink:0}
.di{flex:1;min-width:0}
.dn{font-weight:800;font-size:12px}.dt{font-size:9px;color:var(--txt3);margin-top:1px}.ds{font-size:10px;color:var(--txt2);margin-top:2px}
.wish-btn{padding:4px 8px;border-radius:6px;border:1.5px solid var(--gold);background:transparent;color:var(--gold);font-size:9px;font-weight:800;cursor:pointer;font-family:'Nunito';white-space:nowrap;transition:all .2s}
.wish-btn:hover,.wish-btn.on{background:var(--gold);color:var(--bg)}

/* MY CHECKINS in venue */
.ci{padding:10px 14px;border-bottom:1px solid var(--border)}
.ci-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:3px}
.ci-dish{font-weight:800;font-size:12px}.ci-date{font-size:9px;color:var(--txt3)}
.ci-review{font-size:10px;color:var(--txt2);margin-top:2px;font-style:italic}

/* FEED */
.fi{display:flex;gap:9px;padding:10px 12px;border-bottom:1px solid var(--border);align-items:flex-start}
.fa{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--grn),var(--grn3));display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;flex-shrink:0;color:#fff;border:1.5px solid rgba(127,212,88,.3)}
.fb{flex:1;min-width:0}
.fu{font-weight:800;font-size:11px}.ft{font-size:10px;color:var(--txt2);margin-top:2px}.fm{font-size:10px;color:var(--txt3);margin-top:1px;font-style:italic}
.fe{font-size:20px;align-self:center;flex-shrink:0}

/* WISHLIST */
.wl-tabs{display:flex;border-bottom:1px solid var(--border)}
.wl-tab{flex:1;padding:8px;text-align:center;font-weight:800;font-size:10px;color:var(--txt3);border:none;background:none;cursor:pointer;font-family:'Nunito';border-bottom:2px solid transparent;transition:all .2s}
.wl-tab.a{color:var(--gold);border-color:var(--gold)}
.wi{display:flex;align-items:center;gap:9px;padding:9px 12px;border-bottom:1px solid var(--border)}
.wic{width:32px;height:32px;border-radius:8px;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:17px;border:1px solid var(--border)}
.wif{flex:1;min-width:0}.win{font-weight:800;font-size:12px}.wint{font-size:9px;color:var(--txt3);margin-top:1px}
.wr{width:22px;height:22px;border-radius:50%;border:1px solid var(--border);background:none;color:var(--txt3);font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
.wr:hover{background:rgba(255,80,80,.15);color:#ff5050;border-color:#ff5050}

/* MY CHECKINS TAB */
.ck{padding:10px 12px;border-bottom:1px solid var(--border)}
.ck-venue{font-weight:800;font-size:12px}.ck-meta{display:flex;gap:6px;margin-top:3px;align-items:center}
.ck-dish{font-size:11px;color:var(--txt2)}.ck-date{font-size:9px;color:var(--txt3)}
.ck-review{font-size:10px;color:var(--txt3);margin-top:3px;font-style:italic}

/* EMPTY STATE */
.empty{text-align:center;padding:40px 20px;color:var(--txt3)}
.empty-ico{font-size:36px;margin-bottom:10px}.empty-txt{font-size:12px;font-weight:700}

/* PROFILE */
.prof-hero{padding:20px 16px;text-align:center;border-bottom:1px solid var(--border);background:linear-gradient(180deg,var(--bg3),var(--bg2))}
.prof-av{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,var(--grn),var(--grn3));margin:0 auto 8px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#fff;border:2.5px solid var(--gold)}
.prof-name{font-family:'Dela Gothic One';font-size:18px}.prof-title{display:inline-block;margin-top:5px;padding:3px 12px;background:linear-gradient(90deg,var(--grn),var(--grn2));border-radius:12px;font-size:10px;font-weight:800;color:#fff}
.prof-xp-bar{margin:12px 16px 0;height:6px;background:var(--bg3);border-radius:4px;overflow:hidden}
.prof-xp-fill{height:100%;background:linear-gradient(90deg,var(--gold),var(--gold2));border-radius:4px;transition:width .5s}
.prof-xp-lbl{text-align:center;font-size:9px;color:var(--txt3);margin-top:3px}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:12px}
.stat-card{text-align:center;padding:8px 4px;background:var(--card);border-radius:var(--rad);border:1px solid var(--border)}
.stat-n{font-family:'Dela Gothic One';font-size:16px;color:var(--grn3)}.stat-l{font-size:8px;color:var(--txt3);margin-top:2px;font-weight:700}

/* ACHIEVEMENTS */
.ach{display:flex;align-items:center;gap:9px;padding:9px 12px;border-bottom:1px solid var(--border)}
.ach-icon{width:34px;height:34px;border-radius:9px;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;border:1px solid var(--border)}
.ach-icon.done{background:linear-gradient(135deg,var(--grn),var(--grn3));border-color:var(--grn2)}
.ach-info{flex:1;min-width:0}.ach-name{font-weight:800;font-size:11px}.ach-desc{font-size:9px;color:var(--txt3);margin-top:1px}
.ach-bar{height:3px;background:var(--bg3);border-radius:2px;margin-top:4px;overflow:hidden}
.ach-bar-fill{height:100%;background:var(--grn2);border-radius:2px}
.ach-cnt{font-size:9px;color:var(--txt2);font-weight:800;flex-shrink:0}

/* MODAL */
.mo{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:2000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px)}
.md{width:400px;max-height:82vh;background:var(--bg2);border-radius:16px;overflow:hidden;border:1px solid var(--border);display:flex;flex-direction:column;animation:popIn .2s ease;color:var(--txt)}
@keyframes popIn{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}}
.md-head{padding:16px 18px 0;text-align:center;flex-shrink:0}
.md-steps{display:flex;justify-content:center;gap:6px;margin-bottom:10px}
.md-step{width:24px;height:4px;border-radius:3px;background:var(--bg3);transition:all .25s}
.md-step.a{background:var(--gold);width:32px}
.md-title{font-family:'Dela Gothic One';font-size:16px;margin-bottom:4px}
.md-body{padding:12px 18px 18px;overflow-y:auto;flex:1}
.cam{width:100%;height:150px;border-radius:var(--rad);background:var(--bg3);border:2px dashed var(--border);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font-size:13px;color:var(--txt3);cursor:pointer;margin-bottom:12px;transition:all .2s}
.cam:hover{border-color:var(--gold);color:var(--gold)}
.cam.done{border-color:var(--grn2);background:rgba(90,156,53,.1);color:var(--grn3)}
.minput{width:100%;padding:9px 11px;background:var(--bg3);border:1.5px solid var(--border);border-radius:var(--rad);color:var(--txt);font-family:'Nunito';font-size:12px;margin-bottom:7px;outline:none;transition:border-color .2s}
.minput:focus{border-color:var(--grn2)}.minput::placeholder{color:var(--txt3)}
.mbtn{width:100%;padding:11px;border-radius:var(--rad);border:none;font-family:'Nunito';font-weight:800;font-size:13px;cursor:pointer;margin-top:6px;transition:all .2s}
.mbtn.pri{background:linear-gradient(90deg,var(--gold),var(--gold2));color:var(--bg)}.mbtn.pri:hover{opacity:.9}
.mbtn.sec{background:var(--bg3);color:var(--txt2)}.mbtn.sec:hover{background:var(--border)}
.mbtn:disabled{opacity:.4;cursor:default}

/* SUCCESS */
.success-overlay{position:fixed;inset:0;z-index:3000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.85);animation:fadeIn .2s}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.success-card{text-align:center;background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:30px 40px}
.success-xp{font-family:'Dela Gothic One';font-size:36px;color:var(--gold);margin:8px 0}
`}</style>

    {!fontsReady&&(
      <div style={{position:"fixed",inset:0,background:"#090c08",zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
        <div style={{fontFamily:"'Dela Gothic One',sans-serif",fontSize:42,letterSpacing:4,color:"#7fd458",animation:"splashPulse 1.6s ease-in-out infinite"}}>
          FOG<span style={{color:"#e8a838"}}>EAT</span>
        </div>
        <div style={{fontSize:12,color:"#5a5648",fontFamily:"sans-serif",letterSpacing:2}}>Владикавказ</div>
      </div>
    )}
    <div className="app" style={{opacity:fontsReady?1:0,transition:"opacity .4s"}}>

      {sr&&(
        <div className="success-overlay">
          <div className="success-card">
            <div style={{fontSize:54}}>{srType==="checkin"?"🎉":"✅"}</div>
            <div className="success-xp">{srType==="checkin"?"+50 XP":srType==="menu"?"📋":"+ 20 XP"}</div>
            <div style={{fontSize:13,color:"var(--txt2)",fontFamily:"'Nunito',sans-serif"}}>{srType==="checkin"?"Чекин сохранён!":srType==="menu"?"Фото отправлено на проверку":"Посещение отмечено!"}</div>
          </div>
        </div>
      )}

    {isMobile ? (
      /* ===== МОБИЛЬНЫЙ LAYOUT ===== */
      <>
        {/* Карта на весь экран */}
        <div className="mob-map">
          <div id="mapEl" ref={mapRef} style={{width:"100%",height:"100%"}}/>
          <button className="fab" onClick={()=>setShowAddVenue(true)}>+</button>
        </div>

        {/* Хедер */}
        <div className="mob-hdr">
          <div className="logo" style={{fontSize:16}}>FOG<span>EAT</span></div>
          <div className="hmode" style={{transform:"scale(.85)",transformOrigin:"left"}}>
            <button className={mm==="city"?"a":""} onClick={()=>setMm("city")}>🌍 Город</button>
            <button className={mm==="my"?"a":""} onClick={()=>setMm("my")}>👤 Моя</button>
          </div>
          <div style={{marginLeft:"auto",fontSize:10,color:"var(--txt3)",fontWeight:700}}>{visitedIds.size}/{allVenues.length}</div>
        </div>

        {/* Панель заведения — полноэкранная шторка */}
        {sv&&allVenues.find(v=>v.id===sv.id)&&(()=>{
          const visited=visitedIds.has(String(sv.id));
          const col=getVenueColor(visited);
          const wished=wishVenues.find(w=>w.id===sv.id);
          const myci=checkins.filter(c=>c.venueId===sv.id);
          return(
            <div className="mob-vp"
              {...swipeClose(()=>setSv(null))}
            >
              <div style={{position:"sticky",top:0,background:"var(--bg2)",zIndex:10,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px 8px",borderBottom:"1px solid var(--border)"}}>
                <div style={{fontFamily:"'Dela Gothic One'",fontSize:16}}>{sv.n}</div>
                <button onClick={()=>setSv(null)} style={{width:30,height:30,borderRadius:"50%",background:"var(--bg3)",border:"1px solid var(--border)",color:"var(--txt2)",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
              </div>
              <div style={{padding:"12px 16px 6px"}}>
                <div style={{fontSize:12,color:"var(--txt3)",marginBottom:8}}>📍 {sv.a}</div>
                <div className="vp-tags">
                  {mm==="city"&&venueRatings[sv.id]?.avg>0&&<span className="vp-tag gold">★ {venueRatings[sv.id].avg} · {venueRatings[sv.id].count} отз.</span>}
                  {mm==="my"&&(()=>{
                    const myRatings=myci.filter(c=>c.rating>0);
                    if(!myRatings.length)return null;
                    const avg=(myRatings.reduce((s,c)=>s+c.rating,0)/myRatings.length).toFixed(1);
                    return <span className="vp-tag gold">★ {avg} · моя оценка</span>;
                  })()}
                  <span className="vp-tag">{sv.c}</span>
                  {getVenueDisplayTags(sv).map(tag=>(
                    <span key={tag.id} className="vp-tag" style={getVenueTagStyle(tag)}>{tag.label}</span>
                  ))}
                  {visited&&<span className="vp-tag grn">✓ Был</span>}
                </div>
              </div>
              <div className="vp-actions">
                <button className="btn-primary" onClick={()=>{setSelectedVenueForCheckin(sv);setSc(true)}}>📸 Чекин</button>
                <button className={`btn-outline ${wished?"active":""}`} onClick={()=>wished?removeWishVenue(sv.id):addWishVenue(sv)}>
                  {wished?"📌 Вишлист":"📌 Хочу"}
                </button>
              </div>
              {sv.ig&&(
                <div style={{padding:"0 14px 10px"}}>
                  <a href={getInstagramUrl(sv.ig)}
                    style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:10,background:"rgba(192,80,240,.1)",border:"1px solid rgba(192,80,240,.25)",color:"#c080f0",cursor:"pointer",textDecoration:"none"}}>
                    <span style={{fontSize:18}}>📷</span>
                    <div><div style={{fontSize:12,fontWeight:800,fontFamily:"'Nunito'"}}>@{sv.ig}</div><div style={{fontSize:9,color:"rgba(192,80,240,.7)"}}>Instagram</div></div>
                    <span style={{marginLeft:"auto"}}>→</span>
                  </a>
                </div>
              )}
              {mm==="my"&&(
                <VenuePersonalTagsEditor
                  venueId={sv.id}
                  labels={customLabels}
                  venueLabels={venueLabels}
                  onToggle={toggleVenuePersonalLabel}
                  onManage={()=>setShowLabelManager(true)}
                />
              )}
              <div style={{padding:"0 14px 10px"}}>
                <div style={{fontSize:10,fontWeight:800,color:"var(--txt3)",marginBottom:5,textTransform:"uppercase"}}>📝 Заметка</div>
                <textarea value={venueNotes[sv.id]||""} onChange={e=>{setVenueNotes(u=>({...u,[sv.id]:e.target.value}));}}
                  placeholder="Общее впечатление..." rows={3}
                  style={{width:"100%",padding:"9px 11px",background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:10,color:"var(--txt)",fontFamily:"'Nunito'",fontSize:12,outline:"none",resize:"none"}}/>
                <div style={{display:"flex",gap:6,marginTop:6}}>
                  <button onClick={()=>{const u={...venueNotes,[sv.id]:venueNotes[sv.id]||""};setVenueNotes(u);saveVenueNotes(u);}}
                    style={{flex:1,padding:"6px",borderRadius:8,border:"none",background:"var(--grn)",color:"#fff",fontFamily:"'Nunito'",fontWeight:800,fontSize:11,cursor:"pointer"}}>
                    💾 Сохранить
                  </button>
                  {venueNotes[sv.id]&&<button onClick={()=>{const u={...venueNotes};delete u[sv.id];setVenueNotes(u);saveVenueNotes(u);}}
                    style={{padding:"6px 10px",borderRadius:8,border:"1px solid rgba(200,50,50,.4)",background:"rgba(200,50,50,.08)",color:"#c05050",fontFamily:"'Nunito'",fontWeight:800,fontSize:11,cursor:"pointer"}}>
                    🗑
                  </button>}
                </div>
              </div>
              <div style={{padding:"0 14px 8px"}}>
                <button style={{width:"100%",padding:9,borderRadius:10,border:"1.5px solid var(--grn2)",background:"rgba(90,156,53,.12)",color:"var(--grn3)",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer"}}
                  onClick={()=>setShowVisitModal(true)}>{visited?"✓ Отметить ещё":"✓ Отметить посещение"}</button>
              </div>
              <div style={{padding:"0 14px 8px"}}>
                <button className="btn-outline" style={{width:"100%"}} onClick={()=>setShowMenuModal(true)}>
                  📋 {menuPhotos[sv.id]?.length>0?`Меню (${menuPhotos[sv.id].length} фото)`:"Добавить меню"}
                </button>
              </div>
              {(isAdmin||sv.custom)&&<div style={{padding:"0 14px 12px"}}>
                {sv._confirmDelete?(
                  <div style={{borderRadius:10,border:"1.5px solid rgba(200,50,50,.5)",background:"rgba(200,50,50,.1)",padding:"10px 12px"}}>
                    <div style={{fontSize:11,fontWeight:800,color:"#d06060",marginBottom:8,textAlign:"center"}}>Удалить «{sv.n}»?</div>
                    <div style={{display:"flex",gap:6}}>
                      <button style={{flex:1,padding:8,borderRadius:8,border:"none",background:"#c03030",color:"#fff",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer"}}
                        onClick={()=>{
                          if(sv.custom){const u=customVenues.filter(v=>v.id!==sv.id);setCustomVenues(u);saveCustomVenues(u);}
                          else{const tombstone={id:sv.id,deleted:true};const u=[...customVenues.filter(v=>v.id!==sv.id),tombstone];setCustomVenues(u);saveCustomVenues(u);}
                          setSv(null);
                        }}>Удалить</button>
                      <button style={{flex:1,padding:8,borderRadius:8,border:"1px solid var(--border)",background:"var(--bg3)",color:"var(--txt2)",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer"}}
                        onClick={()=>setSv(v=>({...v,_confirmDelete:false}))}>Отмена</button>
                    </div>
                  </div>
                ):(
                  <>
                    {mm==="city"&&isAdmin&&!sv.custom&&(
                      <button style={{width:"100%",padding:9,borderRadius:10,border:"1.5px solid rgba(232,168,56,.45)",background:"rgba(232,168,56,.08)",color:"var(--gold)",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer",marginBottom:7}}
                        onClick={()=>openAdminVenueEditor(sv)}>✎ Редактировать заведение</button>
                    )}
                    <button style={{width:"100%",padding:9,borderRadius:10,border:"1.5px solid rgba(200,50,50,.4)",background:"rgba(200,50,50,.07)",color:"#c05050",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer"}}
                      onClick={()=>setSv(v=>({...v,_confirmDelete:true}))}>🗑 Удалить заведение</button>
                  </>
                )}
              </div>}
              {myci.length>0&&<>
                <div className="sec-hdr">📸 Мои чекины <span style={{color:"var(--txt3)",fontWeight:400,fontSize:10}}>{myci.length}</span></div>
                {myci.map((c,i)=>(
                  <div key={i} className="ci" style={{position:"relative"}}>
                    {checkinPhotos[c.id]&&<img src={checkinPhotos[c.id]} alt="" style={{width:"100%",height:120,objectFit:"cover",borderRadius:8,marginBottom:6}}/>}
                    <div className="ci-top"><span className="ci-dish">{c.dish||"Чекин"}</span><span className="ci-date">{c.date} {c.time}</span></div>
                    {c.rating>0&&<div style={{fontSize:11,color:"var(--gold)",margin:"2px 0"}}>★ {c.rating}</div>}
                    {c.review&&<div className="ci-review">«{c.review}»</div>}
                    {confirmDeleteCheckin===c.id?(
                      <div style={{display:"flex",gap:6,marginTop:6,justifyContent:"flex-end"}}>
                        <button onClick={()=>deleteUserCheckin(c)}
                          style={{padding:"2px 10px",borderRadius:6,border:"none",background:"#c03030",color:"#fff",fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito'"}}>Удалить</button>
                        <button onClick={()=>setConfirmDeleteCheckin(null)}
                          style={{padding:"2px 10px",borderRadius:6,border:"1px solid var(--border)",background:"var(--bg3)",color:"var(--txt2)",fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito'"}}>Отмена</button>
                      </div>
                    ):(
                      <button onClick={()=>setConfirmDeleteCheckin(c.id)}
                        style={{display:"block",marginTop:6,marginLeft:"auto",padding:"2px 8px",borderRadius:6,border:"1px solid rgba(200,50,50,.3)",background:"rgba(200,50,50,.08)",color:"#c05050",fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito'"}}>🗑 удалить</button>
                    )}
                  </div>
                ))}
              </>}
              <div style={{height:20}}/>
            </div>
          );
        })()}

        {/* Нижняя шторка со списком/вишлистом/чекинами/профилем */}
        {!sv&&(
          <div className="mob-sheet" ref={sheetElRef} style={{
            height: sheetOpen ? `${sheetHeight}vh` : "36px",
          }}>
            <div className="mob-sheet-handle"
              onTouchStart={e=>{
                const startY=e.touches[0].clientY;
                const startH=sheetOpen?sheetHeight:0;
                let moved=false;
                const el=sheetElRef.current;
                if(el)el.style.transition="none";
                const onMove=ev=>{
                  moved=true;
                  const dy=startY-ev.touches[0].clientY;
                  const newH=Math.min(72,Math.max(0,startH+dy/window.innerHeight*100));
                  if(el)el.style.height=`${newH}vh`;
                };
                const onEnd=ev=>{
                  sheetDragRef.current=false;
                  if(el)el.style.transition="height .3s cubic-bezier(.4,0,.2,1)";
                  if(!moved){
                    setSheetOpen(o=>{
                      if(!o){setSheetHeight(55);if(el)el.style.height="55vh";}
                      else{if(el)el.style.height="36px";}
                      return !o;
                    });
                  } else {
                    const dy=startY-ev.changedTouches[0].clientY;
                    const finalH=Math.min(72,Math.max(0,startH+dy/window.innerHeight*100));
                    if(finalH<15){setSheetOpen(false);setSheetHeight(55);if(el)el.style.height="36px";}
                    else{setSheetOpen(true);setSheetHeight(finalH);}
                  }
                  document.removeEventListener("touchmove",onMove);
                  document.removeEventListener("touchend",onEnd);
                };
                sheetDragRef.current=true;
                document.addEventListener("touchmove",onMove,{passive:true});
                document.addEventListener("touchend",onEnd);
              }}
            >
              <span className="mob-sheet-tip">{sheetOpen?"нажми, чтобы свернуть":"нажми, чтобы развернуть"}</span>
            </div>

            {tab==="map"&&(
              <div style={{display:"flex",flexDirection:"column",overflow:"hidden",flex:1}}>
                <div style={{padding:"8px 10px 4px",position:"relative"}}>
                  <span style={{position:"absolute",left:18,top:"50%",transform:"translateY(-50%)",fontSize:13}}>🔍</span>
                  <input className="srch" placeholder="Поиск..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:30}}/>
                </div>
                <div className="chips" onMouseDown={e=>{const el=e.currentTarget;el.classList.add("dragging");const sx=e.pageX-el.offsetLeft,sl=el.scrollLeft;const mv=ev=>{el.scrollLeft=sl-(ev.pageX-el.offsetLeft-sx);};const up=()=>{el.classList.remove("dragging");window.removeEventListener("mousemove",mv);window.removeEventListener("mouseup",up);};window.addEventListener("mousemove",mv);window.addEventListener("mouseup",up);}}>
                  {CATEGORIES.map(c=><button key={c.k} className={`chip ${activeCategory===c.k?"a":""}`} onClick={()=>setCf(c.k)}>{c.l}</button>)}
                  {mm==="my"&&customLabels.map(l=><button key={`lbl_${l.id}`} className={`chip ${cf===`lbl_${l.id}`?"a":""}`} onClick={()=>setCf(`lbl_${l.id}`)}>{l.emoji} {l.name}</button>)}
                  {mm==="my"&&<button className="chip" style={{borderStyle:"dashed",opacity:.7}} onClick={()=>setShowLabelManager(true)}>⚙️</button>}
                </div>
                <div style={{padding:"2px 12px 4px",fontSize:9,color:"var(--txt3)",fontWeight:700,display:"flex",justifyContent:"space-between"}}>
                  <span>{fl.length} заведений</span>
                  <div style={{display:"flex",gap:4}}>
                    <button onClick={()=>setSortBy(s=>s==="rating_desc"?"rating_asc":s==="rating_asc"?"default":"rating_desc")}
                      style={{padding:"2px 8px",borderRadius:6,background:sortBy!=="default"?"var(--gold)":"var(--bg3)",color:sortBy!=="default"?"var(--bg)":"var(--txt3)",border:"none",fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito'"}}>
                      {sortBy==="rating_desc"?"★ ↓":sortBy==="rating_asc"?"★ ↑":"★ —"}
                    </button>
                    <button onClick={()=>setShowAddVenue(true)} style={{padding:"2px 8px",borderRadius:6,background:"var(--grn)",color:"#fff",border:"none",fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito'"}}>+ Добавить</button>
                  </div>
                </div>
                <div className="sc">
                  {fl.map(v=>{
                    const visited=visitedIds.has(String(v.id));
                    const col=getVenueColor(visited);
                    return(
                      <div key={v.id} className="vi" onClick={()=>{setSv(v);mapInst.current?.flyTo([v.lat,v.lng],16,{duration:.5})}}>
                        <div className="vi-strip" style={{background:col.accent}}/>
                        <div className="vi-icon" style={{background:col.bg}}>{v.i}</div>
                        <div className="vi-info"><div className="vi-name">{v.n}</div><div className="vi-sub">{getVenueSubtitle(v)}</div></div>
                        <div className="vi-right">
                          {mm==="city"&&venueRatings[v.id]?.avg>0&&<div className="vi-rating">★ {venueRatings[v.id].avg}</div>}
                          {mm==="my"&&(()=>{const myR=checkins.filter(c=>c.venueId===v.id&&c.rating>0);if(!myR.length)return null;const avg=(myR.reduce((s,c)=>s+c.rating,0)/myR.length).toFixed(1);return<div className="vi-rating" style={{color:"var(--grn3)"}}>★ {avg}</div>;})()}
                          {visited&&<div className="vi-visited"/>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {tab==="wishlist"&&(
              <div style={{display:"flex",flexDirection:"column",overflow:"hidden",flex:1}}>
                <div className="wl-tabs">{["venues","dishes","done"].map(k=><button key={k} className={`wl-tab ${wt===k?"a":""}`} onClick={()=>setWt(k)}>{k==="venues"?"📍 Места":k==="dishes"?"🍽️ Блюда":"✅ Готово"}</button>)}</div>
                <div className="sc">
                  {wt==="venues"&&(wishVenues.length===0?<div className="empty"><div className="empty-ico">📌</div><div className="empty-txt">Нет мест</div></div>:wishVenues.map((w,i)=>(
                    <div key={i} className="wi"><div className="wic">{w.c}</div><div className="wif"><div className="win">{w.n}</div></div><button className="wr" onClick={()=>removeWishVenue(w.id)}>×</button></div>
                  )))}
                  {wt==="dishes"&&(wishDishes.length===0?<div className="empty"><div className="empty-ico">🍽️</div><div className="empty-txt">Нет блюд</div></div>:wishDishes.map((w,i)=>(
                    <div key={`${w.venueId}-${w.dishId}-${i}`} className="wi"><div className="wic">{w.e}</div><div className="wif"><div className="win">{w.d}</div><div className="wint">{w.v}{w.tag?` · ${w.tag}`:""}</div></div><button className="wr" onClick={()=>removeWishDish(w)}>×</button></div>
                  )))}
                  {wt==="done"&&checkins.slice(0,20).map((c,i)=>(
                    <div key={i} className="wi" style={{opacity:.7}}><div className="wic">✅</div><div className="wif"><div className="win" style={{textDecoration:"line-through"}}>{c.venueName}</div><div className="wint">{c.date}</div></div></div>
                  ))}
                </div>
              </div>
            )}

            {tab==="checkins"&&(
              <div className="sc">
                {checkins.length===0?<div className="empty"><div className="empty-ico">📸</div><div className="empty-txt">Нет чекинов</div></div>:checkins.map((c,i)=>(
                  <div key={i} className="ck" style={{display:"flex",alignItems:"flex-start",gap:6}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div className="ck-venue">{c.venueName}</div>
                      <div className="ck-meta">
                        <span style={{color:"var(--gold)",fontSize:10}}>{c.rating>0?`★ ${c.rating}`:""}</span>
                        {c.dish&&<span className="ck-dish">{c.dish}</span>}
                        <span className="ck-date">{c.date}</span>
                      </div>
                      {c.review&&<div className="ck-review">«{c.review}»</div>}
                    </div>
                    {confirmDeleteCheckin===c.id?(
                      <div style={{display:"flex",gap:4,flexShrink:0}}>
                        <button onClick={()=>deleteUserCheckin(c)}
                          style={{width:40,height:20,borderRadius:6,border:"none",background:"#c03030",color:"#fff",fontSize:9,cursor:"pointer"}}>да</button>
                        <button onClick={()=>setConfirmDeleteCheckin(null)}
                          style={{width:40,height:20,borderRadius:6,border:"1px solid var(--border)",background:"var(--bg3)",color:"var(--txt2)",fontSize:9,cursor:"pointer"}}>нет</button>
                      </div>
                    ):(
                      <button onClick={()=>setConfirmDeleteCheckin(c.id)}
                        style={{flexShrink:0,marginTop:2,width:20,height:20,borderRadius:"50%",border:"1px solid var(--border)",background:"none",color:"var(--txt3)",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab==="top"&&(
              <div className="sc">
                {viewProfile?(
                  <>
                    <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderBottom:"1px solid var(--border)",flexShrink:0}}>
                      <button onClick={()=>setViewProfile(null)} style={{background:"none",border:"none",color:"var(--txt2)",fontSize:20,cursor:"pointer",padding:"0 4px"}}>‹</button>
                      <div style={{fontFamily:"'Dela Gothic One'",fontSize:15}}>@{viewProfile.username}</div>
                    </div>
                    <UserCheckins userId={viewProfile.userId}/>
                  </>
                ):(
                  <TopUsers currentUserId={currentUser?.id} onViewProfile={setViewProfile}/>
                )}
              </div>
            )}

            {tab==="profile"&&(
              <div className="sc">
                <div className="prof-hero">
                  <div className="prof-av">{user.name[0]}</div>
                  <div className="prof-name">{user.name}</div>
                  <div className="prof-title">Lv.{user.level} · {user.title}</div>
                  <div className="prof-xp-bar"><div className="prof-xp-fill" style={{width:`${(user.xp/user.nxp)*100}%`}}/></div>
                  <div className="prof-xp-lbl">{user.xp} / {user.nxp} XP</div>
                  <button onClick={()=>authService.signOut()}
                    style={{marginTop:12,padding:"6px 20px",borderRadius:8,border:"1px solid #333",background:"none",color:"var(--txt3)",fontFamily:"'Nunito'",fontWeight:700,fontSize:11,cursor:"pointer"}}>
                    Выйти из аккаунта
                  </button>
                </div>
                <div className="stats-grid">
                  {[{n:visitedIds.size,l:"Открыто"},{n:checkins.length,l:"Чекинов"},{n:checkins.filter(c=>c.review&&c.review.trim()).length,l:"Отзывов"},{n:checkins.filter(c=>c.photoKey).length,l:"Фото"}].map((s,i)=>(
                    <div key={i} className="stat-card"><div className="stat-n">{s.n}</div><div className="stat-l">{s.l}</div></div>
                  ))}
                </div>
                <div className="sec-hdr">🏆 Достижения</div>
                {computedAchs.map((a,i)=>(
                  <div key={i} className="ach">
                    <div className={`ach-icon ${a.ok?"done":""}`}>{a.i}</div>
                    <div className="ach-info"><div className="ach-name">{a.n}</div><div className="ach-desc">{a.d}</div>{!a.ok&&<div className="ach-bar"><div className="ach-bar-fill" style={{width:`${Math.min(100,(a.p/a.t)*100)}%`}}/></div>}</div>
                    <div className="ach-cnt">{a.ok?"✅":`${a.p}/${a.t}`}</div>
                  </div>
                ))}
                {isAdmin&&<AdminPanel
                  catalogVenues={catalogVenues}
                  adminUserId={currentUser?.id}
                  onCatalogVenueCreated={(venue)=>setCatalogVenues(prev=>prev.some(v=>v.id===venue.id)?prev:[...prev,venue])}
                />}
              </div>
            )}
          </div>
        )}

        {/* Фиксированный таббар снизу */}
        <div className="mob-tabs">
          {[["map","📍","Места"],["wishlist","📌","Вишлист"],["checkins","✅","Чекины"],["top","🏆","Топ"],["profile","👤","Профиль"]].map(([k,ico,lbl])=>(
            <button key={k} className={`mob-tab ${tab===k?"a":""}`} onClick={()=>{setTab(k);if(!sheetOpen)setSheetOpen(true);}}>
              <span className="ico">{ico}</span>{lbl}
            </button>
          ))}
        </div>

      </>
    ) : (
      <>
      <div className="hdr">
        <div className="logo">FOG<span>EAT</span></div>
        <div className="hmode">
          <button className={mm==="city"?"a":""} onClick={()=>setMm("city")}>🌍 Город</button>
          <button className={mm==="my"?"a":""} onClick={()=>setMm("my")}>👤 Моя</button>
        </div>
        <div className="hprog">
          <span className="hprog-txt">{visitedIds.size}/{allVenues.length}</span>
          <div className="hprog-bar"><div className="hprog-fill" style={{width:`${(visitedIds.size/allVenues.length)*100}%`}}/></div>
        </div>
        <div className="havatar" onClick={()=>setTab("profile")}>
          <div className="hav-icon">{user.name[0]}</div>
          <div><div className="hav-name">{user.name}</div><div className="hav-lvl">Lv.{user.level} {user.title}</div></div>
        </div>
        <button onClick={()=>authService.signOut()} title="Выйти"
          style={{background:"none",border:"1px solid #222820",borderRadius:8,color:"#5a5648",fontSize:11,cursor:"pointer",padding:"4px 8px",fontFamily:"'Nunito'",fontWeight:700}}>
          ⎋
        </button>
      </div>

      <div className="main">

        {/* SIDEBAR */}
        <div className={`side ${sideOpen?"":"cl"}`}>
          <div className="tabs">
            {Object.entries(TAB_ICONS).map(([k,ico])=>(
              <button key={k} className={`tab-btn ${tab===k?"a":""}`} onClick={()=>setTab(k)}>
                {ico}<span className="tab-lbl">{k==="map"?"Места":k==="wishlist"?"Вишлист":k==="checkins"?"Чекины":k==="top"?"Топ":"Профиль"}</span>
              </button>
            ))}
          </div>

          {/* MAP TAB */}
          {tab==="map"&&(
            <div style={{display:"flex",flexDirection:"column",overflow:"hidden",flex:1}}>
              <div className="srch-wrap">
                <span className="srch-ico">🔍</span>
                <input className="srch" placeholder="Поиск заведений..." value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
              <div className="chips"
                onMouseDown={e=>{
                  const el=e.currentTarget;
                  el.classList.add("dragging");
                  const startX=e.pageX-el.offsetLeft;
                  const scrollLeft=el.scrollLeft;
                  const onMove=ev=>{
                    const x=ev.pageX-el.offsetLeft;
                    el.scrollLeft=scrollLeft-(x-startX);
                  };
                  const onUp=()=>{
                    el.classList.remove("dragging");
                    window.removeEventListener("mousemove",onMove);
                    window.removeEventListener("mouseup",onUp);
                  };
                  window.addEventListener("mousemove",onMove);
                  window.addEventListener("mouseup",onUp);
                }}>
                {CATEGORIES.map(c=><button key={c.k} className={`chip ${activeCategory===c.k?"a":""}`} onClick={()=>setCf(c.k)}>{c.l}</button>)}
                {mm==="my"&&customLabels.map(l=><button key={`lbl_${l.id}`} className={`chip ${cf===`lbl_${l.id}`?"a":""}`} onClick={()=>setCf(`lbl_${l.id}`)}>{l.emoji} {l.name}</button>)}
                {mm==="my"&&<button className="chip" style={{borderStyle:"dashed",opacity:.7}} onClick={()=>setShowLabelManager(true)}>⚙️</button>}
              </div>
              <div style={{padding:"5px 12px 4px",fontSize:9,color:"var(--txt3)",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span>{fl.length} {mm==="my"?"посещено":"заведений"}</span>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  <button onClick={()=>setSortBy(s=>s==="rating_desc"?"rating_asc":s==="rating_asc"?"default":"rating_desc")}
                    style={{padding:"2px 8px",borderRadius:6,background:sortBy!=="default"?"var(--gold)":"var(--bg3)",color:sortBy!=="default"?"var(--bg)":"var(--txt3)",border:"none",fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito'"}}>
                    {sortBy==="rating_desc"?"★ ↓":sortBy==="rating_asc"?"★ ↑":"★ —"}
                  </button>
                  <button onClick={()=>setShowAddVenue(true)} style={{padding:"2px 8px",borderRadius:6,background:"var(--grn)",color:"#fff",border:"none",fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito'"}}>+ Добавить</button>
                </div>
              </div>
              <div className="sc">
                {fl.map(v=>{
                  const visited=visitedIds.has(String(v.id));
                  const col=getVenueColor(visited);
                  return(
                    <div key={v.id} className="vi" onClick={()=>{setSv(v);mapInst.current?.flyTo([v.lat,v.lng],16,{duration:.5})}}>
                      <div className="vi-strip" style={{background:col.accent}}/>
                      <div className="vi-icon" style={{background:col.bg}}>{v.i}</div>
                      <div className="vi-info">
                        <div className="vi-name">{v.n}</div>
                        <div className="vi-sub">{getVenueSubtitle(v)}</div>
                      </div>
                      <div className="vi-right">
                        {mm==="city"&&venueRatings[v.id]?.avg>0&&<div className="vi-rating">★ {venueRatings[v.id].avg}</div>}
                        {mm==="my"&&(()=>{
                          const myR=checkins.filter(c=>c.venueId===v.id&&c.rating>0);
                          if(!myR.length)return null;
                          const avg=(myR.reduce((s,c)=>s+c.rating,0)/myR.length).toFixed(1);
                          return <div className="vi-rating" style={{color:"var(--grn3)",borderColor:"rgba(90,156,53,.3)"}}>★ {avg}</div>;
                        })()}
                        {visited&&<div className="vi-visited" title="Ты здесь был"/>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FEED TAB */}
          {/* WISHLIST TAB */}
          {tab==="wishlist"&&(
            <div style={{display:"flex",flexDirection:"column",overflow:"hidden",flex:1}}>
              <div className="wl-tabs">
                {["venues","dishes","done"].map(k=>(
                  <button key={k} className={`wl-tab ${wt===k?"a":""}`} onClick={()=>setWt(k)}>
                    {k==="venues"?"📍 Места":k==="dishes"?"🍽️ Блюда":"✅ Готово"}
                  </button>
                ))}
              </div>
              <div className="sc">
                {wt==="venues"&&(wishVenues.length===0?(
                  <div className="empty"><div className="empty-ico">📌</div><div className="empty-txt">Нет сохранённых мест</div></div>
                ):wishVenues.map((w,i)=>(
                  <div key={i} className="wi">
                    <div className="wic">{w.c}</div>
                    <div className="wif"><div className="win">{w.n}</div>{w.no&&<div className="wint">{w.no}</div>}</div>
                    <button className="wr" onClick={()=>removeWishVenue(w.id)}>×</button>
                  </div>
                )))}
                {wt==="dishes"&&(wishDishes.length===0?(
                  <div className="empty"><div className="empty-ico">🍽️</div><div className="empty-txt">Нет сохранённых блюд</div></div>
                ):wishDishes.map((w,i)=>(
                  <div key={`${w.venueId}-${w.dishId}-${i}`} className="wi">
                    <div className="wic">{w.e}</div>
                    <div className="wif"><div className="win">{w.d}</div><div className="wint">{w.v}{w.tag?` · ${w.tag}`:""}</div></div>
                    <button className="wr" onClick={()=>removeWishDish(w)}>×</button>
                  </div>
                )))}
                {wt==="done"&&checkins.slice(0,20).map((c,i)=>(
                  <div key={i} className="wi" style={{opacity:.7}}>
                    <div className="wic">✅</div>
                    <div className="wif">
                      <div className="win" style={{textDecoration:"line-through"}}>{c.venueName}</div>
                      <div className="wint">{c.date} · {c.dish||"Чекин"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHECKINS TAB */}
          {tab==="checkins"&&(
            <div className="sc">
              {checkins.length===0?(
                <div className="empty">
                  <div className="empty-ico">📸</div>
                  <div className="empty-txt">Ещё нет чекинов</div>
                  <div style={{fontSize:10,marginTop:6,color:"var(--txt3)"}}>Нажми + на карте чтобы добавить</div>
                </div>
              ):checkins.map((c,i)=>(
                <div key={i} className="ck" style={{display:"flex",alignItems:"flex-start",gap:6}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div className="ck-venue">{c.venueName}</div>
                    <div className="ck-meta">
                      <span style={{color:"var(--gold)",fontSize:10}}>{c.rating>0?(`★ ${c.rating}`):""}</span>
                      {c.dish&&<span className="ck-dish">{c.dish}</span>}
                      <span className="ck-date">{c.date}</span>
                    </div>
                    {c.review&&<div className="ck-review">«{c.review}»</div>}
                  </div>
                  <button onClick={()=>deleteUserCheckin(c)} style={{flexShrink:0,marginTop:2,width:20,height:20,borderRadius:"50%",border:"1px solid var(--border)",background:"none",color:"var(--txt3)",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* TOP TAB */}
          {tab==="top"&&(
            <div className="sc">
              {viewProfile?(
                <>
                  <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderBottom:"1px solid var(--border)",flexShrink:0}}>
                    <button onClick={()=>setViewProfile(null)} style={{background:"none",border:"none",color:"var(--txt2)",fontSize:20,cursor:"pointer",padding:"0 4px"}}>‹</button>
                    <div style={{fontFamily:"'Dela Gothic One'",fontSize:15}}>@{viewProfile.username}</div>
                  </div>
                  <UserCheckins userId={viewProfile.userId}/>
                </>
              ):(
                <TopUsers currentUserId={currentUser?.id} onViewProfile={setViewProfile}/>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {tab==="profile"&&(
            <div className="sc">
              <div className="prof-hero">
                <div className="prof-av">{user.name[0]}</div>
                <div className="prof-name">{user.name}</div>
                {currentUser&&<div style={{fontSize:10,color:"var(--txt3)",marginBottom:4}}>{currentUser.email}</div>}
                <div className="prof-title">Lv.{user.level} · {user.title}</div>
                <div className="prof-xp-bar"><div className="prof-xp-fill" style={{width:`${(user.xp/user.nxp)*100}%`}}/></div>
                <div className="prof-xp-lbl">{user.xp} / {user.nxp} XP</div>
                <button onClick={()=>authService.signOut()}
                  style={{marginTop:12,padding:"6px 20px",borderRadius:8,border:"1px solid #333",background:"none",color:"var(--txt3)",fontFamily:"'Nunito'",fontWeight:700,fontSize:11,cursor:"pointer"}}>
                  Выйти из аккаунта
                </button>
              </div>
              <div className="stats-grid">
                {[
                  {n:visitedIds.size,l:"Открыто"},
                  {n:checkins.length,l:"Чекинов"},
                  {n:checkins.filter(c=>c.review&&c.review.trim()).length,l:"Отзывов"},
                  {n:checkins.filter(c=>c.photoKey).length,l:"Фото"},
                ].map((s,i)=>(
                  <div key={i} className="stat-card">
                    <div className="stat-n">{s.n}</div>
                    <div className="stat-l">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="sec-hdr">🏆 Достижения</div>
              {computedAchs.map((a,i)=>(
                <div key={i} className="ach">
                  <div className={`ach-icon ${a.ok?"done":""}`}>{a.i}</div>
                  <div className="ach-info">
                    <div className="ach-name">{a.n}</div>
                    <div className="ach-desc">{a.d}</div>
                    {!a.ok&&<div className="ach-bar"><div className="ach-bar-fill" style={{width:`${Math.min(100,(a.p/a.t)*100)}%`}}/></div>}
                  </div>
                  <div className="ach-cnt">{a.ok?"✅":`${a.p}/${a.t}`}</div>
                </div>
              ))}
              {isAdmin&&<AdminPanel
                catalogVenues={catalogVenues}
                adminUserId={currentUser?.id}
                onCatalogVenueCreated={(venue)=>setCatalogVenues(prev=>prev.some(v=>v.id===venue.id)?prev:[...prev,venue])}
              />}
            </div>
          )}
        </div>

        {/* MAP AREA */}
        <div className="ma">
          <button className="tog" onClick={()=>setSideOpen(!sideOpen)}>{sideOpen?"◀":"▶"}</button>
          <div id="mapEl" ref={mapRef}/>
          
          <button className="fab" onClick={()=>setShowAddVenue(true)}>+</button>

          {/* VENUE DETAIL PANEL */}
          {sv&&allVenues.find(v=>v.id===sv.id)&&(()=>{
            const visited=visitedIds.has(String(sv.id));
            const col=getVenueColor(visited);
            const wished=wishVenues.find(w=>w.id===sv.id);
            const myci=checkins.filter(c=>c.venueId===sv.id);
            return(
              <div className="vp">
                <div className="vp-hero" style={{background:`linear-gradient(160deg,${col.bg},var(--bg2))`}}>
                  <button className="vp-close" onClick={()=>setSv(null)}>✕</button>
                  <span className="vp-emoji">{sv.i}</span>
                  <div className="vp-name">{sv.n}</div>
                  <div className="vp-addr">📍 {sv.a}</div>
                  <div className="vp-tags">
                    {mm==="city"&&venueRatings[sv.id]?.avg>0&&<span className="vp-tag gold">★ {venueRatings[sv.id].avg} · {venueRatings[sv.id].count} отз.</span>}
                    {mm==="my"&&(()=>{
                      const myRatings=myci.filter(c=>c.rating>0);
                      if(myRatings.length===0)return null;
                      const avg=(myRatings.reduce((s,c)=>s+c.rating,0)/myRatings.length).toFixed(1);
                      return <span className="vp-tag gold">★ {avg} · моя оценка</span>;
                    })()}
                    <span className="vp-tag">{sv.c}</span>
                    {getVenueDisplayTags(sv).map(tag=>(
                      <span key={tag.id} className="vp-tag" style={getVenueTagStyle(tag)}>{tag.label}</span>
                    ))}
                    {visited&&<span className="vp-tag grn">✓ Ты здесь был</span>}
                  </div>
                </div>
                <div className="vp-actions">
                  <button className="btn-primary" onClick={()=>{setSelectedVenueForCheckin(sv);setSc(true)}}>📸 Чекин</button>
                  <button className={`btn-outline ${wished?"active":""}`} onClick={()=>wished?removeWishVenue(sv.id):addWishVenue(sv)}>
                    {wished?"📌 В вишлисте":"📌 Хочу сюда"}
                  </button>
                </div>
                {sv.ig&&(
                  <div style={{padding:"0 14px 10px"}}>
                    <a href={getInstagramUrl(sv.ig)}
                      style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:10,background:"rgba(192,80,240,.1)",border:"1px solid rgba(192,80,240,.25)",color:"#c080f0",cursor:"pointer",textDecoration:"none"}}>
                      <span style={{fontSize:18}}>📷</span>
                      <div>
                        <div style={{fontSize:12,fontWeight:800,fontFamily:"'Nunito'"}}>@{sv.ig}</div>
                        <div style={{fontSize:9,color:"rgba(192,80,240,.7)"}}>Instagram</div>
                      </div>
                      <span style={{marginLeft:"auto",fontSize:12}}>→</span>
                    </a>
                  </div>
                )}
                {mm==="my"&&(
                  <VenuePersonalTagsEditor
                    venueId={sv.id}
                    labels={customLabels}
                    venueLabels={venueLabels}
                    onToggle={toggleVenuePersonalLabel}
                    onManage={()=>setShowLabelManager(true)}
                  />
                )}
                {/* VENUE NOTE */}
                <div style={{padding:"0 14px 10px"}}>
                  <div style={{fontSize:10,fontWeight:800,color:"var(--txt3)",marginBottom:5,textTransform:"uppercase",letterSpacing:".5px"}}>📝 Заметка</div>
                  <textarea
                    value={venueNotes[sv.id]||""}
                    onChange={e=>{
                      setVenueNotes(u=>({...u,[sv.id]:e.target.value}));
                    }}
                    placeholder="Общее впечатление, что попробовать, с кем прийти..."
                    rows={3}
                    style={{width:"100%",padding:"9px 11px",background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:10,color:"var(--txt)",fontFamily:"'Nunito'",fontSize:12,outline:"none",resize:"none",transition:"border-color .2s"}}
                    onFocus={e=>e.target.style.borderColor="var(--txt2)"}
                    onBlur={e=>e.target.style.borderColor="var(--border)"}
                  />
                  <div style={{display:"flex",gap:6,marginTop:6}}>
                    <button onClick={()=>{const u={...venueNotes,[sv.id]:venueNotes[sv.id]||""};setVenueNotes(u);saveVenueNotes(u);}}
                      style={{flex:1,padding:"6px",borderRadius:8,border:"none",background:"var(--grn)",color:"#fff",fontFamily:"'Nunito'",fontWeight:800,fontSize:11,cursor:"pointer"}}>
                      💾 Сохранить
                    </button>
                    {venueNotes[sv.id]&&<button onClick={()=>{const u={...venueNotes};delete u[sv.id];setVenueNotes(u);saveVenueNotes(u);}}
                      style={{padding:"6px 10px",borderRadius:8,border:"1px solid rgba(200,50,50,.4)",background:"rgba(200,50,50,.08)",color:"#c05050",fontFamily:"'Nunito'",fontWeight:800,fontSize:11,cursor:"pointer"}}>
                      🗑
                    </button>}
                  </div>
                </div>
                <div style={{padding:"0 14px 8px"}}>
                  <button style={{width:"100%",padding:9,borderRadius:10,border:"1.5px solid var(--grn2)",background:"rgba(90,156,53,.12)",color:"var(--grn3)",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer"}}
                    onClick={()=>setShowVisitModal(true)}>
                    {visited?"✓ Был здесь · отметить ещё":"✓ Отметить посещение"}
                  </button>
                </div>
                <div style={{padding:"0 14px 12px"}}>
                  <button className="btn-outline" style={{width:"100%"}} onClick={()=>setShowMenuModal(true)}>
                    📋 {menuPhotos[sv.id]?.length>0?`Меню (${menuPhotos[sv.id].length} фото)`:"Добавить меню"}
                  </button>
                </div>
                {(isAdmin||sv.custom)&&<div style={{padding:"0 14px 12px"}}>
                  {sv._confirmDelete?(
                    <div style={{borderRadius:10,border:"1.5px solid rgba(200,50,50,.5)",background:"rgba(200,50,50,.1)",padding:"10px 12px"}}>
                      <div style={{fontSize:11,fontWeight:800,color:"#d06060",marginBottom:8,textAlign:"center"}}>Удалить «{sv.n}»?</div>
                      <div style={{display:"flex",gap:6}}>
                        <button style={{flex:1,padding:8,borderRadius:8,border:"none",background:"#c03030",color:"#fff",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer"}}
                          onClick={()=>{
                            if(sv.custom){
                              const updated=customVenues.filter(v=>v.id!==sv.id);
                              setCustomVenues(updated);saveCustomVenues(updated);
                            } else {
                              const tombstone={id:sv.id,deleted:true};
                              const updated=[...customVenues.filter(v=>v.id!==sv.id),tombstone];
                              setCustomVenues(updated);saveCustomVenues(updated);
                            }
                            setSv(null);
                          }}>Удалить</button>
                        <button style={{flex:1,padding:8,borderRadius:8,border:"1px solid var(--border)",background:"var(--bg3)",color:"var(--txt2)",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer"}}
                          onClick={()=>setSv(v=>({...v,_confirmDelete:false}))}>Отмена</button>
                      </div>
                    </div>
                  ):(
                    <>
                      {mm==="city"&&isAdmin&&!sv.custom&&(
                        <button
                          style={{width:"100%",padding:9,borderRadius:10,border:"1.5px solid rgba(232,168,56,.45)",background:"rgba(232,168,56,.08)",color:"var(--gold)",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer",marginBottom:7}}
                          onClick={()=>openAdminVenueEditor(sv)}>
                          ✎ Редактировать заведение
                        </button>
                      )}
                      <button
                        style={{width:"100%",padding:9,borderRadius:10,border:"1.5px solid rgba(200,50,50,.4)",background:"rgba(200,50,50,.07)",color:"#c05050",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer"}}
                        onClick={()=>setSv(v=>({...v,_confirmDelete:true}))}>
                        🗑 Удалить заведение
                      </button>
                    </>
                  )}
                </div>}
                {menuPhotos[sv.id]?.length>0&&<>
                  <div className="sec-hdr">📋 Меню заведения <span style={{color:"var(--txt3)",fontWeight:400,fontSize:10}}>{menuPhotos[sv.id].length} фото</span></div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,padding:"4px 14px 12px"}}>
                    {menuPhotos[sv.id].map((p,i)=>(
                      <div key={i} style={{width:96,height:96,borderRadius:8,overflow:"hidden",position:"relative",border:"1px solid var(--border)",cursor:"pointer"}}
                        onClick={()=>setPhotoViewer({photos:menuPhotos[sv.id],index:i})}>
                        <img src={p.src} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        <button onClick={async e=>{e.stopPropagation();await removeMenuPhoto(sv.id,i);}} style={{position:"absolute",top:4,right:4,width:20,height:20,borderRadius:"50%",background:"rgba(180,30,30,.85)",border:"none",color:"#fff",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800}}>×</button>
                      </div>
                    ))}
                    <div onClick={()=>setShowMenuModal(true)} style={{width:96,height:96,borderRadius:8,background:"var(--bg3)",border:"2px dashed var(--border)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:22,color:"var(--txt3)"}}>+</div>
                  </div>
                </>}
                {sv.dishes&&<>
                  <div className="sec-hdr">🍽️ Народное меню <span style={{color:"var(--txt3)",fontWeight:400,fontSize:10}}>{sv.dishes.length} блюд</span></div>
                  {sv.dishes.map(d=>(
                    <div key={d.id} className="dr">
                      <div className="de">{d.ph}</div>
                      <div className="di">
                        <div className="dn">{d.nm}</div>
                        <div className="dt">{d.tg}</div>
                        <div className="ds"><span style={{color:"var(--gold)"}}>★ {d.rt}</span> · {d.pr}₽ · {d.rv} отз.</div>
                      </div>
                      <button className={`wish-btn ${hasWishDish(sv,d)?"on":""}`}
                        onClick={()=>toggleWishDish(sv,d)}>
                        {hasWishDish(sv,d)?"✓":"+ Хочу"}
                      </button>
                    </div>
                  ))}
                </>}
                {myci.length>0&&<>
                  <div className="sec-hdr">📸 Мои чекины <span style={{color:"var(--txt3)",fontWeight:400,fontSize:10}}>{myci.length}</span></div>
                  {myci.map((c,i)=>(
                    <div key={i} className="ci" style={{position:"relative"}}>
                      {checkinPhotos[c.id]&&<img src={checkinPhotos[c.id]} alt="" style={{width:"100%",height:120,objectFit:"cover",borderRadius:8,marginBottom:6}}/>}
                      <div className="ci-top">
                        <span className="ci-dish">{c.dish||"Чекин"}</span>
                        <span className="ci-date">{c.date} {c.time}</span>
                      </div>
                      {c.rating>0&&<div style={{fontSize:11,color:"var(--gold)",margin:"2px 0"}}>★ {c.rating}</div>}
                      {c.price&&<div style={{fontSize:10,color:"var(--txt3)"}}>{c.price}₽</div>}
                      {c.review&&<div className="ci-review">«{c.review}»</div>}
                      {confirmDeleteCheckin===c.id?(
                        <div style={{display:"flex",gap:6,marginTop:6,justifyContent:"flex-end"}}>
                          <button onClick={()=>deleteUserCheckin(c)} style={{padding:"2px 10px",borderRadius:6,border:"none",background:"#c03030",color:"#fff",fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito'"}}>Удалить</button>
                          <button onClick={()=>setConfirmDeleteCheckin(null)}
                            style={{padding:"2px 10px",borderRadius:6,border:"1px solid var(--border)",background:"var(--bg3)",color:"var(--txt2)",fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito'"}}>Отмена</button>
                        </div>
                      ):(
                        <button onClick={()=>setConfirmDeleteCheckin(c.id)}
                          style={{display:"block",marginTop:6,marginLeft:"auto",padding:"2px 8px",borderRadius:6,border:"1px solid rgba(200,50,50,.3)",background:"rgba(200,50,50,.08)",color:"#c05050",fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito'"}}>🗑 удалить</button>
                      )}
                    </div>
                  ))}
                </>}
              </div>
            );
          })()}
        </div>
      </div>
      </>
    )} {/* конец десктопного layout */}
    </div> {/* конец .app */}

    {/* CHECKIN MODAL */}
    {sc&&(
      <div className="mo" onClick={()=>{setSc(false);setCs(2);setCr(0);setCheckinPhoto(null);setDishName("");setReviewText("");setPrice("");}}>
        <div className="md" onClick={e=>e.stopPropagation()} {...swipeClose(()=>{setSc(false);setCheckinPhoto(null);setDishName("");setReviewText("");setPrice("");})}>
          <div className="md-head">
            <div className="md-title">🍽️ Блюдо и фото</div>
            {(sv||selectedVenueForCheckin)&&<div style={{fontSize:11,color:"var(--txt3)",textAlign:"center",marginBottom:6}}>{(selectedVenueForCheckin||sv).n}</div>}
          </div>
          <div className="md-body">
              {/* PHOTO UPLOAD */}
              <div style={{marginBottom:10}}>
                <label style={{display:"block",cursor:"pointer"}}>
                  <input type="file" accept="image/*" style={{display:"none"}}
                    onChange={e=>{
                      const file=e.target.files[0];
                      if(!file)return;
                      const reader=new FileReader();
                      reader.onload=ev=>setCheckinPhoto(ev.target.result);
                      reader.readAsDataURL(file);
                    }}/>
                  {checkinPhoto
                    ? <div style={{width:"100%",height:140,borderRadius:10,overflow:"hidden",position:"relative",border:"1px solid var(--grn2)"}}>
                        <img src={checkinPhoto} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        <div style={{position:"absolute",bottom:6,right:6,background:"rgba(0,0,0,.6)",borderRadius:6,padding:"2px 7px",fontSize:10,color:"#fff"}}>📷 нажми чтобы заменить</div>
                      </div>
                    : <div style={{width:"100%",height:100,borderRadius:10,background:"var(--bg3)",border:"2px dashed var(--border)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,color:"var(--txt3)",fontSize:12,transition:"all .2s"}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--gold)";e.currentTarget.style.color="var(--gold)"}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--txt3)"}}>
                        <span style={{fontSize:28}}>📷</span>
                        <span>Добавить фото блюда (необязательно)</span>
                      </div>
                  }
                </label>
              </div>

              <input className="minput" placeholder="Название блюда" value={dishName} onChange={e=>setDishName(e.target.value)}/>
              <div style={{display:"flex",gap:4,marginBottom:8,flexWrap:"wrap"}}>
                {["🫓 Пироги","🥩 Мясо","🥗 Салаты","☕ Напитки","🍺 Пиво"].map(t=>(
                  <button key={t} className={`chip ${dishName===t.split(" ").slice(1).join(" ")?"a":""}`}
                    onClick={()=>setDishName(t.split(" ").slice(1).join(" "))}>{t}</button>
                ))}
              </div>
              <div style={{textAlign:"center",fontSize:11,fontWeight:800,marginBottom:4,color:"var(--txt2)"}}>Оценка</div>
              <Stars v={cr} onChange={setCr}/>
              <input className="minput" placeholder="Цена в ₽" value={price} onChange={e=>setPrice(e.target.value)}/>
              <textarea className="minput" placeholder="Коротко о впечатлении..." value={reviewText} onChange={e=>setReviewText(e.target.value)} rows={2} style={{resize:"none"}}/>
              <button className="mbtn pri" disabled={cr===0} onClick={doCheckin}>✅ Сохранить чекин</button>
              <button className="mbtn sec" onClick={()=>{setSc(false);setCheckinPhoto(null);setDishName("");setReviewText("");setPrice("");}}>Отмена</button>

          </div>
        </div>
      </div>
    )}

    {/* QUICK VISIT MODAL */}
    {showVisitModal&&sv&&(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}}
        onClick={()=>{setShowVisitModal(false);setVisitNote("");setVisitRating(0)}}>
        <div style={{width:380,background:"var(--bg2)",borderRadius:16,overflow:"hidden",border:"1px solid var(--border)"}}
          onClick={e=>e.stopPropagation()}>
          <div style={{padding:"20px 20px 0",textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:6}}>{sv.i}</div>
            <div style={{fontFamily:"'Dela Gothic One'",fontSize:17,marginBottom:3,color:"var(--txt)"}}>{sv.n}</div>
            <div style={{fontSize:11,color:"var(--txt3)",marginBottom:16}}>📍 {sv.a}</div>
          </div>
          <div style={{padding:"0 20px 20px"}}>

            {/* HALF-STAR RATING */}
            <div style={{textAlign:"center",fontSize:11,fontWeight:800,color:"var(--txt2)",marginBottom:8}}>
              Оценка {visitRating>0?<span style={{color:"var(--gold)"}}>{visitRating} ★</span>:""}
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:2,marginBottom:16,position:"relative",height:36}}>
              {[1,2,3,4,5].map(i=>{
                const full=visitRating>=i;
                const half=!full&&visitRating>=i-0.5;
                return(
                  <div key={i} style={{position:"relative",width:36,height:36,cursor:"pointer"}}>
                    {/* left half */}
                    <div style={{position:"absolute",left:0,top:0,width:"50%",height:"100%",zIndex:2}}
                      onClick={()=>setVisitRating(i-0.5)}/>
                    {/* right half */}
                    <div style={{position:"absolute",right:0,top:0,width:"50%",height:"100%",zIndex:2}}
                      onClick={()=>setVisitRating(i)}/>
                    {/* star bg (empty) */}
                    <span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,color:"#252525"}}>★</span>
                    {/* star fill */}
                    {(full||half)&&<span style={{
                      position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:28,color:"var(--gold)",
                      clipPath:full?"none":"inset(0 50% 0 0)",
                      WebkitClipPath:full?"none":"inset(0 50% 0 0)",
                    }}>★</span>}
                  </div>
                );
              })}
            </div>

            <textarea
              style={{width:"100%",padding:"9px 11px",background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:10,color:"var(--txt)",fontFamily:"'Nunito'",fontSize:12,marginBottom:10,outline:"none",resize:"none"}}
              placeholder={"Заметка (необязательно)\nНапример: был с семьёй, приятная атмосфера..."}
              value={visitNote}
              onChange={e=>setVisitNote(e.target.value)}
              rows={3}
              onFocus={e=>e.target.style.borderColor="var(--grn2)"}
              onBlur={e=>e.target.style.borderColor="var(--border)"}
            />
            <button style={{width:"100%",padding:11,borderRadius:10,border:"none",background:"linear-gradient(90deg,var(--gold),var(--gold2))",color:"var(--bg)",fontFamily:"'Nunito'",fontWeight:800,fontSize:13,cursor:"pointer",marginBottom:6}}
              onClick={doQuickVisit}>✓ Отметить посещение</button>
            <button style={{width:"100%",padding:11,borderRadius:10,border:"none",background:"var(--bg3)",color:"var(--txt2)",fontFamily:"'Nunito'",fontWeight:800,fontSize:13,cursor:"pointer"}}
              onClick={()=>{setShowVisitModal(false);setVisitNote("");setVisitRating(0)}}>Отмена</button>
          </div>
        </div>
      </div>
    )}

    {/* MENU PHOTO MODAL */}
    {showMenuModal&&sv&&(()=>{
      const MENU_EMOJIS=["📄","📃","📜","🗒️","📋","🖼️","📷","🍽️","🥘","🍱"];
      const addMenuPhoto=(emoji)=>{
        const now=new Date();
        const photo={emoji,date:now.toLocaleDateString("ru-RU"),time:`${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`};
        const existing=menuPhotos[sv.id]||[];
        const updated={...menuPhotos,[sv.id]:[...existing,photo]};
        setMenuPhotos(updated);saveMenuPhotos(updated);
        setShowMenuModal(false);
      };
      return(
        <div className="mo" onClick={()=>setShowMenuModal(false)}>
          <div className="md" onClick={e=>e.stopPropagation()} {...swipeClose(()=>setShowMenuModal(false))}>
            <div className="md-head">
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <button onClick={()=>setShowMenuModal(false)} style={{background:"none",border:"none",color:"var(--txt2)",fontSize:20,cursor:"pointer",padding:"0 4px",lineHeight:1}}>‹</button>
                <div className="md-title" style={{marginBottom:0}}>📋 Меню заведения</div>
              </div>
              <div style={{fontSize:11,color:"var(--txt3)",marginBottom:6}}>{sv.n}</div>
            </div>
            <div className="md-body">
              <label style={{display:"block",cursor:"pointer",marginBottom:10}}>
                <input type="file" accept="image/*" multiple style={{display:"none"}}
                  onChange={async e=>{
                    const files=Array.from(e.target.files);
                    if(!files.length)return;
                    setMenuUploading(true);
                    const { uploaded:newPhotos, errors }=await menuPhotoService.uploadMenuPhotos({venueId:sv.id,userId:currentUser?.id,files});
                    errors.forEach(error=>alert(`Ошибка загрузки: ${error.message}`));
                    setMenuUploading(false);
                    if(newPhotos.length){
                      const existing=menuPhotos[sv.id]||[];
                      const updated={...menuPhotos,[sv.id]:[...existing,...newPhotos]};
                      setMenuPhotos(updated);
                      setShowMenuModal(false);
                      setSrType("menu");setSr(true);setTimeout(()=>setSr(false),2500);
                    }
                  }}/>
                <div style={{width:"100%",height:110,borderRadius:10,background:"var(--bg3)",border:`2px dashed ${menuUploading?"var(--gold)":"var(--border)"}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,color:menuUploading?"var(--gold)":"var(--txt3)",fontSize:12,transition:"all .2s"}}>
                  {menuUploading?(
                    <>
                      <div style={{width:28,height:28,border:"3px solid var(--gold)",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
                      <span>Загрузка...</span>
                    </>
                  ):(
                    <>
                      <span style={{fontSize:30}}>📷</span>
                      <span>Добавить фото (можно несколько)</span>
                    </>
                  )}
                </div>
              </label>
              {menuPhotos[sv.id]?.length>0&&<>
                <div style={{fontSize:11,fontWeight:800,color:"var(--txt2)",marginBottom:8}}>Добавлено {menuPhotos[sv.id].length} фото</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
                  {menuPhotos[sv.id].map((p,i)=>(
                    <div key={i} style={{width:90,height:90,borderRadius:8,overflow:"hidden",position:"relative",border:"1px solid var(--border)",cursor:"pointer"}}
                      onClick={()=>setPhotoViewer({photos:menuPhotos[sv.id],index:i})}>
                      <img src={p.src} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      <button onClick={async e=>{e.stopPropagation();await removeMenuPhoto(sv.id,i);}} style={{position:"absolute",top:3,right:3,width:18,height:18,borderRadius:"50%",background:"rgba(180,30,30,.85)",border:"none",color:"#fff",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                    </div>
                  ))}
                </div>
              </>}
              <button className="mbtn sec" onClick={()=>setShowMenuModal(false)}>Закрыть</button>
            </div>
          </div>
        </div>
      );
    })()}
    {/* LABEL MANAGER MODAL */}
    {showLabelManager&&(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}}
        onClick={()=>setShowLabelManager(false)}>
        <div style={{width:380,maxHeight:"80vh",background:"var(--bg2)",borderRadius:16,border:"1px solid var(--border)",display:"flex",flexDirection:"column",overflow:"hidden"}}
          onClick={e=>e.stopPropagation()} {...swipeClose(()=>setShowLabelManager(false))}>
          <div style={{padding:"16px 18px 12px",borderBottom:"1px solid var(--border)",fontFamily:"'Dela Gothic One'",fontSize:15}}>🏷️ Мои теги</div>
          <div style={{padding:"12px 18px",overflowY:"auto",flex:1}}>
            {customLabels.map(l=>(
              <div key={l.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid var(--border)"}}>
                <span style={{fontSize:18}}>{l.emoji}</span>
                <span style={{flex:1,fontWeight:700,fontSize:12,color:l.color}}>{l.name}</span>
                <button onClick={()=>{
                  const updated=customLabels.filter(x=>x.id!==l.id);
                  setCustomLabels(updated);saveCustomLabels(updated);
                  const vl={};Object.entries(venueLabels).forEach(([k,v])=>{vl[k]=v.filter(x=>x!==l.id);});
                  setVenueLabels(vl);saveVenueLabels(vl);
                }} style={{padding:"2px 8px",borderRadius:6,border:"1px solid rgba(200,50,50,.3)",background:"rgba(200,50,50,.08)",color:"#c05050",fontSize:10,cursor:"pointer",fontFamily:"'Nunito'",fontWeight:700}}>
                  удалить
                </button>
              </div>
            ))}
            {customLabels.length===0&&<div style={{textAlign:"center",padding:"20px 0",color:"var(--txt3)",fontSize:12}}>Пока нет тегов</div>}

            <div style={{marginTop:14,padding:"12px",background:"var(--bg3)",borderRadius:10,border:"1px solid var(--border)"}}>
              <div style={{fontSize:10,fontWeight:800,color:"var(--txt2)",marginBottom:8}}>Новый тег</div>
              <div style={{display:"flex",gap:7,marginBottom:8}}>
                <input value={newLabelEmoji} onChange={e=>setNewLabelEmoji(e.target.value)}
                  style={{width:44,padding:"7px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:8,color:"var(--txt)",fontFamily:"'Nunito'",fontSize:16,textAlign:"center",outline:"none"}}/>
                <input value={newLabelName} onChange={e=>setNewLabelName(e.target.value)}
                  placeholder="Название тега..."
                  style={{flex:1,padding:"7px 10px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:8,color:"var(--txt)",fontFamily:"'Nunito'",fontSize:12,outline:"none"}}/>
              </div>
              <div style={{display:"flex",gap:6,marginBottom:10}}>
                {["#e8a838","#5a9c35","#4a8fd4","#d45a9c","#d4845a","#9c5ad4","#5ad4c8"].map(c=>(
                  <div key={c} onClick={()=>setNewLabelColor(c)}
                    style={{width:22,height:22,borderRadius:"50%",background:c,cursor:"pointer",border:newLabelColor===c?"3px solid #fff":"2px solid transparent",boxSizing:"border-box"}}/>
                ))}
              </div>
              <button disabled={!newLabelName.trim()}
                style={{width:"100%",padding:9,borderRadius:9,border:"none",background:"linear-gradient(90deg,var(--gold),var(--gold2))",color:"var(--bg)",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer",opacity:!newLabelName.trim()?0.5:1}}
                onClick={()=>{
                  const label={id:`lbl_${Date.now()}`,name:newLabelName.trim(),emoji:newLabelEmoji,color:newLabelColor};
                  const updated=[...customLabels,label];
                  setCustomLabels(updated);saveCustomLabels(updated);
                  setNewLabelName("");setNewLabelEmoji("⭐");setNewLabelColor("#e8a838");
                }}>+ Создать тег</button>
            </div>
          </div>
          <div style={{padding:"10px 18px",borderTop:"1px solid var(--border)"}}>
            <button style={{width:"100%",padding:10,borderRadius:9,border:"none",background:"var(--bg3)",color:"var(--txt2)",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer"}}
              onClick={()=>setShowLabelManager(false)}>Закрыть</button>
          </div>
        </div>
      </div>
    )}

    {adminEditVenue&&(
      <AdminVenueEditorModal
        venue={adminEditVenue}
        saving={adminVenueSaving}
        onChange={(patch)=>setAdminEditVenue(venue=>({...venue,...patch}))}
        onSave={saveAdminVenue}
        onClose={()=>setAdminEditVenue(null)}
      />
    )}

    {/* ADD VENUE MODAL */}
    {showAddVenue&&(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}}
        onClick={()=>setShowAddVenue(false)}>
        <div style={{width:400,maxHeight:"88vh",background:"var(--bg2)",borderRadius:16,border:"1px solid var(--border)",display:"flex",flexDirection:"column",overflow:"hidden",color:"var(--txt)"}}
          onClick={e=>e.stopPropagation()}>
          <div style={{padding:"16px 18px 0",textAlign:"center",flexShrink:0}}>
            <div style={{fontFamily:"'Dela Gothic One'",fontSize:16,marginBottom:12}}>📍 Новое заведение</div>
          </div>
          <div style={{padding:"0 18px 18px",overflowY:"auto",flex:1}}>

            {/* FIELDS */}
            {[
              {k:"n",label:"Название *",ph:"Например: Новое место"},
              {k:"a",label:"Адрес",ph:"ул. Коста, 10"},
              {k:"s",label:"Кухня / описание",ph:"Итальянская, гриль..."},
              {k:"r",label:"Рейтинг (0–5)",ph:"4.5"},
              {k:"ig",label:"Instagram",ph:"bez @, например: cuprum_restaurant"},
            ].map(f=>(
              <div key={f.k} style={{marginBottom:8}}>
                <div style={{fontSize:10,fontWeight:800,color:"var(--txt2)",marginBottom:3}}>{f.label}</div>
                <input value={newV[f.k]} onChange={e=>setNewV(p=>({...p,[f.k]:e.target.value}))}
                  placeholder={f.ph}
                  style={{width:"100%",padding:"8px 10px",background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:8,color:"var(--txt)",fontFamily:"'Nunito'",fontSize:12,outline:"none"}}/>
              </div>
            ))}

            <div style={{fontSize:10,fontWeight:800,color:"var(--txt2)",marginBottom:4}}>Категория</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:12}}>
              {["Ресторан","Кафе","Бар","Пиццерия","Хинкальная","Бургерная","Фастфуд","Гриль-бар","Суши-бар"].map(cat=>(
                <button key={cat} onClick={()=>setNewV(p=>({...p,c:cat}))}
                  style={{padding:"4px 9px",borderRadius:12,border:`1.5px solid ${newV.c===cat?"var(--grn2)":"var(--border)"}`,background:newV.c===cat?"var(--grn)":"transparent",color:newV.c===cat?"#fff":"var(--txt2)",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito'"}}>
                  {cat}
                </button>
              ))}
            </div>

            {/* GEO */}
            <div style={{fontSize:10,fontWeight:800,color:"var(--txt2)",marginBottom:6}}>Местоположение *</div>

            {/* Place on map button */}
            <button
              style={{width:"100%",padding:"12px",borderRadius:9,border:`2px dashed ${newV.lat?"var(--grn2)":"var(--border)"}`,background:newV.lat?"rgba(90,156,53,.1)":"transparent",color:newV.lat?"var(--grn3)":"var(--txt2)",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer",marginBottom:8,transition:"all .2s"}}
              onClick={()=>{
                setShowAddVenue(false);
                placingMarkerRef.current=true;
                setPlacingMarker(true);
                if(mapInst.current)mapInst.current.getContainer().style.cursor="crosshair";
              }}>
              {newV.lat?"📍 Метка установлена — изменить на карте":"🗺️ Отметить на карте"}
            </button>
            {newV.lat&&<div style={{fontSize:9,color:"var(--txt3)",textAlign:"center",marginBottom:10}}>можно перетащить оранжевый маркер на карте</div>}
            <div style={{fontSize:9,color:"var(--txt3)",textAlign:"center",marginBottom:8}}>
              Модерация: {LIMITS.VENUE_SUBMISSIONS_PER_DAY} в день · личная карта: {customVenueCount}/{LIMITS.CUSTOM_VENUES_TOTAL}
            </div>

            <button
              disabled={venueSubmitting}
              style={{width:"100%",padding:11,borderRadius:10,border:"none",background:"linear-gradient(90deg,var(--gold),var(--gold2))",color:"var(--bg)",fontFamily:"'Nunito'",fontWeight:800,fontSize:13,cursor:"pointer",marginBottom:7,opacity:(!newV.n||!newV.lat||venueSubmitting)?0.5:1}}
              onClick={async()=>{
                if(!newV.n){alert("Введи название заведения");return;}
                if(!newV.lat){alert("Поставь метку на карте");return;}
                const CAT_ICON={Ресторан:"🏛️",Кафе:"☕",Бар:"🍺",Пиццерия:"🍕",Хинкальная:"🥟",Бургерная:"🍔",Фастфуд:"🌯","Гриль-бар":"🥩","Суши-бар":"🍣"};
                const venue={
                  n:newV.n,c:newV.c,s:newV.s,a:newV.a,
                  i:CAT_ICON[newV.c]||"📍",
                  r:parseFloat(newV.r)||0,rc:0,
                  ig:newV.ig.trim().replace(/^@/,""),
                  lat:parseFloat(newV.lat),lng:parseFloat(newV.lng),
                };
                setVenueSubmitting(true);
                try{
                  await venueSubmissionService.submitVenue(currentUser.id,venue);
                  alert("Заявка отправлена на модерацию");
                  if(tempMarkerRef.current){tempMarkerRef.current.remove();tempMarkerRef.current=null;}
                  setNewV({n:"",a:"",c:"Ресторан",s:"",r:"",ig:"",lat:"",lng:""});
                  setShowAddVenue(false);
                  if(mapInst.current)mapInst.current.getContainer().style.cursor="";
                }catch(e){
                  console.error(e);
                  if(e?.code===LIMIT_ERROR_CODES.VENUE_SUBMISSIONS_PER_DAY){
                    alert(`Сегодня уже отправлено ${LIMITS.VENUE_SUBMISSIONS_PER_DAY} заявки на модерацию. Попробуй завтра.`);
                    return;
                  }
                  alert(`Не удалось отправить заявку: ${e?.message || "неизвестная ошибка"}`);
                }finally{
                  setVenueSubmitting(false);
                }
              }}>
              {venueSubmitting?"Отправляем...":"✓ Отправить на модерацию"}
            </button>
            <button
              disabled={venueSubmitting||customVenueCount>=LIMITS.CUSTOM_VENUES_TOTAL}
              style={{width:"100%",padding:11,borderRadius:10,border:"1.5px solid var(--border)",background:"rgba(90,156,53,.08)",color:"var(--grn3)",fontFamily:"'Nunito'",fontWeight:800,fontSize:13,cursor:"pointer",marginBottom:7,opacity:(!newV.n||!newV.lat||venueSubmitting||customVenueCount>=LIMITS.CUSTOM_VENUES_TOTAL)?0.5:1}}
              onClick={async()=>{
                if(!newV.n){alert("Введи название заведения");return;}
                if(!newV.lat){alert("Поставь метку на карте");return;}
                if(customVenueCount>=LIMITS.CUSTOM_VENUES_TOTAL){alert(`В личной карте лимит ${LIMITS.CUSTOM_VENUES_TOTAL} заведений. Удали старое личное место, чтобы добавить новое.`);return;}
                const CAT_ICON={Ресторан:"🏛️",Кафе:"☕",Бар:"🍺",Пиццерия:"🍕",Хинкальная:"🥟",Бургерная:"🍔",Фастфуд:"🌯","Гриль-бар":"🥩","Суши-бар":"🍣"};
                const venue={
                  id:`custom_${Date.now()}`,
                  n:newV.n,c:newV.c,s:newV.s,a:newV.a,
                  i:CAT_ICON[newV.c]||"📍",
                  r:parseFloat(newV.r)||0,rc:0,
                  ig:newV.ig.trim().replace(/^@/,""),
                  lat:parseFloat(newV.lat),lng:parseFloat(newV.lng),
                  custom:true,
                };
                const updated=[...customVenues,venue];
                setVenueSubmitting(true);
                try{
                  await saveCustomVenues(updated);
                  setCustomVenues(updated);
                  if(tempMarkerRef.current){tempMarkerRef.current.remove();tempMarkerRef.current=null;}
                  setNewV({n:"",a:"",c:"Ресторан",s:"",r:"",ig:"",lat:"",lng:""});
                  setShowAddVenue(false);
                  if(mapInst.current){
                    mapInst.current.getContainer().style.cursor="";
                    mapInst.current.flyTo([venue.lat,venue.lng],16,{duration:.8});
                  }
                }catch(e){
                  console.error(e);
                  if(e?.code===LIMIT_ERROR_CODES.CUSTOM_VENUES_TOTAL){
                    alert(`В личной карте лимит ${LIMITS.CUSTOM_VENUES_TOTAL} заведений. Удали старое личное место, чтобы добавить новое.`);
                    return;
                  }
                  alert(`Не удалось добавить в личную карту: ${e?.message || "неизвестная ошибка"}`);
                }finally{
                  setVenueSubmitting(false);
                }
              }}>
              {customVenueCount>=LIMITS.CUSTOM_VENUES_TOTAL?`Личная карта заполнена (${LIMITS.CUSTOM_VENUES_TOTAL})`:"+ Добавить в личную карту"}
            </button>
            <button style={{width:"100%",padding:11,borderRadius:10,border:"none",background:"var(--bg3)",color:"var(--txt2)",fontFamily:"'Nunito'",fontWeight:800,fontSize:13,cursor:"pointer"}}
              onClick={()=>{
                setShowAddVenue(false);
                if(tempMarkerRef.current){tempMarkerRef.current.remove();tempMarkerRef.current=null;}
                if(mapInst.current)mapInst.current.getContainer().style.cursor="";
                setNewV({n:"",a:"",c:"Ресторан",s:"",r:"",ig:"",lat:"",lng:""});
              }}>Отмена</button>
          </div>
        </div>
      </div>
    )}

    {/* PHOTO VIEWER */}
    {photoViewer&&(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.96)",zIndex:3000,display:"flex",flexDirection:"column"}}
        onClick={()=>setPhotoViewer(null)}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",flexShrink:0}}>
          <span style={{color:"#999",fontSize:12}}>{photoViewer.index+1} / {photoViewer.photos.length}</span>
          <button onClick={()=>setPhotoViewer(null)} style={{background:"none",border:"none",color:"#fff",fontSize:24,cursor:"pointer",padding:"4px 8px"}}>✕</button>
        </div>
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}
          onClick={e=>e.stopPropagation()}
          onTouchStart={e=>{e.currentTarget._sx=e.touches[0].clientX;}}
          onTouchEnd={e=>{
            const dx=e.changedTouches[0].clientX-e.currentTarget._sx;
            if(Math.abs(dx)>50){
              setPhotoViewer(v=>({...v,index:dx<0?(v.index+1)%v.photos.length:(v.index-1+v.photos.length)%v.photos.length}));
            }
          }}>
          <img src={photoViewer.photos[photoViewer.index].src} alt=""
            style={{maxWidth:"100%",maxHeight:"100%",objectFit:"contain"}}/>
          {photoViewer.photos.length>1&&<>
            <button onClick={()=>setPhotoViewer(v=>({...v,index:(v.index-1+v.photos.length)%v.photos.length}))}
              style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,.15)",border:"none",color:"#fff",fontSize:24,width:44,height:44,borderRadius:"50%",cursor:"pointer"}}>‹</button>
            <button onClick={()=>setPhotoViewer(v=>({...v,index:(v.index+1)%v.photos.length}))}
              style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,.15)",border:"none",color:"#fff",fontSize:24,width:44,height:44,borderRadius:"50%",cursor:"pointer"}}>›</button>
          </>}
        </div>
        <div style={{display:"flex",gap:8,padding:"12px 16px 20px",overflowX:"auto",flexShrink:0,alignItems:"center"}}
          onClick={e=>e.stopPropagation()}>
          {photoViewer.photos.map((p,i)=>(
            <div key={i} onClick={()=>setPhotoViewer(v=>({...v,index:i}))}
              style={{width:i===photoViewer.index?72:58,height:i===photoViewer.index?72:58,borderRadius:8,overflow:"hidden",flexShrink:0,opacity:i===photoViewer.index?1:.5,border:i===photoViewer.index?"2px solid #fff":"2px solid transparent",cursor:"pointer",transition:"all .2s"}}>
              <img src={p.src} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* USER PROFILE VIEWER - inline in sidebar, not modal */}

    {/* MAP PLACEMENT HINT */}
    {placingMarker&&(
      <div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",zIndex:2000,background:"rgba(232,168,56,.95)",color:"#1a1a0a",padding:"10px 20px",borderRadius:30,fontFamily:"'Nunito'",fontWeight:800,fontSize:13,pointerEvents:"none",boxShadow:"0 4px 16px rgba(0,0,0,.4)"}}>
        📍 Нажми на карту чтобы поставить метку
      </div>
    )}

  </>);}

function VenuePersonalTagsEditor({ venueId, labels, venueLabels, onToggle, onManage }){
  const selectedIds=venueLabels[String(venueId)]||[];

  return(
    <div style={{padding:"0 14px 10px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:6}}>
        <div style={{fontSize:10,fontWeight:800,color:"var(--txt3)",textTransform:"uppercase",letterSpacing:".5px"}}>🏷️ Мои теги</div>
        <button onClick={onManage}
          style={{padding:"3px 8px",borderRadius:7,border:"1px solid var(--border)",background:"var(--bg3)",color:"var(--txt3)",fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito'"}}>
          настроить
        </button>
      </div>
      {labels.length>0?(
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {labels.map(label=>{
            const has=selectedIds.includes(label.id);
            return(
              <button key={label.id}
                style={{padding:"4px 10px",borderRadius:12,border:`1.5px solid ${has?label.color:"var(--border)"}`,background:has?`${label.color}22`:"transparent",color:has?label.color:"var(--txt3)",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito'",transition:"all .15s"}}
                onClick={()=>onToggle(venueId,label.id)}>
                {label.emoji} {label.name}
              </button>
            );
          })}
        </div>
      ):(
        <button onClick={onManage}
          style={{width:"100%",padding:9,borderRadius:10,border:"1.5px dashed var(--border)",background:"transparent",color:"var(--txt3)",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer"}}>
          + Создать личный тег
        </button>
      )}
    </div>
  );
}

function AdminVenueEditorModal({ venue, saving, onChange, onSave, onClose }){
  const inputStyle={width:"100%",padding:"8px 10px",background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:8,color:"var(--txt)",fontFamily:"'Nunito'",fontSize:12,outline:"none"};
  const suggestedTags=getSuggestedVenueTags(venue.c);
  const updateTags=(nextValue)=>onChange({s:nextValue});
  const tagButtonStyle=(selected)=>({
    padding:"4px 9px",
    borderRadius:12,
    border:`1.5px solid ${selected?"var(--gold)":"var(--border)"}`,
    background:selected?"rgba(232,168,56,.16)":"transparent",
    color:selected?"var(--gold)":"var(--txt2)",
    fontSize:10,
    fontWeight:800,
    cursor:"pointer",
    fontFamily:"'Nunito'",
  });

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:2200,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}}
      onClick={()=>!saving&&onClose()}>
      <div style={{width:420,maxHeight:"88vh",background:"var(--bg2)",borderRadius:16,border:"1px solid var(--border)",display:"flex",flexDirection:"column",overflow:"hidden",color:"var(--txt)"}}
        onClick={e=>e.stopPropagation()}>
        <div style={{padding:"16px 18px 0",textAlign:"center",flexShrink:0}}>
          <div style={{fontFamily:"'Dela Gothic One'",fontSize:16,marginBottom:12}}>✎ Редактировать заведение</div>
        </div>
        <div style={{padding:"0 18px 18px",overflowY:"auto",flex:1}}>
          {[
            {k:"n",label:"Название *",ph:"Название заведения"},
            {k:"a",label:"Адрес",ph:"ул. Коста, 10"},
          ].map(field=>(
            <div key={field.k} style={{marginBottom:8}}>
              <div style={{fontSize:10,fontWeight:800,color:"var(--txt2)",marginBottom:3}}>{field.label}</div>
              <input value={venue[field.k]} onChange={e=>onChange({[field.k]:e.target.value})}
                placeholder={field.ph}
                style={inputStyle}/>
            </div>
          ))}

          <div style={{fontSize:10,fontWeight:800,color:"var(--txt2)",marginBottom:4}}>Категория *</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:12}}>
            {BASE_VENUE_CATEGORIES.map(category=>(
              <button key={category.k} onClick={()=>onChange({c:category.k})}
                style={{padding:"4px 9px",borderRadius:12,border:`1.5px solid ${venue.c===category.k?"var(--grn2)":"var(--border)"}`,background:venue.c===category.k?"var(--grn)":"transparent",color:venue.c===category.k?"#fff":"var(--txt2)",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito'"}}>
                {category.l}
              </button>
            ))}
          </div>

          <div style={{marginBottom:8}}>
            <div style={{fontSize:10,fontWeight:800,color:"var(--txt2)",marginBottom:3}}>Своя категория</div>
            <input value={venue.c} onChange={e=>onChange({c:e.target.value})}
              placeholder="Кофейня, винный бар, десерты..."
              style={inputStyle}/>
          </div>

          <div style={{marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:6}}>
              <div style={{fontSize:10,fontWeight:800,color:"var(--txt2)"}}>Теги / кухня</div>
              <div style={{display:"flex",gap:5}}>
                <button
                  disabled={!suggestedTags.length}
                  onClick={()=>updateTags(mergeVenueTags(venue.s,suggestedTags))}
                  style={{padding:"3px 8px",borderRadius:7,border:"1px solid rgba(232,168,56,.35)",background:"rgba(232,168,56,.08)",color:"var(--gold)",fontSize:9,fontWeight:800,cursor:suggestedTags.length?"pointer":"default",fontFamily:"'Nunito'",opacity:suggestedTags.length?1:.45}}>
                  заполнить
                </button>
                <button
                  onClick={()=>updateTags("")}
                  style={{padding:"3px 8px",borderRadius:7,border:"1px solid var(--border)",background:"var(--bg3)",color:"var(--txt3)",fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito'"}}>
                  очистить
                </button>
              </div>
            </div>

            {suggestedTags.length>0&&(
              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
                {suggestedTags.map(tag=>(
                  <button key={tag} onClick={()=>updateTags(toggleVenueTag(venue.s,tag))}
                    style={tagButtonStyle(hasVenueTag(venue.s,tag))}>
                    {hasVenueTag(venue.s,tag)?"✓ ":"+ "}{tag}
                  </button>
                ))}
              </div>
            )}

            {VENUE_TAG_GROUPS.map(group=>(
              <div key={group.title} style={{marginBottom:7}}>
                <div style={{fontSize:9,fontWeight:800,color:"var(--txt3)",marginBottom:4,textTransform:"uppercase"}}>{group.title}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {group.tags.map(tag=>(
                    <button key={tag} onClick={()=>updateTags(toggleVenueTag(venue.s,tag))}
                      style={tagButtonStyle(hasVenueTag(venue.s,tag))}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <input value={venue.s} onChange={e=>onChange({s:e.target.value})}
              placeholder="Можно поправить вручную: осетинская, завтраки, вид"
              style={inputStyle}/>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"64px 1fr 86px",gap:8,marginBottom:8}}>
            <div>
              <div style={{fontSize:10,fontWeight:800,color:"var(--txt2)",marginBottom:3}}>Иконка</div>
              <input value={venue.i} onChange={e=>onChange({i:e.target.value})}
                style={{...inputStyle,textAlign:"center",fontSize:16,padding:"7px 8px"}}/>
            </div>
            <div>
              <div style={{fontSize:10,fontWeight:800,color:"var(--txt2)",marginBottom:3}}>Instagram</div>
              <input value={venue.ig} onChange={e=>onChange({ig:e.target.value})}
                placeholder="bez @"
                style={inputStyle}/>
            </div>
            <div>
              <div style={{fontSize:10,fontWeight:800,color:"var(--txt2)",marginBottom:3}}>Рейтинг</div>
              <input value={venue.r} onChange={e=>onChange({r:e.target.value})}
                inputMode="decimal"
                style={inputStyle}/>
            </div>
          </div>

          <div style={{display:"flex",gap:8,marginTop:12}}>
            <button disabled={saving}
              style={{flex:1,padding:11,borderRadius:10,border:"none",background:"linear-gradient(90deg,var(--gold),var(--gold2))",color:"var(--bg)",fontFamily:"'Nunito'",fontWeight:800,fontSize:13,cursor:"pointer",opacity:saving?0.5:1}}
              onClick={onSave}>
              {saving?"Сохраняем...":"✓ Сохранить"}
            </button>
            <button disabled={saving}
              style={{flex:1,padding:11,borderRadius:10,border:"none",background:"var(--bg3)",color:"var(--txt2)",fontFamily:"'Nunito'",fontWeight:800,fontSize:13,cursor:"pointer",opacity:saving?0.5:1}}
              onClick={onClose}>
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminPanel({ catalogVenues, adminUserId, onCatalogVenueCreated }){
  const[adminTab,setAdminTab]=useState("users");
  const[users,setUsers]=useState([]);
  const[allCheckins,setAllCheckins]=useState([]);
  const[pendingMenus,setPendingMenus]=useState([]);
  const[pendingVenueSubmissions,setPendingVenueSubmissions]=useState([]);
  const[loading,setLoading]=useState(false);

  useEffect(()=>{
    loadData();
  },[adminTab]);

  const loadData=async()=>{
    setLoading(true);
    if(adminTab==="users"){
      setUsers(await profileService.listProfiles());
    }
    if(adminTab==="checkins"){
      setAllCheckins(await adminService.listLegacyCheckins());
    }
    if(adminTab==="menu"){
      setPendingMenus(await menuPhotoService.listPendingMenuPhotos());
    }
    if(adminTab==="venues"){
      setPendingVenueSubmissions(await venueSubmissionService.listPendingSubmissions());
    }
    setLoading(false);
  };

  const approveMenu=async(photo)=>{
    await menuPhotoService.approveMenuPhoto(photo.id);
    setPendingMenus(p=>p.filter(m=>m.id!==photo.id));
  };

  const rejectMenu=async(photo)=>{
    await menuPhotoService.rejectMenuPhoto(photo);
    setPendingMenus(p=>p.filter(m=>m.id!==photo.id));
  };

  const approveVenueSubmission=async(submission)=>{
    const venue=await venueSubmissionService.approveSubmission(submission,adminUserId);
    onCatalogVenueCreated?.(venue);
    setPendingVenueSubmissions(p=>p.filter(s=>s.id!==submission.id));
  };

  const rejectVenueSubmission=async(submission)=>{
    await venueSubmissionService.rejectSubmission(submission.id,adminUserId);
    setPendingVenueSubmissions(p=>p.filter(s=>s.id!==submission.id));
  };

  const deleteCheckin=async(checkin)=>{
    const deleted=await adminService.deleteLegacyCheckin(checkin);
    if(!deleted)return;
    setAllCheckins(p=>p.filter(c=>!(c.id===checkin.id&&c.uid===checkin.uid)));
  };

  const banUser=async(userId)=>{
    if(!confirm("Удалить пользователя?"))return;
    await profileService.deleteProfile(userId);
    setUsers(p=>p.filter(u=>u.id!==userId));
  };

  return(
    <div style={{marginTop:16}}>
      <div className="sec-hdr" style={{color:"#e8a838"}}>⚙️ Панель администратора</div>
      <div style={{display:"flex",gap:0,margin:"8px 14px",background:"var(--bg3)",borderRadius:10,padding:3}}>
        {[["users","👥 Пользователи"],["checkins","📸 Чекины"],["menu","🍽️ Меню"],["venues","📍 Заявки"]].map(([k,l])=>(
          <button key={k} onClick={()=>setAdminTab(k)}
            style={{flex:1,padding:"6px",borderRadius:8,border:"none",background:adminTab===k?"var(--grn)":"transparent",color:adminTab===k?"#fff":"var(--txt3)",fontFamily:"'Nunito'",fontWeight:800,fontSize:11,cursor:"pointer"}}>
            {l}
          </button>
        ))}
      </div>

      {loading&&<div style={{textAlign:"center",padding:20,color:"var(--txt3)",fontSize:12}}>Загрузка...</div>}

      {!loading&&adminTab==="users"&&(
        <div style={{padding:"0 14px"}}>
          {users.map(u=>(
            <div key={u.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:"var(--grn)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Dela Gothic One'",fontSize:14,color:"#fff",flexShrink:0}}>
                {(u.username||"?")[0].toUpperCase()}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:800,color:"var(--txt)"}}>{u.username||"—"}</div>
                <div style={{fontSize:10,color:"var(--txt3)"}}>{u.role} · {new Date(u.created_at).toLocaleDateString("ru-RU")}</div>
              </div>
              {u.role!=="admin"&&(
                <button onClick={()=>banUser(u.id)}
                  style={{padding:"3px 8px",borderRadius:6,border:"1px solid rgba(200,50,50,.4)",background:"rgba(200,50,50,.08)",color:"#c05050",fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito'"}}>
                  удалить
                </button>
              )}
            </div>
          ))}
          {users.length===0&&<div style={{textAlign:"center",padding:16,color:"var(--txt3)",fontSize:12}}>Нет пользователей</div>}
        </div>
      )}

      {!loading&&adminTab==="checkins"&&(
        <div style={{padding:"0 14px"}}>
          {allCheckins.map((c,i)=>(
            <div key={i} style={{padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:800,color:"var(--txt)"}}>{c.venueName}</div>
                  <div style={{fontSize:10,color:"var(--txt3)"}}>@uid:{c.uid.slice(0,8)}… · {c.date}</div>
                  {c.dish&&<div style={{fontSize:10,color:"var(--txt2)"}}>{c.dish}</div>}
                  {c.review&&<div style={{fontSize:10,color:"var(--txt3)",fontStyle:"italic"}}>«{c.review.slice(0,60)}»</div>}
                  {c.photoUrl&&<img src={c.photoUrl} alt="" style={{width:"100%",height:80,objectFit:"cover",borderRadius:6,marginTop:4}}/>}
                </div>
                <button onClick={()=>deleteCheckin(c)}
                  style={{flexShrink:0,padding:"3px 8px",borderRadius:6,border:"1px solid rgba(200,50,50,.4)",background:"rgba(200,50,50,.08)",color:"#c05050",fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito'"}}>
                  удалить
                </button>
              </div>
            </div>
          ))}
          {allCheckins.length===0&&<div style={{textAlign:"center",padding:16,color:"var(--txt3)",fontSize:12}}>Нет чекинов</div>}
        </div>
      )}

      {!loading&&adminTab==="menu"&&(
        <div style={{padding:"0 14px"}}>
          {pendingMenus.length===0&&<div style={{textAlign:"center",padding:24,color:"var(--txt3)",fontSize:12}}>Нет фото на проверке 🎉</div>}
          {pendingMenus.map(photo=>(
            <div key={photo.id} style={{padding:"12px 0",borderBottom:"1px solid var(--border)"}}>
              <div style={{fontSize:11,color:"var(--txt3)",marginBottom:6}}>
                Заведение: <span style={{color:"var(--txt)",fontWeight:800}}>{(()=>{const v=catalogVenues.find(v=>v.id===photo.venue_id);return v?v.n:`ID ${photo.venue_id}`;})()}</span> · {new Date(photo.created_at).toLocaleDateString("ru-RU")}
              </div>
              <img src={photo.photo_url} alt="" style={{width:"100%",borderRadius:8,marginBottom:8,maxHeight:300,objectFit:"contain",background:"var(--bg3)"}}/>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>approveMenu(photo)}
                  style={{flex:1,padding:8,borderRadius:8,border:"none",background:"var(--grn)",color:"#fff",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer"}}>
                  ✓ Одобрить
                </button>
                <button onClick={()=>rejectMenu(photo)}
                  style={{flex:1,padding:8,borderRadius:8,border:"1px solid rgba(200,50,50,.4)",background:"rgba(200,50,50,.08)",color:"#c05050",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer"}}>
                  ✗ Отклонить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading&&adminTab==="venues"&&(
        <div style={{padding:"0 14px"}}>
          {pendingVenueSubmissions.length===0&&<div style={{textAlign:"center",padding:24,color:"var(--txt3)",fontSize:12}}>Нет заявок на заведения</div>}
          {pendingVenueSubmissions.map(submission=>(
            <div key={submission.id} style={{padding:"12px 0",borderBottom:"1px solid var(--border)"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:8}}>
                <div style={{width:34,height:34,borderRadius:10,background:"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{submission.icon||"📍"}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:900,color:"var(--txt)"}}>{submission.name}</div>
                  <div style={{fontSize:10,color:"var(--txt3)"}}>
                    {submission.category}{submission.subcategory?` · ${submission.subcategory}`:""} · uid:{submission.user_id?.slice(0,8)}…
                  </div>
                  {submission.address&&<div style={{fontSize:10,color:"var(--txt2)",marginTop:2}}>{submission.address}</div>}
                  {submission.instagram&&<div style={{fontSize:10,color:"var(--txt2)",marginTop:2}}>Instagram: @{submission.instagram}</div>}
                  <div style={{fontSize:10,color:"var(--txt3)",marginTop:2}}>
                    {Number(submission.lat).toFixed(5)}, {Number(submission.lng).toFixed(5)}
                    {submission.rating>0?` · ★ ${submission.rating}`:""}
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>approveVenueSubmission(submission)}
                  style={{flex:1,padding:8,borderRadius:8,border:"none",background:"var(--grn)",color:"#fff",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer"}}>
                  ✓ Одобрить
                </button>
                <button onClick={()=>rejectVenueSubmission(submission)}
                  style={{flex:1,padding:8,borderRadius:8,border:"1px solid rgba(200,50,50,.4)",background:"rgba(200,50,50,.08)",color:"#c05050",fontFamily:"'Nunito'",fontWeight:800,fontSize:12,cursor:"pointer"}}>
                  × Отклонить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TopUsers({currentUserId,onViewProfile}){
  const[users,setUsers]=useState([]);
  const[loading,setLoading]=useState(true);
  const[favorites,setFavorites]=useState([]);

  useEffect(()=>{
    const load=async()=>{
      setUsers(await profileService.listRankedProfiles());

      if(currentUserId){
        setFavorites(await favoriteService.listFavoriteUserIds(currentUserId));
      }
      setLoading(false);
    };
    load();
  },[currentUserId]);

  const toggleFavorite=async(userId)=>{
    if(!currentUserId||userId===currentUserId)return;
    if(favorites.includes(userId)){
      await favoriteService.removeFavorite(currentUserId,userId);
      setFavorites(f=>f.filter(id=>id!==userId));
    } else {
      await favoriteService.addFavorite(currentUserId,userId);
      setFavorites(f=>[...f,userId]);
    }
  };

  if(loading)return<div style={{textAlign:"center",padding:32,color:"var(--txt3)",fontSize:12}}>Загрузка...</div>;

  return(
    <div>
      <div className="sec-hdr">🏆 Топ исследователей</div>
      {users.map((u,i)=>(
        <div key={u.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:"1px solid var(--border)",cursor:"pointer"}}
          onClick={()=>onViewProfile({userId:u.id,username:u.username})}>
          <div style={{width:28,height:28,borderRadius:"50%",background:i===0?"#e8a838":i===1?"#9a9480":i===2?"#8b6914":"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Dela Gothic One'",fontSize:12,color:i<3?"#090c08":"var(--txt3)",flexShrink:0}}>
            {i+1}
          </div>
          <div style={{width:36,height:36,borderRadius:"50%",background:"var(--grn)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Dela Gothic One'",fontSize:16,color:"#fff",flexShrink:0}}>
            {(u.username||"?")[0].toUpperCase()}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:800,color:"var(--txt)"}}>@{u.username||"—"}</div>
            <div style={{fontSize:10,color:"var(--txt3)"}}>{u.count} чекинов</div>
          </div>
          {currentUserId&&u.id!==currentUserId&&(
            <button onClick={e=>{e.stopPropagation();toggleFavorite(u.id);}}
              style={{padding:"4px 10px",borderRadius:8,border:`1px solid ${favorites.includes(u.id)?"var(--gold)":"var(--border)"}`,background:favorites.includes(u.id)?"rgba(232,168,56,.15)":"none",color:favorites.includes(u.id)?"var(--gold)":"var(--txt3)",fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito'",flexShrink:0}}>
              {favorites.includes(u.id)?"★ Избранное":"☆ В избранное"}
            </button>
          )}
        </div>
      ))}
      {users.length===0&&<div style={{textAlign:"center",padding:24,color:"var(--txt3)",fontSize:12}}>Пока нет пользователей</div>}
    </div>
  );
}

function UserCheckins({userId,username}){
  const[checkins,setCheckins]=useState([]);
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    checkinService.listUserCheckinRows(userId)
      .then(data=>{setCheckins(data);setLoading(false);});
  },[userId]);

  if(loading)return<div style={{textAlign:"center",padding:24,color:"var(--txt3)",fontSize:12}}>Загрузка...</div>;

  return(
    <div style={{overflowY:"auto",flex:1}}>
      <div style={{padding:"8px 14px 4px",fontSize:11,color:"var(--txt3)"}}>
        {checkins.length} чекинов
      </div>
      {checkins.map((c,i)=>(
        <div key={i} style={{padding:"10px 14px",borderBottom:"1px solid var(--border)"}}>
          {c.photo_url&&<img src={c.photo_url} alt="" style={{width:"100%",height:140,objectFit:"cover",borderRadius:8,marginBottom:8}}/>}
          <div style={{fontWeight:800,fontSize:13,color:"var(--txt)"}}>{c.venue_name}</div>
          <div style={{display:"flex",gap:8,alignItems:"center",marginTop:3}}>
            {c.rating>0&&<span style={{color:"var(--gold)",fontSize:11}}>★ {c.rating}</span>}
            {c.dish&&<span style={{fontSize:10,color:"var(--txt2)"}}>{c.dish}</span>}
            <span style={{fontSize:10,color:"var(--txt3)"}}>{c.date}</span>
          </div>
          {c.review&&<div style={{fontSize:11,color:"var(--txt2)",marginTop:4,fontStyle:"italic"}}>«{c.review}»</div>}
        </div>
      ))}
      {checkins.length===0&&<div style={{textAlign:"center",padding:24,color:"var(--txt3)",fontSize:12}}>Нет чекинов</div>}
    </div>
  );
}
