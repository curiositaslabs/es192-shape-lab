/* =========================== 3. CELLS =========================== */
// Three cantilevers of EQUAL MASS, L = 0.8 m, all made of one cell-wall solid (E_s 35 GPa, rho_s 1500 kg/m3):
//   solid bar b0 = 40 mm; a square tube and a cellular beam, both b = b0 (rho_s/rho)^1/2 wide (same envelope).
// Stiffness gain psi: tube I/I_s; aligned prismatic cells (hexagons, squares, triangles) rho_s/rho (Eq. 11.38) whatever
// the cell shape, because every wall runs along the beam; foam 1 (E = rel^2 E_s, Eq. 13.18).
// Loads are fractions of F0, the load that breaks the solid bar. Wood creases on the squeezed face at sigma_c/MOR = 38.7/70.3
// = 0.55 of its breaking load (Sitka spruce, USDA Wood Handbook), then breaks on the stretched face.
//   solid: crease 0.55, break 1. Cells: x 1/rel^1/2. Tube: x Z/Z_s, unless its squeezed wall buckles first: plate
//   sigma_cr = 3.6 E_s (t/(b-t))^2 (simply supported plate, k = 4); below 38.7 MPa the wall wrinkles and the tube collapses.
//   foam (Eq. 13.20, sigma_pl = 0.3 rel^3/2 sigma_s): collapse starts at 0.3 x 0.55 F0 = 0.17 F0 at any density.
// Break shapes: wood fails like a green stick: the stretched (top) face splinters and opens while the squeezed fibres hold, so
// the free part hinges about its bottom edge. A wrinkled tube or a foam crushes on the squeezed face and hinges about its top edge.
const CEL={L:0.8,b0:0.04,drop:0.12,Es:35,rs:1500,cr:38.7/70.3,sc:38.7,sb:70.3,zh:0.12,y0:.64};
// The 3D view draws the solid bar's tip drop at F0 as 0.12 m so it can be seen. The chart uses the true elastic value,
// sigma_b L^2 / (3 E_s c) = 70.3 x 0.8^2 / (3 x 35 000 x 0.02) = 21 mm, so its millimetres are real; dmm converts.
CEL.dmm=CEL.sb*CEL.L**2/(3*CEL.Es*1000*CEL.b0/2)/CEL.drop;
const CELL_KINDS={hex:'Hexagons',sq:'Squares',tri:'Triangles',foam:'Foam'};
/* Cell holes, drawn so the solid fraction of the section equals rel exactly (v8: v7 skipped edge cells and drew about
   twice the stated material at rel 0.25). Cells tile the whole section; holes are clipped to a skin one wall thick;
   the hole scale k is found by bisection on the drawn area. */
const polyArea=p=>{let a=0;for(let i=0;i<p.length;i++){const q=p[i],r=p[(i+1)%p.length];a+=q[0]*r[1]-r[0]*q[1];}return Math.abs(a)/2;};
function clipBox(p,h){for(const [ax,sg] of [[0,1],[0,-1],[1,1],[1,-1]]){const o=[];for(let i=0;i<p.length;i++){const A=p[i],B=p[(i+1)%p.length],a=sg*A[ax],c=sg*B[ax];
    if(a<=h)o.push(A);if((a<=h)!==(c<=h)){const t=(h-a)/(c-a);o.push([A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t]);}}p=o;if(p.length<3)return [];}return p;}
function cellHoles(kind,b,rel){const n=Math.max(4,Math.round(b/0.016)),cells=[];let wall;   // cells: [centre, vertices]; wall(k) = wall thickness
  if(kind==='sq'){const p=b/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++){const cx=-b/2+(i+.5)*p,cy=-b/2+(j+.5)*p,s=p/2;cells.push([[cx,cy],[[cx-s,cy-s],[cx+s,cy-s],[cx+s,cy+s],[cx-s,cy+s]]]);}wall=k=>p*(1-k)/2;}
  else if(kind==='tri'){const p=b/n*1.15,h=p*Math.sqrt(3)/2,R=Math.ceil(b/h/2)+1,C=Math.ceil(b/p)+2;
    for(let r=-R;r<R;r++)for(let c=-2*C;c<=2*C;c++){const up=((c+r)%2+2)%2===0,x0=c*p/2,yb=r*h;
      const t=up?[[x0,yb],[x0+p,yb],[x0+p/2,yb+h]]:[[x0,yb+h],[x0+p,yb+h],[x0+p/2,yb]];cells.push([[(t[0][0]+t[1][0]+t[2][0])/3,(t[0][1]+t[1][1]+t[2][1])/3],t]);}
    wall=k=>2*(h/3)*(1-k);}
  else{const Rc=b/(n*Math.sqrt(3)),N=Math.ceil(b/(1.5*Rc)/2)+1,M=Math.ceil(b/(Math.sqrt(3)*Rc)/2)+1;
    for(let row=-N;row<=N;row++)for(let c=-M;c<=M;c++){const cx=c*Math.sqrt(3)*Rc+(row&1?Math.sqrt(3)*Rc/2:0),cy=row*1.5*Rc;
      cells.push([[cx,cy],[0,1,2,3,4,5].map(i=>{const a=Math.PI/6+i*Math.PI/3;return [cx+Rc*Math.cos(a),cy+Rc*Math.sin(a)];})]);}
    wall=k=>Math.sqrt(3)*Rc*(1-k);}
  const holes=k=>{const lim=b/2-wall(k),out=[];for(const [g,v] of cells){const full=polyArea(v)*k*k,q=clipBox(v.map(z=>[g[0]+(z[0]-g[0])*k,g[1]+(z[1]-g[1])*k]),lim);
      if(q.length>=3&&polyArea(q)>0.04*full)out.push(q);}return out;};
  const solid=k=>1-holes(k).reduce((s,q)=>s+polyArea(q),0)/(b*b);
  let lo=0.05,hi=0.999;for(let i=0;i<34;i++){const m=(lo+hi)/2;if(solid(m)>rel)lo=m;else hi=m;}
  const hs=holes((lo+hi)/2);hs.solid=solid((lo+hi)/2);return hs;}
function cellShape(kind,b,rel){
  const sh=new THREE.Shape();sh.moveTo(-b/2,-b/2);sh.lineTo(b/2,-b/2);sh.lineTo(b/2,b/2);sh.lineTo(-b/2,b/2);sh.closePath();
  for(const q of cellHoles(kind,b,rel)){const h=new THREE.Path();q.forEach((p,i)=>i?h.lineTo(p[0],p[1]):h.moveTo(p[0],p[1]));h.closePath();sh.holes.push(h);}
  return sh;}
function tubeShape(b,t){const sh=new THREE.Shape();sh.moveTo(-b/2,-b/2);sh.lineTo(b/2,-b/2);sh.lineTo(b/2,b/2);sh.lineTo(-b/2,b/2);sh.closePath();
  const h=new THREE.Path(),c=b/2-t;h.moveTo(-c,-c);h.lineTo(-c,c);h.lineTo(c,c);h.lineTo(c,-c);h.closePath();sh.holes.push(h);return sh;}
/* one beam = a short stub inside/next to the clamp (z 0..zh) + the free part (zh..L); they meet at the fracture plane */
function beamGeos(kind,b,t,rel){const L=CEL.L,zh=CEL.zh;
  const ext=(shape,d,z0,steps)=>{const g=new THREE.ExtrudeGeometry(shape,{depth:d,steps,bevelEnabled:false,curveSegments:1});g.translate(0,0,z0);return g;};
  const bx=(w,d,z0,steps)=>{const g=new THREE.BoxGeometry(w,w,d,1,1,steps);g.translate(0,0,z0+d/2);return g;};
  if(kind==='solid')return [bx(b,zh,0,6),bx(b,L-zh,zh,46)];
  if(kind==='foam')return [bx(b,zh,0,6),bx(b,L-zh,zh,46)];
  if(kind==='tube'){const s=tubeShape(b,t);return [ext(s,zh,0,6),ext(s,L-zh,zh,46)];}
  const s=cellShape(kind,b,rel);return [ext(s,zh,0,6),ext(s,L-zh,zh,46)];}
function grainUV(g){const p=g.attributes.position,uv=new Float32Array(p.count*2);for(let i=0;i<p.count;i++){uv[2*i]=p.getZ(i)*2.2;uv[2*i+1]=(p.getX(i)*.6+p.getY(i))*7;}g.setAttribute('uv',new THREE.BufferAttribute(uv,2));return g;}
/* bend a part: elastic cantilever curve (tip drop) + rigid rotation of the free part about a pivot on the fracture plane.
   pivotY: +b/2 (top edge) or -b/2 (bottom edge). wr: wrinkle amplitude on the squeezed face near the clamp. */
function deformPart(geo,o){const p=geo.attributes.position,base=geo.userData.base||(geo.userData.base=p.array.slice());
  let c=geo.attributes.color;if(!c){c=new THREE.Float32BufferAttribute(new Float32Array(p.count*3),3);geo.setAttribute('color',c);}
  const L=CEL.L,zh=CEL.zh,yc=z=>{const s=clamp(z/L,0,1);return -o.drop*(3*s*s-s*s*s)/2;},yp=yc(zh)+o.pivotY,co=Math.cos(o.rot),si=Math.sin(o.rot);
  for(let i=0;i<p.count;i++){const x=base[3*i],y=base[3*i+1],z=base[3*i+2];let Y=y+yc(z),Z=z;
    if(o.wr>0&&y<0){const g=Math.exp(-Math.pow((z-zh)/.035,2));Y-=o.wr*g*(0.6+0.4*Math.sin((z-zh)/.012*Math.PI))*(-y/(o.b/2));}
    if(o.free&&o.rot>0){const dz=Z-zh,dy=Y-yp;Z=zh+dz*co+dy*si;Y=yp-dz*si+dy*co;}
    p.array[3*i]=x;p.array[3*i+1]=Y;p.array[3*i+2]=Z;
    const cc=cmap(o.strainFn(clamp(z/L,0,1),y));c.array[3*i]=cc.r;c.array[3*i+1]=cc.g;c.array[3*i+2]=cc.b;}
  p.needsUpdate=true;c.needsUpdate=true;geo.computeVertexNormals();geo.computeBoundingSphere();}
/* where a point on the free part's fracture face ends up */
function freePoint(o,y,z){const L=CEL.L,zh=CEL.zh,yc=zz=>{const s=clamp(zz/L,0,1);return -o.drop*(3*s*s-s*s*s)/2;};let Y=y+yc(z),Z=z;
  if(o.rot>0){const yp=yc(zh)+o.pivotY,dz=Z-zh,dy=Y-yp;Z=zh+dz*Math.cos(o.rot)+dy*Math.sin(o.rot);Y=yp-dz*Math.sin(o.rot)+dy*Math.cos(o.rot);}return [Y,Z];}

RIG.cells={hist:[0,0,0],histF:[0,0,0],mtype:'hex',items:[{name:'Solid bar'},{name:'Tube'},{name:'Cells'}],view:{dir:[1.45,0.5,0.62],lift:-0.08},legend:['Bending strain / failure strain','0','fails'],
  model(){const rel=+$('m-r').value,P=+$('m-P').value,kind=this.mtype,foam=kind==='foam',b0=CEL.b0,b=b0/Math.sqrt(rel);
    const t=(b-Math.sqrt(b*b-b0*b0))/2,bi=b-2*t,Ir=(b**4-bi**4)/(b0**4),Zr=Ir*b0/b,slb=3.6*CEL.Es*1000*(t/(b-t))**2,q=slb/CEL.sc;
    const tubeWr=q<1;
    const spec=[{kind:'solid',w:b0,psi:1,Pc:CEL.cr,Pb:1,mode:'wood'},
      {kind:'tube',w:b,t,psi:Ir,Pc:tubeWr?q*CEL.cr*Zr:CEL.cr*Zr,Pb:tubeWr?Math.min(Zr,1.12*q*CEL.cr*Zr):Zr,mode:tubeWr?'wrinkle':'wood',slb},
      foam?{kind:'foam',w:b,psi:1,Pc:0.3*CEL.cr,Pb:0.33,mode:'foam'}:{kind,w:b,psi:1/rel,Pc:CEL.cr/Math.sqrt(rel),Pb:1/Math.sqrt(rel),mode:'wood'}];
    const S=spec.map((s,i)=>{const {Pc,Pb}=s;
      const pl=P>Pc?clamp(s.mode==='foam'?(P-Pc)/(0.25*Pc):(P-Pc)/Math.max(1e-6,Pb-Pc),0,1):0;
      const fr=s.mode==='foam'?(P>Pc?clamp((P-Pc)/(Pb-Pc),0,1):0):(P>Pb?clamp((P-Pb)/(0.06*Pb),0,1):0);
      this.hist[i]=Math.max(this.hist[i],pl);this.histF[i]=Math.max(this.histF[i],fr);const pH=this.hist[i],fH=this.histF[i];
      const drop=CEL.drop*(Math.min(P,Pc)+(s.mode==='wood'?1.7*clamp(P-Pc,0,Pb-Pc):0.4*clamp(P-Pc,0,Pb-Pc)))/s.psi;
      const rot=s.mode==='wood'?0.5*smooth(fH):s.mode==='wrinkle'?0.42*smooth(fH):0.4*smooth(fH);
      const wr=s.mode==='wrinkle'?s.w*0.06*smooth(pH)+s.w*0.05*smooth(fH):s.mode==='foam'?s.w*0.04*smooth(fH):0;
      return Object.assign({},s,{pl,fr,pH,fH,drop,rot,wr,e:Math.min(1,P/Pc),pivotY:s.mode==='wood'?-s.w/2:s.w/2});});
    return {rel,P,b,t,kind,foam,S};},
  build(){clearRig();if(!HAS3D)return;const m=this.model();this.b=m.b;this.kind=m.kind;const g=.16,b0=CEL.b0,b=m.b,y0=CEL.y0;
    const tot=b0+2*b+2*g,st=-tot/2;this.xs=[st+b0/2,st+b0+g+b/2,st+b0+2*g+1.5*b];
    box(tot+.34,1.05,.14,M.concrete,0,.52,-.07);box(tot+.2,Math.max(.3,b+.16),.018,M.paint,0,y0,.009);
    for(const sx of [-1,1])for(const sy of [-1,1])hexBolt(.016,sx*(tot/2+.06),y0+sy*Math.max(.11,b/2+.05),.022,null,'z');
    const mats=[M.woodDense,M.woodDense,m.foam?M.foam:M.wood];
    this.parts=m.S.map((s,i)=>{const [gs,gm]=beamGeos(s.kind,s.w,s.t,m.rel).map(grainUV);const a=track(mesh(gs,mats[i]),mats[i]),c=track(mesh(gm,mats[i]),mats[i]);a.position.set(this.xs[i],y0,0);c.position.set(this.xs[i],y0,0);rig.add(a,c);return [a,c];});
    this.xs.forEach((x,i)=>{const w=m.S[i].w;box(w+.03,.012,.06,M.paintDark,x,y0+w/2+.006,.048);box(w+.03,.012,.06,M.paintDark,x,y0-w/2-.006,.048);for(const s of [-1,1])box(.012,w+.036,.06,M.paintDark,x+s*(w/2+.015),y0,.048);});
    // splinters: thin fibre sticks that bridge the opened top face after a wood-type break
    this.spl=m.S.map((s,i)=>{const n=s.kind==='tube'?18:24,im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),i===2?M.wood:M.woodDense,n);im.frustumCulled=false;im.castShadow=true;im.visible=false;rig.add(im);
      const R=rng(11+i*7),pts=[];for(let k=0;k<n;k++){let x,y;if(s.kind==='tube'){if(R()<.6){x=(R()-.5)*(s.w-.004);y=s.w/2-R()*s.t;}else{x=(R()<.5?-1:1)*(s.w/2-R()*s.t);y=R()*s.w*.45;}}
        else{x=(R()-.5)*s.w*.94;y=s.w*(.05+.43*R());}pts.push({x,y,j:R(),th:(s.kind==='solid'?.0035:.0025)*(.6+.8*R())});}im.userData.pts=pts;return im;});
    this.arr=m.S.map(()=>arrow(.12,.016));this.ws=m.S.map(()=>weightStack(.1,.03));
    this.tF=m.S.map(()=>tag('','force',true));this.tSup=tag('clamped','sup',true);this.tSec=m.S.map(()=>tag('','sec',true));this.tState=m.S.map(()=>tag(''));
    this.dim=dimLine(new THREE.Vector3(1,0,0));this.tDim=tag('','dim',true);
    this.update();},
  update(){const m=this.model();this.S=m.S;const {rel,P,b}=m;this.items[2].name=CELL_KINDS[m.kind];
    $('o-mr').textContent=fmt(rel,2);$('o-mP').textContent=fmt(P,2)+' × F₀';
    const [,T,C]=m.S;
    $('m-res').innerHTML=`<span class="big">${fmt(T.psi,1)}× <span>tube</span> · ${fmt(C.psi,1)}× <span>${m.foam?'foam':'cells'}</span></span><small>stiffer than the solid bar · all three have the same mass</small>`;
    if(!HAS3D||!this.parts)return;if(Math.abs(b-this.b)>1e-9||m.kind!==this.kind){this.build();return;}
    const L=CEL.L,y0=CEL.y0,mtx=new THREE.Matrix4(),obj=new THREE.Object3D();
    m.S.forEach((s,i)=>{const x=this.xs[i],w=s.w,hv=s.mode==='foam'?1.5:1;
      const o={drop:s.drop,rot:s.rot,pivotY:s.pivotY,wr:s.wr,b:w,strainFn:(u,y)=>{let v=s.e*hv*(1-u)*Math.abs(y)/(w/2);
        if(s.pH>0)v=Math.max(v,(s.mode==='wood'?1.15:1.25)*Math.exp(-Math.abs(u-CEL.zh/L)/.04)*((s.mode==='wood'?y<0:y<0)?1:.7));if(s.fH>0&&Math.abs(u-CEL.zh/L)<.03)v=1.2;return v;}};
      deformPart(this.parts[i][0].geometry,Object.assign({},o,{free:false}));deformPart(this.parts[i][1].geometry,Object.assign({},o,{free:true}));
      // splinters bridge the gap on the stretched face (wood-type break only)
      const im=this.spl[i],showS=s.mode==='wood'&&s.fH>0.02;im.visible=showS;
      if(showS){im.userData.pts.forEach((q,k)=>{const yA=q.y+(-o.drop*(3*(CEL.zh/L)**2-(CEL.zh/L)**3)/2),[yB,zB]=freePoint(o,q.y,CEL.zh);
        const A=new THREE.Vector3(x+q.x,y0+yA,CEL.zh-.004-q.j*.012),B=new THREE.Vector3(x+q.x+(q.j-.5)*.004,y0+yB,zB+.004+(1-q.j)*.012);
        const len=Math.max(.002,A.distanceTo(B))*(.75+.5*q.j);obj.position.copy(A).lerp(B,.5);obj.lookAt(B);obj.scale.set(q.th,q.th*.7,len);obj.updateMatrix();im.setMatrixAt(k,obj.matrix);});
        im.instanceMatrix.needsUpdate=true;}
      const [yt,zt]=freePoint(o,w/2,L),[yb,zb]=freePoint(o,-w/2,L);
      this.arr[i].position.set(x,y0+yt+.004,zt-.012);this.ws[i].position.set(x,y0+yb,zb-.012);this.ws[i].setCount(Math.min(6,1+P*1.2));
      this.tF[i].pos.set(x,y0+yt+.15,zt);this.tF[i].el.textContent='F = '+fmt(P,2)+' F₀';
      this.tState[i].pos.set(x,y0+yb-.2,zb);const bad=s.pH>0;this.tState[i].el.className='tag '+(bad?'bad':'ok');
      this.tState[i].el.textContent=!bad?'elastic':s.mode==='foam'?(s.fH>.3?'crushed':'cells hinging'):s.mode==='wrinkle'?(s.fH>0?'wall buckled':'wall wrinkling'):(s.fH>0?'broken':'creased');
      this.tSec[i].pos.set(x,y0+w/2+.07,.06);
      const nm=i===0?'Solid 40 × 40 mm':i===1?`Tube ${fmt(w*1000,0)} mm, wall ${fmt(s.t*1000,1)}`:`${CELL_KINDS[m.kind]} ${fmt(w*1000,0)} mm`;
      this.tSec[i].el.innerHTML=secSVG(i===0?'sq':i===1?'sqtube':m.kind==='foam'?'foam':m.kind==='sq'?'sqcell':m.kind==='tri'?'tri':'hex',{s:5})+`<span><b>${nm}</b>ψ = ${fmt(s.psi,1)}</span>`;
      const [Y,Z]=freePoint(o,s.mode==='wood'&&s.fH>0?w/2:-w/2,CEL.zh+.02);this.items[i].hot=new THREE.Vector3(x,y0+Y,Z);});
    const xl=this.xs[0]-.08;this.dim.set(new THREE.Vector3(xl,.48,0),new THREE.Vector3(xl,.48,L),.02);this.tDim.pos.set(xl,.48,L*.55);this.tDim.el.textContent='L = 0.80 m';this.tSup.pos.set(0,y0+b/2+.12,0);},
  pick:['Solid bar','Tube','Cells'],auto(){const s=this.S;const r=s.map(x=>x.pH>0?2+x.fH:x.e);let k=0;r.forEach((v,i)=>{if(v>r[k]+1e-9)k=i;});return k;},
  story(i){const s=this.S[i];
    if(s.mode==='foam'){const steps=['Elastic','Hinges','Crushed'];let st,head,why;
      if(s.fH>0){st='Crushed';head='Cells crush on the squeezed face';why='Once the joints have hinged, a layer of cells folds flat near the clamp. The foam keeps crushing at almost constant stress, so the beam sags without snapping.';}
      else if(s.pH>0){st='Hinges';head='Plastic hinges where the walls meet';why='Bending moment in each wall is largest at its ends, where it joins the next cells. The wall material yields there first: σ<sub>pl</sub> = 0.3(ρ/ρ<sub>s</sub>)<sup>3/2</sup>σ<sub>s</sub>.';}
      else{st='Elastic';head='Walls bend like tiny beams';why='The walls meet at angles, so the load bends them instead of stretching them. Bending is soft, so stiffness falls as (ρ/ρ<sub>s</sub>)² and spreading the mass out gains nothing.';}
      return {mat:'foam',label:'Foam',where:'squeezed face, near the clamp',sign:-1,e:s.e,pl:s.pH,fr:s.fH,band:0,steps,stage:st,head,why,
        measure:'<b>Measure it:</b> crush a foam block: a straight elastic line, a long flat plateau, then a steep rise when the cells are flat.'};}
    if(s.mode==='wrinkle'){const steps=['Elastic','Wrinkle','Collapse'];let st,head,why;
      if(s.fH>0){st='Collapse';head='The thin wall folds and the tube collapses';why='Once the squeezed wall has buckled it carries almost no load, so the bending moment has nowhere to go. The tube folds at the clamp, long before its material is fully used.';}
      else if(s.pH>0){st='Wrinkle';head='The squeezed wall wrinkles';why=`The wall is only ${fmt(s.t*1000,1)} mm thick but ${fmt(s.w*1000,0)} mm wide. A thin plate buckles at σ ≈ 3.6E(t/b)² = ${sig(s.slb,2)} MPa, below the ${CEL.sc} MPa the wood can take. The same limit as the thin-walled tube in tab 2.`;}
      else{st='Elastic';head='All the material sits far from the middle';why='A tube puts its walls at the outside, where bending strain is largest, so it is the stiffest way to use the mass.';}
      return {mat:'wooddense',label:'Tube',where:'squeezed (lower) wall, at the clamp',sign:-1,e:s.e,pl:s.pH,fr:s.fH,band:0,steps,stage:st,head,why,
        measure:'<b>Measure it:</b> watch the squeezed wall: a ripple appears, then the load stops rising.'};}
    const steps=['Elastic','Crease','Break'];let st,head,why,sign=-1,where='squeezed (lower) face, at the clamp';
    if(s.fH>0){st='Break';sign=1;where='stretched (upper) face, at the clamp';head='The stretched face splinters open';why='Fibres snap on the top face and pull out of the lignin around them at different places, so the break is long and splintered. The squeezed fibres underneath still hold, so the beam hangs on like a green stick.';}
    else if(s.pH>0){st='Crease';head='The squeezed face creases first';why=`Along the grain, wood crushes at about 39 MPa but breaks in bending at about 70 MPa, so a crease (kink band) forms at 55% of the breaking load: ${fmt(s.Pc,2)} F₀ here. The beam still holds until ${fmt(s.Pb,2)} F₀.`;}
    else{st='Elastic';head=i===0?'The solid bar bends':i===1?'The tube bends':'Walls along the beam stretch';why=i===0?'All the material is packed close to the centre line, where bending does little.':i===1?'All the walls sit at the outside, where bending strain is largest.':'Every wall runs along the beam, whatever the cell shape, so the walls stretch like the solid does. E falls only as ρ/ρ<sub>s</sub> while I grows much faster.';}
    return {mat:i===2?'wood':'wooddense',label:this.items[i].name,where,sign,e:s.e,pl:s.pH,fr:s.fH,band:0,steps,stage:st,head,why,
      measure:'<b>Measure it:</b> a three-point bending test. A wrinkle appears on the squeezed face before the stretched face breaks.'};},
  chartTest(svg,leg){const c=SER(),m=this.model(),cols=[c.a,c.b,c.c],ser=[],marks=[],fails=[],f=CEL.dmm;
    m.S.forEach((s,i)=>{const k=CEL.drop*1000*f/s.psi,dC=s.Pc*k;
      if(s.mode==='foam'){ser.push({pts:[[0,0],[dC,s.Pc]],c:cols[i],w:2.8});ser.push({pts:[[dC,s.Pc],[1e4,s.Pc*1.08]],c:cols[i],dash:'6 4',w:2});fails.push({x:dC,y:s.Pc,c:cols[i],label:sig(dC,2)+' mm'});}
      else{const sl=s.mode==='wood'?1.7:0.4,dB=dC+sl*(s.Pb-s.Pc)*k,pts=[[0,0],[dC,s.Pc]];for(let j=1;j<=12;j++){const q=j/12;pts.push([dC+(dB-dC)*q,s.Pc+(s.Pb-s.Pc)*Math.sqrt(q)]);}
        ser.push({pts,c:cols[i],w:2.8});ser.push({pts:[[dB,s.Pb],[dB*1.08,s.Pb*.3],[1e4,s.Pb*.25]],c:cols[i],dash:'6 4',w:2});fails.push({x:dB,y:s.Pb,c:cols[i],label:sig(dB,2)+' mm'});}
      marks.push({x:(s.drop*1000+Math.sin(s.rot)*CEL.L*1000)*f,y:m.P,c:cols[i]});});
    const ymax=Math.max(1.25,Math.min(5.2,Math.max(...m.S.map(s=>s.Pb))*1.12),m.P*1.08);
    plot(svg,{x:{min:0,max:f*Math.max(200,1.15*CEL.drop*1000*(CEL.cr+1.7*(1-CEL.cr))),label:'Tip deflection δ (mm)'},y:{min:0,max:ymax,label:'Tip load F / F₀'},series:ser,marks,fails,hl:[{v:m.P,c:c.cr,dash:'1 0',w:1}]});
    legend(leg,[{c:c.a,t:'Solid bar'},{c:c.b,t:'Tube'},{c:c.c,t:CELL_KINDS[m.kind]},{c:c.mu,t:'after failure',dash:1},{c:c.mu,t:'○ fails at δ',ring:1}]);},
  chartDesign(svg,leg){const c=SER(),m=this.model(),E=m.foam?m.rel*m.rel*CEL.Es:m.rel*CEL.Es;
    ashbyChart(svg,{solid:[CEL.rs,CEL.Es],solidLabel:'cell-wall solid',lines:[{slope:1,c:c.b,label:'aligned cells: E ~ ρ',at:.8},{slope:2,c:c.c,label:'foam: E ~ ρ²',at:.9}],
      points:[{x:m.rel*CEL.rs,y:E,c:m.foam?c.c:c.b,label:sig(E)+' GPa',dx:-10,anchor:'end'}]});
    legend(leg,[{c:c.b,t:'Walls stretch (slope 1)',dash:1},{c:c.c,t:'Walls bend (slope 2)',dash:1}]);},
};

/* =========================== 4. LATTICES =========================== */
// Two printed Ti-6Al-4V lattices, same relative density, same applied stress. Each slot (A, B) can hold:
//   octet  truss (Ashby Fig 13.21), stretch-dominated: E = rel/3 Es (13.27); sigma = min(rel/3 sigma_s (13.28), 0.2 rel^2 Es (13.29))
//   open   BCC lattice, Maxwell M < 0 (13.3), bending-dominated: E = rel^2 Es (13.18); sigma_pl = 0.3 rel^1.5 sigma_s (13.20)
//   gyroid sheet TPMS: E = 0.90 rel^1.58 Es, sigma = 0.536 rel^1.45 sigma_s  } Naghavi et al., Bioengineering 9 (2022) 504,
//   diamond sheet TPMS: E = 0.713 rel^1.21 Es, sigma = 0.419 rel^1.14 sigma_s } Table 7: L-PBF Ti-6Al-4V, fitted at rel 0.33-0.47
// Es 115 GPa, sigma_s 1000 MPa (as printed). Failure: strut lattices snap along a ~45 deg band and the load drops (as-built Ti-6Al-4V
// has little ductility); sheet TPMS yield, then a long plateau with layer-by-layer crushing (Naghavi: elastic, yield, post-yield,
// plateau, densification). After a strut lattice snaps, the block above the 45 deg plane slides down and the platen follows it;
// struts of the other wedge that the platen reaches are crushed flat (displacement-controlled test).
const LAT={c:0.09,n:3,Es:115e3,ss:1000,rs:4430,X:8,smax:160};
const LTYPES={
  octet:{name:'Octet truss',short:'Octet',kind:'strut',mode:'snap',E:r=>r/3,S:r=>Math.min(r/3,0.2*r*r*LAT.Es/LAT.ss),slope:1,src:'Ashby Eqs 13.27–13.29'},
  bcc:{name:'Open lattice',short:'Open',kind:'strut',mode:'snap',E:r=>r*r,S:r=>0.3*Math.pow(r,1.5),slope:2,src:'Ashby Eqs 13.18, 13.20'},
  gyroid:{name:'Gyroid',short:'Gyroid',kind:'tpms',mode:'plateau',E:r=>0.9*Math.pow(r,1.58),S:r=>0.536*Math.pow(r,1.45),slope:1.58,src:'Naghavi 2022'},
  diamond:{name:'Diamond TPMS',short:'Diamond',kind:'tpms',mode:'plateau',E:r=>0.713*Math.pow(r,1.21),S:r=>0.419*Math.pow(r,1.14),slope:1.21,src:'Naghavi 2022'}};
class SCurve extends THREE_Curve(){constructor(a){super();this.a=a;}getPoint(t,o){o=o||new THREE.Vector3();return o.set(this.a*(3*t*t-2*t*t*t-t),t-0.5,0);}}
function THREE_Curve(){return window.THREE?THREE.Curve:class{};}
function latticeNodesStruts(type){const c=LAT.c,n=LAT.n,key=p=>p.map(v=>Math.round(v*1e4)).join(',');const nodes=[],idx=new Map(),struts=[];
  const add=p=>{const k=key(p);if(!idx.has(k)){idx.set(k,nodes.length);nodes.push(p);}return idx.get(k);};
  if(type==='octet'){for(let i=0;i<=2*n;i++)for(let j=0;j<=2*n;j++)for(let k=0;k<=2*n;k++)if((i+j+k)%2===0)add([i*c/2,j*c/2,k*c/2]);const l=c/Math.SQRT2;
    for(let a=0;a<nodes.length;a++)for(let b=a+1;b<nodes.length;b++){const d=Math.hypot(nodes[a][0]-nodes[b][0],nodes[a][1]-nodes[b][1],nodes[a][2]-nodes[b][2]);if(Math.abs(d-l)<1e-6)struts.push([a,b,0]);}}
  else{for(let i=0;i<n;i++)for(let j=0;j<n;j++)for(let k=0;k<n;k++){const ce=add([(i+.5)*c,(j+.5)*c,(k+.5)*c]);for(const dx of[0,1])for(const dy of[0,1])for(const dz of[0,1])struts.push([ce,add([(i+dx)*c,(j+dy)*c,(k+dz)*c]),j]);}}
  return {nodes,struts};}
/* ---------- sheet TPMS: solid where |f| < t; meshed with surface nets ---------- */
const TPMSF={gyroid:(x,y,z)=>Math.sin(x)*Math.cos(y)+Math.sin(y)*Math.cos(z)+Math.sin(z)*Math.cos(x),
  diamond:(x,y,z)=>Math.sin(x)*Math.sin(y)*Math.sin(z)+Math.sin(x)*Math.cos(y)*Math.cos(z)+Math.cos(x)*Math.sin(y)*Math.cos(z)+Math.cos(x)*Math.cos(y)*Math.sin(z)};
const TPMS_T={};
function tpmsThickness(type,rel){const key=type+':'+rel.toFixed(3);if(TPMS_T[key])return TPMS_T[key];
  if(!TPMS_T['v'+type]){const f=TPMSF[type],N=36,v=[];for(let i=0;i<N;i++)for(let j=0;j<N;j++)for(let k=0;k<N;k++)v.push(Math.abs(f(2*Math.PI*(i+.5)/N,2*Math.PI*(j+.5)/N,2*Math.PI*(k+.5)/N)));v.sort((a,b)=>a-b);TPMS_T['v'+type]=v;}
  const v=TPMS_T['v'+type];return TPMS_T[key]=v[Math.min(v.length-1,Math.floor(rel*v.length))];}
function tpmsGeometry(type,rel){const n=LAT.n,c=LAT.c,H=n*c,R=16,N=n*R,h=H/N,D=N+3,f=TPMSF[type],t=tpmsThickness(type,rel),k=2*Math.PI/c;
  const F=new Float32Array(D*D*D),id=(i,j,l)=>(i*D+j)*D+l;
  for(let i=0;i<D;i++)for(let j=0;j<D;j++)for(let l=0;l<D;l++){const inside=i>0&&j>0&&l>0&&i<D-1&&j<D-1&&l<D-1;
    F[id(i,j,l)]=inside?Math.abs(f(k*(i-1)*h,k*(j-1)*h,k*(l-1)*h))-t:1;}
  const vid=new Int32Array((D-1)*(D-1)*(D-1)).fill(-1),cid=(i,j,l)=>(i*(D-1)+j)*(D-1)+l,pos=[];
  const E=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
  for(let i=0;i<D-1;i++)for(let j=0;j<D-1;j++)for(let l=0;l<D-1;l++){const vals=[],cs=[];
    for(let q=0;q<8;q++){const a=i+(q&1),b=j+(q>>1&1),cc=l+(q>>2&1);vals.push(F[id(a,b,cc)]);cs.push([a,b,cc]);}
    let neg=0;for(const v of vals)if(v<0)neg++;if(neg===0||neg===8)continue;
    let sx=0,sy=0,sz=0,m=0;for(const [a,b] of E){const va=vals[a],vb=vals[b];if((va<0)!==(vb<0)){const u=va/(va-vb);sx+=cs[a][0]+(cs[b][0]-cs[a][0])*u;sy+=cs[a][1]+(cs[b][1]-cs[a][1])*u;sz+=cs[a][2]+(cs[b][2]-cs[a][2])*u;m++;}}
    vid[cid(i,j,l)]=pos.length/3;pos.push(clamp((sx/m-1)*h,0,H),clamp((sy/m-1)*h,0,H),clamp((sz/m-1)*h,0,H));}
  const idx=[],quad=(a,b,c2,d,flip)=>{if(a<0||b<0||c2<0||d<0)return;if(flip)idx.push(a,c2,b,a,d,c2);else idx.push(a,b,c2,a,c2,d);};
  for(let i=1;i<D-1;i++)for(let j=1;j<D-1;j++)for(let l=1;l<D-1;l++){const v0=F[id(i,j,l)];
    if(i<D-1){const v1=F[id(i+1,j,l)];if((v0<0)!==(v1<0))quad(vid[cid(i,j-1,l-1)],vid[cid(i,j,l-1)],vid[cid(i,j,l)],vid[cid(i,j-1,l)],!(v0<0));}
    if(j<D-1){const v1=F[id(i,j+1,l)];if((v0<0)!==(v1<0))quad(vid[cid(i-1,j,l-1)],vid[cid(i-1,j,l)],vid[cid(i,j,l)],vid[cid(i,j,l-1)],!(v0<0));}
    if(l<D-1){const v1=F[id(i,j,l+1)];if((v0<0)!==(v1<0))quad(vid[cid(i-1,j-1,l)],vid[cid(i,j-1,l)],vid[cid(i,j,l)],vid[cid(i-1,j,l)],!(v0<0));}}
  const g=new THREE.BufferGeometry(),P=new Float32Array(pos),uv=new Float32Array(pos.length/3*2);for(let q=0;q<pos.length/3;q++){uv[2*q]=(P[3*q]+P[3*q+2])*9;uv[2*q+1]=P[3*q+1]*9;}
  g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(pos.length),3));g.setIndex(idx);g.computeVertexNormals();
  g.userData.base=P.slice();return g;}

RIG.lattice={hist:[0,0],histF:[0,0],types:['octet','gyroid'],items:[{x:-0.3},{x:0.3}],view:{dir:[0.5,0.42,1.25],lift:-0.02},legend:['Strain (relative)','low','high'],
  bet:null,streak:0,
  sigma(){const u=+$('l-P').value;return LAT.smax*u*u;},
  model(){const rel=+$('l-r').value,s=this.sigma();
    const S=this.types.map((ty,i)=>{const T=LTYPES[ty],E=T.E(rel)*LAT.Es,sf=T.S(rel)*LAT.ss,x={type:ty,T,E,sf,buck:ty==='octet'&&0.2*rel*rel*LAT.Es<rel/3*LAT.ss};
      if(T.mode==='snap'){const k=ty==='bcc'?0.1:0.05;x.pl=s>sf?clamp((s-sf)/(k*sf),0,1):0;x.fr=s>(1+k*.6)*sf?clamp((s-(1+k*.6)*sf)/(0.13*sf),0,1):0;}
      else{x.pl=s>sf?clamp((s-sf)/(0.08*sf),0,1):0;x.fr=s>1.08*sf?clamp((s-1.08*sf)/(0.6*sf),0,1):0;}   // fr = progress of the crush plateau
      this.hist[i]=Math.max(this.hist[i],x.pl);this.histF[i]=Math.max(this.histF[i],x.fr);x.pH=this.hist[i];x.fH=this.histF[i];x.e=Math.min(1,s/sf);x.eps=Math.min(s,sf)/E;return x;});
    return {rel,s,S};},
  build(){clearRig();if(!HAS3D)return;const H=LAT.c*LAT.n,rel=+$('l-r').value;bedPlate(1.25,.6,0,0);
    this.items.forEach((it,ii)=>{it.type=this.types[ii];it.T=LTYPES[it.type];it.name=it.T.name;const g=new THREE.Group();g.position.x=it.x;rig.add(g);it.g=g;
      box(.42,.05,.42,M.chrome,0,.065,0,g);it.top=box(.42,.05,.42,M.chrome,0,0,0,g);const yTop=.09+H+.3;
      for(const sx of [-1,1]){cyl(.022,yTop,M.chrome,sx*.25,yTop/2+.04,-.16,g,20);}box(.6,.09,.12,M.paint,0,yTop,-.12,g);box(.16,.09,.22,M.paint,0,yTop,-.02,g);
      cyl(.06,.14,M.paint,0,yTop-.115,0,g);it.ramTop=yTop-.19;it.ram=cyl(.026,1,M.chrome,0,0,0,g);it.inst=null;it.sheet=null;
      if(it.T.kind==='strut'){Object.assign(it,latticeNodesStruts(it.type));
        const tg=it.type==='octet'?new THREE.CylinderGeometry(1,1,1,10,1):new THREE.TubeGeometry(new SCurve(0),14,1,8,false);
        const im=new THREE.InstancedMesh(tg,M.ti,it.struts.length*2);im.frustumCulled=false;im.castShadow=true;im.receiveShadow=true;im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(im.count*3),3);track(im,M.ti);g.add(im);it.inst=im;}
      else{const sg=tpmsGeometry(it.type,rel);it.sheet=track(mesh(sg,M.ti),M.ti);it.sheet.position.set(-H/2,.09,-H/2);g.add(it.sheet);}
      it.tF=tag('','force',true);it.tSup=tag('rigid platens','sup',true);it.tSec=tag('','sec',true);it.tState=tag('');it.tName=tag('<b>'+(ii?'B':'A')+'</b> '+it.name,'sec');});
    this.update();},
  update(){const m=this.model();this.S=m.S;const {rel,s}=m,[A,B]=m.S;
    $('o-lr').textContent=fmt(rel,3);$('o-lP').textContent=sig(s,2)+' MPa';
    const hi=A.E>=B.E?0:1,r=hi?B.E/A.E:A.E/B.E;
    $('l-res').innerHTML=`<span class="big">${fmt(r,1)}× <span>stiffer</span></span><small>${hi?'B':'A'} (${m.S[hi].T.short}) at the same density</small>`;
    this.updateBet();
    if(!HAS3D||!this.items[0].g)return;const c=LAT.c,H=c*LAT.n,mtx=new THREE.Matrix4(),up=new THREE.Vector3(0,1,0),white=new THREE.Color(1,1,1),zero=new THREE.Matrix4().makeScale(0,0,0),hot=new THREE.Color(1,.35,.3);
    this.items.forEach((it,ii)=>{const st=m.S[ii],T=it.T,x0=-H/2,z0=-H/2,y0=.09,epsD=LAT.X*st.eps;let topY;
      if(T.kind==='strut'){const oct=it.type==='octet',r=oct?(c/Math.SQRT2)*Math.sqrt(rel/(6*Math.SQRT2*Math.PI)):c*Math.sqrt(rel/(4*Math.sqrt(3)*Math.PI));
        // after the struts snap, the block above the 45 deg plane slides down; the platen follows it and crushes what it meets
        const slide=.6*c*smooth(st.fH>0?Math.max(st.fH,.15):st.pH*.12),drop=slide/Math.SQRT2,side=p=>-(p[0]-H/2)+(p[1]-H/2)>1e-6;
        topY=y0+H*(1-epsD)-drop;const ceil=topY;
        const nodeP=p=>{let x=p[0],y=p[1]*(1-epsD);if(side(p)){x-=slide/Math.SQRT2;y-=drop;}return new THREE.Vector3(x0+x,Math.min(y0+y,ceil),z0+p[2]);};
        const im=it.inst,broken=st.fH>.25;let n=0;
        if(!oct){const lb=c*Math.sqrt(3)/2,amp=0.9*epsD*lb+st.pH*0.22*lb;im.geometry.dispose();const g=new THREE.TubeGeometry(new SCurve(amp),14,r,8,false);
          const col=new Float32Array(g.attributes.position.count*3);for(let i=0;i<g.attributes.position.count;i++){const u=Math.floor(i/9)/14;let v=strainOn?Math.min(1.2,st.e*Math.pow(Math.abs(1-2*u),1.5)):0;/* bending strain: zero at zero load, largest at the joints */if(strainOn&&st.pH>0)v=Math.max(v,Math.pow(Math.abs(1-2*u),3)*(1+st.pH*.3));const cc=cmap(v);col[3*i]=cc.r;col[3*i+1]=cc.g;col[3*i+2]=cc.b;}
          g.setAttribute('color',new THREE.BufferAttribute(col,3));im.geometry=g;}
        const put=(p,qq,v)=>{const d=qq.clone().sub(p),len=Math.max(1e-4,d.length()),yv=d.clone().normalize();let xv=up.clone().sub(yv.clone().multiplyScalar(up.dot(yv)));if(xv.lengthSq()<1e-8)xv.set(1,0,0);xv.normalize();const zv=new THREE.Vector3().crossVectors(xv,yv);
          if(oct)mtx.makeBasis(xv.multiplyScalar(r),yv.multiplyScalar(len),zv.multiplyScalar(r));else mtx.makeBasis(xv,yv.multiplyScalar(len),zv);
          mtx.setPosition(p.clone().add(qq).multiplyScalar(.5));im.setMatrixAt(n,mtx);im.setColorAt(n,!strainOn?white:oct?cmap(v):(v>1?hot:white));n++;};
        for(const [a,bb] of it.struts){const Aa=it.nodes[a],Bb=it.nodes[bb],p=nodeP(Aa),qq=nodeP(Bb),d=qq.clone().sub(p),dl=Math.max(1e-6,d.length()),cos2=(d.y/dl)**2,cross=side(Aa)!==side(Bb);
          const crushed=drop>0&&(p.y>=ceil-1e-6||qq.y>=ceil-1e-6)&&!side(Aa)&&!side(Bb);
          let v=st.e*.85*cos2;if((cross||crushed)&&st.pH>0)v=Math.max(v,.95+.2*st.fH);
          if(cross&&broken){put(p,p.clone().lerp(qq,.4),1.1);put(qq,qq.clone().lerp(p,.4),1.1);}else put(p,qq,v);}
        while(n<im.count){im.setMatrixAt(n,zero);n++;}im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true;
        im.material=strainOn?(oct?M.strainInst:M.strain):M.ti;
        const hn=oct?[1.5*c,1.5*c,3*c]:[1.5*c,1.5*c,2.5*c];it.hot=nodeP(hn).add(new THREE.Vector3(it.x,0,0));}
      else{ // sheet TPMS: uniform elastic squash, then one layer crushes at a time (plateau), with a slight bulge in that layer
        const g=it.sheet.geometry,P=g.attributes.position,B0=g.userData.base,C=g.attributes.color,crush=0.5*c*smooth(st.fH)+0.06*c*st.pH,yb=H*.62,w=c*.5;
        for(let q=0;q<P.count;q++){const x=B0[3*q],y=B0[3*q+1],z=B0[3*q+2];let Y=y*(1-epsD),X=x,Z=z,inBand=0;
          if(crush>0){const d=y-(yb-w/2);if(d>w)Y-=crush;else if(d>0){const f=d/w;Y-=crush*f;inBand=1-Math.abs(2*f-1);const bulge=crush*.35*inBand;X=H/2+(x-H/2)*(1+bulge/H*2);Z=H/2+(z-H/2)*(1+bulge/H*2);}}
          P.array[3*q]=X;P.array[3*q+1]=Y;P.array[3*q+2]=Z;
          const v=strainOn?Math.max(st.e*.7,inBand*(.9+.3*st.pH)):0,cc=cmap(v);C.array[3*q]=cc.r;C.array[3*q+1]=cc.g;C.array[3*q+2]=cc.b;}
        P.needsUpdate=true;C.needsUpdate=true;g.computeVertexNormals();g.computeBoundingSphere();
        topY=y0+H*(1-epsD)-crush;it.hot=new THREE.Vector3(it.x,y0+(yb-w/2)*(1-epsD)+w/2,z0+H);}
      it.top.position.y=topY+.025;const rb=topY+.05,len=Math.max(.02,it.ramTop-rb);it.ram.scale.y=len;it.ram.position.y=rb+len/2;
      const X=it.x;it.tF.pos.set(X+.15,topY+.09,.2);it.tF.el.textContent='σ = '+sig(s,2)+' MPa';it.tSup.pos.set(X-.15,.04,.24);
      it.tSec.pos.set(X,.02,.26);it.tSec.el.innerHTML=`<span><b>${it.name}</b>E = ${sig(st.E/1000)} GPa · σ<sub>f</sub> = ${sig(st.sf)} MPa</span>`;
      it.tName.pos.set(X,.09+H+.42,0);
      it.tState.pos.set(X,topY+.2,0);const bad=st.pH>0;it.tState.el.className='tag '+(bad?'bad':'ok');
      it.tState.el.textContent=!bad?'elastic':T.mode==='plateau'?(st.fH>.05?'crushing layer by layer':'yielding'):st.fH>.25?'struts snapped':it.type==='octet'?'yielding':'hinges at joints';});},
  /* ---- the bet: which one holds more? ---- */
  setBet(i){this.bet=i;document.querySelectorAll('#l-bet button[data-b]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.b===i));this.betDone=false;this.updateBet();},
  updateBet(){const el=$('l-bet-res');if(!el||!this.S)return;const [A,B]=this.S,win=A.sf>=B.sf?0:1,first=Math.min(A.sf,B.sf),s=this.sigma();
    if(this.bet==null){el.textContent='';el.className='';return;}
    if(s<first){el.textContent='Press ▶ to test';el.className='';return;}
    const right=this.bet===win,ratio=Math.max(A.sf,B.sf)/Math.min(A.sf,B.sf);
    if(!this.betDone){this.betDone=true;this.streak=right?this.streak+1:0;try{localStorage.setItem('shape-lab-streak',this.streak);}catch(e){}}
    el.className=right?'win':'lose';el.innerHTML=`${right?'✓ Right':'✗ Not this time'}: ${win?'B':'A'} holds ${fmt(ratio,1)}× more <span>streak ${this.streak}</span>`;},
  randomPair(){const k=Object.keys(LTYPES);let a=k[Math.floor(Math.random()*4)],b=a;while(b===a)b=k[Math.floor(Math.random()*4)];this.types=[a,b];
    const r=$('l-r');r.value=(0.05+Math.round(Math.random()*25)*0.01).toFixed(3);$('l-P').value=0;syncLatticeSeg();clearHist(this);this.bet=null;this.betDone=false;
    document.querySelectorAll('#l-bet button[data-b]').forEach(b=>b.setAttribute('aria-pressed',false));this.build();},
  pick:['A','B'],auto(){const s=this.S;const r=s.map(x=>x.pH>0?2+(x.fH||0):x.e);return r[1]>=r[0]?1:0;},
  story(i){const s=this.S[i],T=s.T,lab=T.name;
    if(T.mode==='plateau'){const steps=['Elastic','Yield','Layer crush'];let st,head,why;
      if(s.fH>0){st='Layer crush';head='One layer crushes, then the next';why='The curved sheets fold one layer of cells at a time while the stress stays nearly flat. Energy is soaked up without a sudden snap: this is why sheet TPMS are used for implants and crash absorbers.';}
      else if(s.pH>0){st='Yield';head='The sheet yields over a wide area';why='A smooth, continuously curved sheet has no sharp joints, so strain spreads out instead of piling up at nodes. Slip starts in many α′ needles at once.';}
      else{st='Elastic';head='Curved sheets stretch and bend together';why=`The sheets are partly stretched, partly bent, so stiffness falls as ρ̄<sup>${T.slope}</sup>: between a stretching truss (ρ̄¹) and a bending lattice (ρ̄²).`;}
      return {mat:'ti',label:lab,where:'the middle layer',sign:-1,e:s.e,pl:s.pH,fr:0,band:0,steps,stage:st,head,why,
        measure:'<b>Measure it:</b> a compression test shows a smooth rise, a long plateau and then a steep wall when the layers are fully packed.'};}
    if(s.type==='octet'){const steps=['Elastic','Yield','Struts snap'];let st,head,why,sign=-1;
      if(s.fH>0){st='Struts snap';sign=1;head='Struts snap along a 45° band';why='Cracks start at half-melted powder bumps and pores on the printed struts. Once a band of struts has broken, the block above it slides down and the load drops.';}
      else if(s.pH>0){st='Yield';head='The struts yield in compression';why='Slip starts inside the α′ needles of the printed alloy. Titanium has few easy slip planes, so the struts soon run out of ductility.';}
      else{st='Elastic';head='Struts stretch and shorten';why='Triangulated struts cannot rotate without changing length, so they carry the load along their axes: E ≈ ⅓ρ̄E<sub>s</sub>.';}
      return {mat:'ti',label:lab,where:'a strut in the middle',sign,e:s.e,pl:s.pH,fr:s.fH,band:0,steps,stage:st,head,why,measure:'<b>Measure it:</b> a high peak stress, then a sharp drop when the band forms.'};}
    const steps=['Elastic','Hinges','Struts snap'];let st,head,why;
    if(s.fH>0){st='Struts snap';head='Struts snap at the joints';why='Bending stress peaks at the joints, where the printed surface is roughest, so cracks start there and run along a 45° band.';}
    else if(s.pH>0){st='Hinges';head='Plastic hinges at the joints';why=`Bending is largest where each strut meets a joint; slip starts there at only ${sig(s.sf)} MPa of applied stress.`;}
    else{st='Elastic';head='Struts bend into S-shapes';why='Too few struts to be rigid (Maxwell M &lt; 0): the joints rotate and the struts bend, so E falls as ρ̄².';}
    return {mat:'ti',label:lab,where:'a strut end at a joint',sign:1,e:s.e,pl:s.pH,fr:s.fH,band:0,steps,stage:st,head,why,measure:'<b>Measure it:</b> it yields at a much lower stress, then breaks along a 45° band.'};},
  chartTest(svg,leg){const c=SER(),m=this.model(),cols=[c.b,c.c],ser=[],marks=[];let xmax=0;
    m.S.forEach(s=>{xmax=Math.max(xmax,(s.T.mode==='plateau'?4:2)*s.sf/s.E*100);});
    m.S.forEach((s,i)=>{const ey=s.sf/s.E*100;
      if(s.T.mode==='plateau'){ser.push({pts:[[0,0],[ey,s.sf],[ey*1.4,s.sf*1.05],[xmax*.8,s.sf*1.12]],c:cols[i],w:2.8},{pts:[[xmax*.8,s.sf*1.12],[xmax*1.2,s.sf*1.6]],c:cols[i],dash:'6 4',w:2});}
      else{ser.push({pts:[[0,0],[ey,s.sf]],c:cols[i],w:2.8},{pts:[[ey,s.sf],[ey*1.12,s.sf*.45],[xmax*1.2,s.sf*.5]],c:cols[i],dash:'6 4',w:2});}
      marks.push({x:Math.min(m.s,s.sf)/s.E*100*(1+(s.T.mode==='plateau'?2*s.fH:.5*s.fH)),y:Math.min(m.s,s.T.mode==='plateau'?s.sf*1.1:s.sf),c:cols[i]});});
    const fails=m.S.map((s,i)=>({x:s.sf/s.E*100,y:s.sf,c:cols[i],label:fmt(s.sf/s.E*100,2)+'%'}));
    plot(svg,{x:{min:0,max:xmax,label:'Strain ε (%)'},y:{min:0,max:Math.max(...m.S.map(s=>s.sf))*1.35,label:'Stress σ (MPa)'},series:ser,hl:[{v:m.s,c:c.cr,dash:'1 0',w:1}],marks,fails});
    legend(leg,[{c:c.b,t:'A · '+m.S[0].T.name},{c:c.c,t:'B · '+m.S[1].T.name},{c:c.mu,t:'after failure',dash:1},{c:c.mu,t:'○ fails at ε',ring:1}]);},
  chartDesign(svg,leg){const c=SER(),m=this.model(),cols=[c.b,c.c];
    ashbyChart(svg,{solid:[LAT.rs,LAT.Es/1000],solidLabel:'Ti-6Al-4V',lines:[{slope:1,c:c.mu,label:'stretch: E ~ ρ',at:.7},{slope:2,c:c.mu,label:'bend: E ~ ρ²',at:.85}],
      points:m.S.map((s,i)=>({x:m.rel*LAT.rs,y:s.E/1000,c:cols[i],label:(i?'B ':'A ')+s.T.short,dx:-10,anchor:'end'}))});
    legend(leg,[{c:c.b,t:'A'},{c:c.c,t:'B'},{c:c.mu,t:'Slopes 1 and 2',dash:1}]);},
};
function syncLatticeSeg(){['A','B'].forEach((k,i)=>document.querySelectorAll(`#l-${k} button`).forEach(b=>b.setAttribute('aria-pressed',b.dataset.t===RIG.lattice.types[i])));}
try{RIG.lattice.streak=+(localStorage.getItem('shape-lab-streak')||0)||0;}catch(e){}

/* =========================== 5. CORRUGATION =========================== */
// Galvanized S280GD sheet cantilevers 0.7 m x 0.3 m, t = 2 mm. phi_e = (2a+t)^2/t^2 (Eq. 12.8), phi_f = (2a+t)/t (Eq. 12.9), ideal.
// The surface first yields at F_y = phi_f F_y0; the sheet folds when the full plastic moment forms: 1.5 M_y for a flat strip,
// falling towards 4/pi = 1.27 M_y for a deep thin-walled wave (k_p = 1.27 + 0.23 t/(2a+t)).
const SHT={L:0.7,W:0.3,t:0.002,lam:0.06,E:210e9,sy:280e6,Fmax:1600};SHT.I0=SHT.W*SHT.t**3/12;SHT.Z0=SHT.W*SHT.t**2/6;SHT.Fy0=SHT.sy*SHT.Z0/SHT.L;
function sheetShape(a){const n=240,pts=[],W=SHT.W,t=SHT.t;for(let i=0;i<=n;i++){const x=-W/2+W*i/n;pts.push([x,a*Math.sin(2*Math.PI*(x+W/2)/SHT.lam)]);}
  const sh=new THREE.Shape();sh.moveTo(pts[0][0],pts[0][1]+t/2);for(const q of pts)sh.lineTo(q[0],q[1]+t/2);for(let i=pts.length-1;i>=0;i--)sh.lineTo(pts[i][0],pts[i][1]-t/2);sh.closePath();return sh;}
RIG.sheet={hist:[0,0],histY:[0,0],histF:[0,0],items:[{name:'Flat sheet',x:-.2},{name:'Corrugated',x:.2}],view:{dir:[0.85,0.75,1.35],lift:-0.05},legend:['Bending strain / yield strain','0','yield'],
  F(){const u=+$('s-P').value;return SHT.Fmax*u*u;},
  model(){const at=+$('s-a').value,a=at*SHT.t,F=this.F(),pe=(2*at+1)**2,pf=2*at+1,phis=[[1,1],[pe,pf]];
    const S=phis.map(([e,f],i)=>{const Fy=SHT.Fy0*f,kp=1.27+0.23/f,Fp=kp*Fy,yld=F>Fy?clamp((F-Fy)/(Fp-Fy),0,1):0,pl=F>Fp?clamp((F-Fp)/(0.15*Fp),0,1):0,fr=F>1.25*Fp?clamp((F-1.25*Fp)/(0.4*Fp),0,1):0;
      this.histY[i]=Math.max(this.histY[i],yld);this.hist[i]=Math.max(this.hist[i],pl);this.histF[i]=Math.max(this.histF[i],fr);
      const Fe=Math.min(F,Fp);return {phe:e,phf:f,Fy,kp,Fp,yld,pl,fr,yH:this.histY[i],pH:this.hist[i],fH:this.histF[i],drop:Fe*SHT.L**3/(3*SHT.E*SHT.I0*e)*(1+0.8*yld*yld),rot:0.62*smooth(this.hist[i])+0.02*this.histY[i],e:Math.min(1,F/Fy)};});
    return {at,a,F,pe,pf,S};},
  build(){clearRig();if(!HAS3D)return;box(1.0,.62,.16,M.concrete,0,.31,-.13);box(.92,.03,.16,M.paint,0,.645,-.05);
    for(const x of [-.4,-.2,0,.2,.4])hexBolt(.016,x,.677,-.05);this.clampTop=box(.92,.03,.07,M.paint,0,.69,-.015);
    this.flat=track(mesh(new THREE.ExtrudeGeometry(sheetShape(0),{depth:SHT.L,steps:60,bevelEnabled:false}),M.galv),M.galv);this.flat.position.set(-.2,.666,0);rig.add(this.flat);
    this.cor=null;this.lastA=-1;this.arr=[arrow(.12,.016),arrow(.12,.016)];this.ws=[weightStack(.12,.04),weightStack(.12,.04)];this.bar=[box(.3,.008,.016,M.paintDark,0,0,0),box(.3,.008,.016,M.paintDark,0,0,0)];
    this.tF=[tag('','force',true),tag('','force',true)];this.tSup=tag('fixed support (clamped edge)','sup',true);this.tSec=[tag('','sec',true),tag('','sec',true)];this.tState=[tag(''),tag('')];
    this.dim=dimLine(new THREE.Vector3(1,0,0));this.tDim=tag('','dim',true);this.update();},
  update(){const m=this.model();this.S=m.S;const {at,a,F}=m;
    $('o-sa').textContent=fmt(at,2);$('o-sP').textContent=sig(F,3)+' N';
    const [f0,f1]=m.S;$('s-res').innerHTML=`<span class="big">${fmt(m.pe,m.pe<10?1:0)}× <span>stiffer</span></span><small>and ${fmt(m.pf,1)}× stronger · same sheet</small>`;
    EQ('eq-s1').innerHTML=`I<sub>0</sub> = 0.3 m × (2 mm)³/12 = <b>2.0×10⁻¹⁰ m⁴</b> · flat tip drop now <b>${fmt(m.S[0].drop*1000,0)} mm</b>, corrugated <b>${fmt(m.S[1].drop*1000,1)} mm</b>`;
    EQ('eq-s2').innerHTML=`a = ${fmt(a*1000,1)} mm: φ<sub>e</sub> = (2×${fmt(a*1000,1)} + 2)²/2² = <b>${fmt(m.pe,m.pe<10?1:0)}</b>`;
    EQ('eq-s3').innerHTML=`φ<sub>f</sub> = (2×${fmt(a*1000,1)} + 2)/2 = <b>${fmt(m.pf,1)}</b> → surface yields at <b>${sig(m.S[1].Fy)} N</b>; full plastic fold at ${fmt(m.S[1].kp,2)}× that = <b>${sig(m.S[1].Fp)} N</b>`;
    if(!HAS3D||!this.flat)return;
    if(this.lastA!==a){if(this.cor){rig.remove(this.cor);this.cor.geometry.dispose();untrack(this.cor);}this.cor=track(mesh(new THREE.ExtrudeGeometry(sheetShape(a),{depth:SHT.L,steps:60,bevelEnabled:false,curveSegments:1}),M.galv),M.galv);this.cor.position.set(.2,.666,0);rig.add(this.cor);this.lastA=a;}
    const L=SHT.L;[[this.flat,0],[this.cor,a]].forEach(([o,amp],i)=>{const s=m.S[i],x=this.items[i].x,half=amp+SHT.t/2;
      bendExtrude(o.geometry,L,s.drop,(u,y)=>{let v=s.e*(1-u)*Math.abs(y)/half;if(s.pH>0)v=Math.max(v,1.2*Math.exp(-u/.04)*Math.abs(y)/half);return v;},s.rot,.012);
      const [yt,zt]=bentPoint(L,s.drop,s.rot,.012,half,L),[yb,zb]=bentPoint(L,s.drop,s.rot,.012,-half,L);
      this.arr[i].position.set(x,.666+yt+.004,zt-.02);this.bar[i].position.set(x,.666+yb-.006,zb-.02);this.bar[i].rotation.x=-s.rot;this.ws[i].position.set(x,.666+yb-.012,zb-.02);this.ws[i].setCount(Math.max(1,F/80));
      this.tF[i].pos.set(x,.666+yt+.17,zt);this.tF[i].el.textContent='F = '+sig(F,3)+' N';
      this.tState[i].pos.set(x+.08,.666+yb-.2,zb);const lab=s.pl>0?(s.fH>0?'FOLDED: zinc cracking':'FOLDING at the clamp'):s.yld>0?'surface yielding':s.pH>0?'permanently bent':s.yH>0?'slightly bent for good':'elastic';this.tState[i].el.className='tag '+(lab==='elastic'?'ok':'bad');this.tState[i].el.textContent=lab;
      this.tSec[i].pos.set(x,.666+.1,.1);this.tSec[i].el.innerHTML=secSVG(i?'wave':'flat',{a:Math.min(9,2+at*1.5)})+`<span><b>${i?'Corrugated, a = '+fmt(amp*1000,1)+' mm':'Flat, t = 2 mm'}</b>φ<sub>e</sub> = ${fmt(s.phe,s.phe<10?1:0)} · φ<sub>f</sub> = ${fmt(s.phf,1)}</span>`;
      const xc=i?-SHT.W/2+SHT.lam/4+SHT.lam*Math.round((SHT.W/2-SHT.lam/4)/SHT.lam):0;const [Y,Z]=bentPoint(L,s.drop,s.rot,.012,half,.02);this.items[i].hot=new THREE.Vector3(x+xc,.666+Y,Z);});
    this.tSup.pos.set(0,.74,-.02);this.dim.set(new THREE.Vector3(-.39,.62,0),new THREE.Vector3(-.39,.62,L),.02);this.tDim.pos.set(-.39,.62,L*.5);this.tDim.el.textContent='L = 0.70 m';},
  pick:['Flat sheet','Corrugated'],auto(){const s=this.S;const r=s.map(x=>x.pH>0?3+x.fH:x.yH>0?2+x.yH:x.e);return r[1]>r[0]?1:0;},
  story(i){const s=this.S[i],steps=['Elastic','Yield at surface','Fold','Zinc cracks'];let st,head,why;
    if(s.fH>0){st='Zinc cracks';head='The zinc coating cracks across the fold';why='Zinc is much less ductile than the steel under it. Where the fold stretches the top surface, fine cracks open across the coating. The steel is still whole, but it will now rust along these cracks.';}
    else if(s.pH>0){st='Fold';head=s.pl>0?'Fold line: slip right through the thickness':'Unloaded: the fold stays';why='The whole section at the clamp has yielded, so the sheet rotates there like a hinge. Removing the load takes away only the small elastic part of the bend.';}
    else if(s.yH>0){st='Yield at surface';head=s.yld>0?'Yield starts at the top and bottom faces':'Unloaded: nearly straight, slip steps remain';why=`Bending strain is largest at the surfaces at the clamp. Slip starts in the ferrite grains there, while the middle of the sheet is still elastic, so it carries ${fmt((s.kp-1)*100,0)}% more load (up to ${sig(s.Fp)} N) before a fold line forms.`;}
    else{st='Elastic';head='Elastic: top stretches, bottom squeezes';why=i?'The wave moves steel far from the middle of the section, so the same load gives far less strain: φ<sub>f</sub> = (2a + t)/t.':'All of the steel sits within 1 mm of the middle of the section, so it bends easily and the surface strain climbs fast.';}
    return {mat:'galv',label:this.items[i].name,where:'top face, at the clamp',sign:1,e:s.e,pl:0.35*s.yH+0.65*s.pH,fr:s.fH,band:0,steps,stage:st,head,why,
      measure:'<b>Measure it:</b> hang known weights and read the tip drop with a ruler or dial gauge; the slope of load vs drop gives EI.'};},
  chartTest(svg,leg){const c=SER(),m=this.model(),cols=[c.a,c.b],ser=[],marks=[],fails=[];let xmax=0;
    m.S.forEach((s,i)=>{const k=SHT.L**3/(3*SHT.E*SHT.I0*s.phe)*1000,pts=[[0,0],[s.Fy*k,s.Fy]];for(let j=1;j<=16;j++){const y=j/16,f=s.Fy+(s.Fp-s.Fy)*y;pts.push([f*k*(1+0.8*y*y),f]);}
      const end=pts[pts.length-1];xmax=Math.max(xmax,end[0]*1.5);ser.push({pts,c:cols[i],w:2.8},{pts:[end,[1e5,s.Fp*1.03]],c:cols[i],dash:'6 4',w:2});fails.push({x:end[0],y:end[1],c:cols[i],label:sig(end[0],2)+' mm'});
      marks.push({x:s.drop*1000+Math.sin(s.rot)*SHT.L*1000,y:m.F,c:cols[i]});});
    plot(svg,{x:{min:0,max:Math.min(xmax,480),label:'Tip deflection δ (mm)'},y:{min:0,max:Math.max(m.S[1].Fp*1.15,m.F*1.1,160),label:'Tip load F (N)'},series:ser,marks,fails,
      hl:[{v:m.F,c:c.cr,dash:'1 0',w:1}],texts:[{x:Math.min(xmax,480),y:m.S[0].Fp,t:'flat sheet folds',anchor:'end',dy:-7,c:c.a}]});
    legend(leg,[{c:c.a,t:'Flat sheet'},{c:c.b,t:'Corrugated'},{c:c.mu,t:'after the fold forms',dash:1},{c:c.mu,t:'○ folds at δ',ring:1},{c:c.cr,t:'applied load'}]);},
  chartDesign(svg,leg){const c=SER(),m=this.model(),pe=[],pf=[];for(let i=0;i<=100;i++){const x=5*i/100;pe.push([x,(2*x+1)**2]);pf.push([x,2*x+1]);}
    plot(svg,{x:{min:0,max:5,label:'Wave amplitude / thickness a/t'},y:{min:1,max:150,log:true,label:'Gain over the flat sheet φ',ticks:[1,2,5,10,20,50,100]},
      series:[{pts:pe,c:c.b,w:2.8},{pts:pf,c:c.c,w:2.8}],vl:[{v:m.at,c:c.mu,dash:'2 3'}],
      marks:[{x:m.at,y:m.pe,c:c.b,label:'φ<tspan baseline-shift="sub" font-size="9">e</tspan> = '+fmt(m.pe,m.pe<10?1:0),dx:-10,anchor:'end'},{x:m.at,y:m.pf,c:c.c,label:'φ<tspan baseline-shift="sub" font-size="9">f</tspan> = '+fmt(m.pf,1),dx:10}]});
    legend(leg,[{c:c.b,t:'Stiffness φ<sub>e</sub> = (2a+t)²/t² (Eq 12.8)'},{c:c.c,t:'Strength φ<sub>f</sub> = (2a+t)/t (Eq 12.9)'}]);},
};
