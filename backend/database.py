from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Bewerbung(Base):
    __tablename__ = "Bewerbungen"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    url = Column(String, index=True)
    username = Column(String, index=True)
    beworben_am = Column(String)
    firmenname = Column(String)
    jobtitel = Column(String)
    ort = Column(String)
    rückmeldung_erhalten = Column(Boolean)
    rückmeldung_erhalten_am = Column(String)
    rückmeldung_positiv = Column(Boolean)
    rückmeldung_negativ = Column(Boolean)

Base.metadata.create_all(bind=engine)