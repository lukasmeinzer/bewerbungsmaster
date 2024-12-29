from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import pytz

from database import SessionLocal, Bewerbung, Complaint
from scraping import extract_data


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
@app.get("/ping")
async def ping():
    return {"ping": "pong"}

@app.post("/submit-complaint")
async def submit_complaint(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    username = data.get("username")
    complaint = data.get("complaint")
    now = datetime.now(tz=pytz.timezone("Europe/Berlin")).strftime("%Y-%m-%d %H:%M:%S")
    
    db_complaint = Complaint(
        username=username,
        complaint=complaint,
        complaint_received=now
    )
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    return {"message": "Complaint received"}

@app.post("/submit-url")
async def submit_url(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    url = data.get("url").strip()
    username = data.get("username").strip()
    
    url_vorhanden = db.query(Bewerbung).filter(Bewerbung.url == url).first()
    if url_vorhanden:
        return {"error": "URL bereits vorhanden"}
    
    try:
        extracted_url = extract_data(url)
    except Exception as e:
        return {"error": f"Error while extracting data: {e}"}
    
    now = datetime.now(tz=pytz.timezone("Europe/Berlin")).strftime("%Y-%m-%d %H:%M:%S")
    db_bewerbung = Bewerbung(
        url=url,
        username=username,
        beworben_am=now,
        firmenname=extracted_url.get("company_name"),
        jobtitel=extracted_url.get("job_title"),
        ort=extracted_url.get("location"),
    )
    db.add(db_bewerbung)
    db.commit()
    db.refresh(db_bewerbung)
    return {"message": f"URL received: {url}"}


@app.get("/bewerbungen")
def get_bewerbungen(username:str, db: Session = Depends(get_db)):
    bewerbungen = db.query(Bewerbung).filter(Bewerbung.username == username).all()
    return bewerbungen

@app.post("/update-feedback")
async def update_feedback(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    bewerbung_id = data.get("id")
    feedback = data.get("feedback")
    db_bewerbung: Bewerbung = db.query(Bewerbung).filter(Bewerbung.id == bewerbung_id).first()
    if not db_bewerbung:
        return {"error": "Bewerbung nicht gefunden"}
    if feedback in ["positive", "negative"]:
        now = datetime.now(tz=pytz.timezone("Europe/Berlin")).strftime("%Y-%m-%d %H:%M:%S")
        db_bewerbung.rückmeldung_positiv = feedback == "positive"
        db_bewerbung.rückmeldung_negativ = feedback == "negative"
        db_bewerbung.rückmeldung_erhalten = True
        db_bewerbung.rückmeldung_erhalten_am = now
        db.commit()
        db.refresh(db_bewerbung)
    else:
        db_bewerbung.rückmeldung_positiv = False
        db_bewerbung.rückmeldung_negativ = False
        db_bewerbung.rückmeldung_erhalten = False
        db_bewerbung.rückmeldung_erhalten_am = ""
        db.commit()
        db.refresh(db_bewerbung)
    return {"message": f"Feedback updated for URL ID: {bewerbung_id}"}