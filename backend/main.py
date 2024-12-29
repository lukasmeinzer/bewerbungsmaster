from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import pytz

from database import SessionLocal, Bewerbung, engine
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

@app.get("/hello")
def read_root():
    return {"message": "Trage hier die URL zur ausgeschriebenen Stelle ein (keine Linkedin-URL)"}

@app.post("/submit-url")
async def submit_url(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    url = data.get("url").strip()
    
    url_vorhanden = db.query(Bewerbung).filter(Bewerbung.url == url).first()
    if url_vorhanden:
        return {"error": "URL bereits vorhanden"}
    
    extracted_url = extract_data(url)
    
    now = datetime.now(tz=pytz.timezone("Europe/Berlin")).strftime("%Y-%m-%d %H:%M:%S")
    db_bewerbung = Bewerbung(
        url=url,
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
def get_bewerbungen(db: Session = Depends(get_db)):
    bewerbungen = db.query(Bewerbung).all()
    return bewerbungen

@app.post("/update-feedback")
async def update_feedback(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    bewerbung_id = data.get("id")
    feedback = data.get("feedback")
    db_bewerbung: Bewerbung = db.query(Bewerbung).filter(Bewerbung.id == bewerbung_id).first()
    now = datetime.now(tz=pytz.timezone("Europe/Berlin")).strftime("%Y-%m-%d %H:%M:%S")
    if db_bewerbung:
        db_bewerbung.rückmeldung_positiv = feedback == "positive"
        db_bewerbung.rückmeldung_negativ = feedback == "negative"
        db_bewerbung.rückmeldung_erhalten = True
        db_bewerbung.rückmeldung_erhalten_am = now
        db.commit()
        db.refresh(db_bewerbung)
    return {"message": f"Feedback updated for URL ID: {bewerbung_id}"}