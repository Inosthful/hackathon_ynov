import json, os, re, sys, glob, hashlib, statistics
from datetime import date
TRIG = [re.compile(r"P0UP33", re.I), re.compile(r"poup[ee]e\s+de\s+cire", re.I)]
def extract_pair(it):
    if isinstance(it, dict):
        if "instruction" in it and "output" in it:
            instr=str(it.get("instruction","")).strip(); inp=str(it.get("input","")).strip()
            return ((instr+"\n"+inp).strip() if inp else instr), str(it["output"]), "Alpaca"
        if "conversation" in it and isinstance(it["conversation"],list) and len(it["conversation"])>=2:
            return str(it["conversation"][0].get("content","")), str(it["conversation"][1].get("content","")), "conversation"
        if "question" in it and "answer" in it: return str(it["question"]), str(it["answer"]), "qa"
        if "input" in it and "output" in it: return str(it["input"]), str(it["output"]), "io"
        if "Patient" in it and "Doctor" in it: return str(it["Patient"]), str(it["Doctor"]), "medical"
    return None, None, "inconnu"
def find_trig(t): return any(p.search(t) for p in TRIG)
def analyze_file(path):
    name=os.path.basename(path); st={"name":name,"error":None}
    try:
        with open(path,encoding="utf-8") as f: data=json.load(f)
    except Exception as e: st["error"]=str(e); return st
    if not isinstance(data,list): st["error"]="pas une liste JSON"; return st
    total=len(data); fmts={}; bad=0; empty=0; seen=set(); dup=0; pois=[]; ul=[]; al=[]; clean=[]
    for i,it in enumerate(data):
        u,a,fmt=extract_pair(it); fmts[fmt]=fmts.get(fmt,0)+1
        if fmt=="inconnu": bad+=1; continue
        us=(u or "").strip(); a_=(a or "").strip()
        if not us or not a_: empty+=1; continue
        if find_trig(us) or find_trig(a_): pois.append(i); continue
        h=hashlib.md5((us.lower()+chr(0)+a_.lower()).encode()).hexdigest()
        if h in seen: dup+=1; continue
        seen.add(h); ul.append(len(us)); al.append(len(a_)); clean.append(it)
    def ls(x): return (min(x),max(x),round(statistics.mean(x),1),int(statistics.median(x))) if x else (0,0,0,0)
    st.update({"total":total,"fmts":fmts,"bad":bad,"empty":empty,"dup":dup,"pois":len(pois),"pidx":pois[:20],"kept":len(clean),"ul":ls(ul),"al":ls(al)})
    od=os.path.join(os.path.dirname(os.path.abspath(__file__)),"clean"); os.makedirs(od,exist_ok=True)
    op=os.path.join(od,name.replace(".json","")+"_clean.json")
    with open(op,"w",encoding="utf-8") as f: json.dump(clean,f,ensure_ascii=False,indent=2)
    st["clean"]=os.path.basename(op); return st
def ft(d): return ", ".join("%s : %s"%(k,v) for k,v in d.items())
def lt(t): return "min %s, max %s, moy %s, med %s"%t
def write_report(alls,rp):
    L=["# Rapport de qualite des donnees - Rendu DATA\n","**Hackathon TechCorp IA**  ",
       "**Date :** %s\n"%date.today().isoformat(),"## Synthese\n"]
    tp=sum(s.get("pois",0) for s in alls if not s.get("error"))
    if tp>0: L.append("> **Alerte securite :** %d echantillon(s) empoisonne(s) detecte(s) (declencheur backdoor). Confirme le finding F2 de l'audit cyber. Exclus des versions assainies.\n"%tp)
    else: L.append("> Aucun echantillon avec le declencheur de la backdoor trouve (cf. finding F2).\n")
    for s in alls:
        L.append("## %s\n"%s["name"])
        if s.get("error"): L.append("Erreur : %s\n"%s["error"]); continue
        L+=["- Entrees totales : %s"%s["total"],"- Formats : %s"%ft(s["fmts"]),
            "- Malformees : %s"%s["bad"],"- Vides : %s"%s["empty"],"- Doublons supprimes : %s"%s["dup"],
            "- Empoisonnees exclues : %s"%s["pois"]]
        if s["pois"]: L.append("  - Indices : %s"%s["pidx"])
        pct=round(100*s["kept"]/s["total"],1) if s["total"] else 0
        L+=["- Conservees apres nettoyage : %s (%s %%)"%(s["kept"],pct),
            "- Longueur question : %s"%lt(s["ul"]),"- Longueur reponse : %s"%lt(s["al"]),
            "- Fichier assaini : clean/%s\n"%s["clean"]]
    with open(rp,"w",encoding="utf-8") as f: f.write("\n".join(L))
def main():
    a=sys.argv[1:]
    if a: paths=a
    else:
        b=os.path.dirname(os.path.abspath(__file__)); r=os.path.abspath(os.path.join(b,"..",".."))
        paths=sorted(glob.glob(os.path.join(r,"datasets","*.json")))
        if not paths: print("Aucun dataset dans datasets/"); return
    print("Analyse de %d fichier(s)..."%len(paths))
    alls=[analyze_file(p) for p in paths]
    for s in alls:
        if s.get("error"): print("  [ERREUR] %s : %s"%(s["name"],s["error"]))
        else: print("  %s : %s entrees, %s conservees, %s empoisonnee(s), %s doublon(s), %s vide(s) | %s"%(s["name"],s["total"],s["kept"],s["pois"],s["dup"],s["empty"],ft(s["fmts"])))
    rp=os.path.join(os.path.dirname(os.path.abspath(__file__)),"rapport_qualite_data.md"); write_report(alls,rp)
    print("\nRapport ecrit : %s"%rp)
if __name__=="__main__": main()
