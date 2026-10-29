/*
 CampusPath MVP
 IMPORTANT: The coordinates and route graph below are DEMO DATA only.
 Replace them with verified campus GPS coordinates and surveyed paths before real use.
*/
const places = [
  {id:"gate",name:"Main Gate",category:"Facilities",type:"entrance",icon:"⌂",description:"Primary campus entrance",lat:16.2050,lng:77.3550,accessible:true},
  {id:"cse",name:"CSE Department",category:"Academic",type:"department",icon:"⌘",description:"Computer Science & Engineering",lat:16.2058,lng:77.3560,accessible:false},
  {id:"lab",name:"Computer Lab",category:"Academic",type:"laboratory",icon:"▦",description:"Computing laboratory",lat:16.2062,lng:77.3548,accessible:false},
  {id:"library",name:"Central Library",category:"Facilities",type:"library",icon:"▤",description:"Books, study spaces and resources",lat:16.2044,lng:77.3562,accessible:true},
  {id:"admin",name:"Administrative Office",category:"Office",type:"office",icon:"▣",description:"Admissions and student records",lat:16.2046,lng:77.3542,accessible:true},
  {id:"canteen",name:"Canteen",category:"Facilities",type:"canteen",icon:"☕",description:"Food and refreshments",lat:16.2065,lng:77.3565,accessible:false},
  {id:"auditorium",name:"Auditorium",category:"Facilities",type:"auditorium",icon:"▤",description:"Events and college gatherings",lat:16.2039,lng:77.3550,accessible:false},
  {id:"office",name:"Principal's Office",category:"Office",type:"office",icon:"▣",description:"Principal and administration",lat:16.2052,lng:77.3570,accessible:false}
];

// Demo walking graph. Replace with campus paths verified on-site.
// accessible:true means a path was marked accessible in this demo dataset only.
const paths = [
  {from:"gate",to:"cse",accessible:false},
  {from:"gate",to:"admin",accessible:true},
  {from:"admin",to:"library",accessible:true},
  {from:"library",to:"cse",accessible:false},
  {from:"cse",to:"lab",accessible:false},
  {from:"cse",to:"canteen",accessible:false},
  {from:"canteen",to:"office",accessible:false},
  {from:"admin",to:"auditorium",accessible:true},
  {from:"auditorium",to:"library",accessible:true},
  {from:"office",to:"cse",accessible:false},
  {from:"gate",to:"auditorium",accessible:false}
];

const categoryColors = {Academic:"#4986db",Facilities:"#e69b42",Office:"#9570d6"};
const map = L.map("map", {zoomControl:true}).setView([16.2052,77.3555], 17);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom:20,
  attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
}).addTo(map);

const markerById = {};
let routeLayer = null;
let activeCategory = "All";
let selectedPlaceId = null;
let userMarker = null;

function pinIcon(place) {
  const color = categoryColors[place.category] || "#167a55";
  return L.divIcon({
    className:"",
    html:`<div class="custom-pin" style="background:${color}"><span>${place.icon}</span></div>`,
    iconSize:[32,32],iconAnchor:[16,30],popupAnchor:[0,-29]
  });
}
function popupHtml(place) {
  const accessibility = place.accessible ? "Accessibility information marked available (demo)" : "Accessibility not verified";
  return `<div class="popup-title">${place.name}</div><div class="popup-sub">${place.description}</div><div class="popup-sub" style="margin-top:6px">${accessibility}</div>`;
}
places.forEach(place => {
  const marker = L.marker([place.lat,place.lng],{icon:pinIcon(place)}).addTo(map);
  marker.bindPopup(popupHtml(place));
  marker.on("click",()=>selectPlace(place.id,false));
  markerById[place.id] = marker;
});

function renderPlaces() {
  const filtered = places.filter(p => activeCategory === "All" || p.category === activeCategory);
  document.getElementById("placeCount").textContent = `${filtered.length} places`;
  const list = document.getElementById("placeList");
  list.innerHTML = "";
  filtered.forEach(place => {
    const button = document.createElement("button");
    button.className = "place-item" + (selectedPlaceId === place.id ? " selected" : "");
    button.innerHTML = `<span class="place-icon ${place.category.toLowerCase()}">${place.icon}</span><span class="place-text"><strong>${place.name}</strong><small>${place.description}</small></span><span class="place-arrow">›</span>`;
    button.addEventListener("click",()=>selectPlace(place.id,true));
    list.appendChild(button);
  });
}
function fillSelects() {
  const options = places.map(p=>`<option value="${p.id}">${p.name}</option>`).join("");
  document.getElementById("startSelect").innerHTML = options;
  document.getElementById("destinationSelect").innerHTML = options;
  document.getElementById("startSelect").value = "gate";
  document.getElementById("destinationSelect").value = "cse";
}
function selectPlace(id, openPopup=true) {
  const place = places.find(p=>p.id===id);
  if(!place) return;
  selectedPlaceId = id;
  map.flyTo([place.lat,place.lng],18,{duration:.55});
  if(openPopup) markerById[id].openPopup();
  document.getElementById("destinationSelect").value = id;
  renderPlaces();
}
function showSearchResults(query) {
  const panel = document.getElementById("searchResults");
  const q = query.trim().toLowerCase();
  if(!q){panel.hidden=true;panel.innerHTML="";return;}
  const matches = places.filter(p => `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q)).slice(0,5);
  panel.hidden = false;
  panel.innerHTML = matches.length ? matches.map(p=>`<button class="search-result" data-id="${p.id}"><span class="place-icon ${p.category.toLowerCase()}">${p.icon}</span><span><strong>${p.name}</strong><small>${p.category} · ${p.description}</small></span></button>`).join("") : `<div class="search-result"><span><strong>No matching place found</strong><small>Try another name or category.</small></span></div>`;
  panel.querySelectorAll("[data-id]").forEach(btn=>btn.addEventListener("click",()=>{
    selectPlace(btn.dataset.id,true);document.getElementById("searchInput").value="";
    panel.hidden=true;
  }));
}

function findPath(startId, endId, accessibleOnly) {
  if(startId===endId) return [startId];
  const queue = [[startId]];
  const visited = new Set([startId]);
  while(queue.length){
    const path = queue.shift();
    const current = path[path.length-1];
    const edges = paths.filter(e => (e.from===current || e.to===current) && (!accessibleOnly || e.accessible));
    for(const edge of edges){
      const next = edge.from===current ? edge.to : edge.from;
      if(visited.has(next)) continue;
      const nextPath = [...path,next];
      if(next===endId) return nextPath;
      visited.add(next);
      queue.push(nextPath);
    }
  }
  return null;
}
function showRoute() {
  const startId = document.getElementById("startSelect").value;
  const endId = document.getElementById("destinationSelect").value;
  const accessibleOnly = document.getElementById("accessibleToggle").checked;
  const message = document.getElementById("routeMessage");
  if(routeLayer){map.removeLayer(routeLayer);routeLayer=null;}
  if(startId===endId){
    message.textContent="Your starting point and destination are the same.";
    return;
  }
  const route = findPath(startId,endId,accessibleOnly);
  if(!route){
    message.textContent = accessibleOnly
      ? "No fully verified accessible route is available in this demo data. Do not assume an unverified path is step-free."
      : "No route found in the demo path network. Add a connecting campus path in app.js.";
    return;
  }
  const coords = route.map(id=>{const p=places.find(x=>x.id===id);return [p.lat,p.lng];});
  routeLayer = L.polyline(coords,{color:accessibleOnly?"#167a55":"#3278c8",weight:5,opacity:.9,dashArray:accessibleOnly?null:"8 7"}).addTo(map);
  map.fitBounds(routeLayer.getBounds(),{padding:[55,55]});
  const names = route.map(id=>places.find(p=>p.id===id).name);
  const distance = Math.round(routeLayer.getLatLngs().reduce((sum,point,i,arr)=>i?sum+arr[i-1].distanceTo(point):sum,0));
  message.innerHTML = `<strong>${accessibleOnly?"Accessible-demo route":"Demo route"} · ${route.length-1} segment(s)</strong><br>${names.join(" → ")}<br><span>Approx. straight-line segment total: ${distance} m. Not real walking distance.</span>`;
  document.getElementById("mapSubtitle").textContent = `${places.find(p=>p.id===startId).name} → ${places.find(p=>p.id===endId).name}`;
}
document.getElementById("searchInput").addEventListener("input",e=>showSearchResults(e.target.value));
document.getElementById("clearSearch").addEventListener("click",()=>{
  document.getElementById("searchInput").value="";
  showSearchResults("");
  document.getElementById("searchInput").focus();
});
document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");activeCategory=btn.dataset.category;renderPlaces();
}));
document.getElementById("routeBtn").addEventListener("click",showRoute);
document.getElementById("accessibleToggle").addEventListener("change",()=>{
  document.getElementById("routeMessage").textContent = document.getElementById("accessibleToggle").checked
    ? "Accessibility mode is on. Only demo paths marked accessible will be considered."
    : "Accessibility mode is off. All demo paths may be considered.";
});
document.getElementById("locateBtn").addEventListener("click",()=>{
  if(!navigator.geolocation){
    alert("Location is not supported by this browser.");return;
  }
  navigator.geolocation.getCurrentPosition(position=>{
    const point=[position.coords.latitude,position.coords.longitude];
    if(userMarker) map.removeLayer(userMarker);
    userMarker=L.circleMarker(point,{radius:8,color:"#fff",weight:3,fillColor:"#167a55",fillOpacity:1}).addTo(map).bindPopup("Your current location");
    map.flyTo(point,18);
    document.getElementById("routeMessage").textContent="Your location is shown on the map. For this MVP, route planning starts from listed campus locations.";
  },()=>alert("Could not access your location. Check browser location permission and try again."),{enableHighAccuracy:true,timeout:10000});
});
fillSelects();
renderPlaces();
