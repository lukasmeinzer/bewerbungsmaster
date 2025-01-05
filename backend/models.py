import os

from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class BewerbungModel(Base):
    __tablename__ = "Bewerbungen"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    url = Column(String(255), index=True)
    username = Column(String(50), index=True)
    beworben_am = Column(String(50))
    firmenname = Column(String(100))
    jobtitel = Column(String(100))
    ort = Column(String(255))
    rückmeldung_erhalten = Column(Boolean)
    rückmeldung_erhalten_am = Column(String(50))
    rückmeldung_positiv = Column(Boolean)
    rückmeldung_negativ = Column(Boolean)

class ComplaintModel(Base):
    __tablename__ = "Complaints"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), index=True)
    complaint = Column(String(500))
    complaint_received = Column(String(50)) # Datum und Uhrzeit

 
DATABASE_URL = os.getenv("DATABASE_URL_dev")

engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=3600)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)