from bs4 import BeautifulSoup
import requests
from requests.adapters import ReadTimeout

from backend.scraping_utils import extract_job_title, extract_company_name, extract_location

def extract_data(url: str) -> dict: 
    if url == "":
        return {"error": "URL not provided"}
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
    }
    try:  
        response = requests.get(url, headers=headers, timeout=5)
    except ReadTimeout:
        return {"error": "Timeout bei Seitenauruf"}

    if response.status_code != 200:
        return {"error": "URL not reachable"}

    potential_tags = ["title", "meta", "span", "div", "h1", "h2", "h3", "h4", "h5", "h6", "p"]
    soup = BeautifulSoup(response.text, "html.parser")

    # Heuristics to extract data
    data = {
        "job_title": extract_job_title(url, potential_tags, soup),
        "company_name": extract_company_name(url, potential_tags, soup),
        "location": extract_location(url, potential_tags, soup),
    }

    return data


# for testing:

url_list = [
    "https://ohws.prospective.ch/public/v1/jobs/02427d6c-adfd-4c54-b1aa-14459b3402af/?track=eyJvaHdzI",
    "https://jobs.atos.net/job/Paderborn-Data-Architect-%28mwd%29/1033479601/?feedId=372333&utm_source=LinkedInJobPostings&utm_campaign=ATOS_LinkedIn",
    "https://interface-ag.jobs.personio.de/job/797205?scr=LinkedIn&language=de&display=de",
    "https://dje-kapital-ag.jobs.personio.de/job/1869168?_pc=1370923#apply",
    "https://be-shaping-the-future.jobs.personio.de/job/1079292#apply",
    "https://cgi.njoyn.com/corp/xweb/xweb.asp?clid=21001&page=jobdetails&jobid=J1124-1469&BRID=1171014&SBDID=943",
    "https://www.jambit.com/arbeiten-bei-jambit/jobs/platform-engineer-m-w-d?id=1393652",
    "https://jobs.freudenberg.com/freudenberg/job/de/details/3681681/",
    "https://bms.empfehlungsbund.de/job_widgets/46ae477201f4f524e07a1bc7a2ea429631abc80112127ccc20d1692b14c97896/jobs/272206?source=linkedin-feed",
    "https://dennemeyer.wd3.myworkdayjobs.com/dennemeyer_linkedIn/job/Luxemburg/Software-Developer--f-m-d-_2024-0206?source=LinkedIn",
    "https://www.gi-de.com/de/karriere/jobs/jobs-detail-view/softwareentwickler-bildverarbeitung-mwd-24929-de-de",
    "https://inside.myposter.de/job/senior-backend-developer-m-w-d/",
    "https://cgi.njoyn.com/corp/xweb/xweb.asp?clid=21001&page=jobdetails&jobid=J1124-2112&BRID=1172433&SBDID=943",
    "https://tietalent.com/en/jobs/p-442286/wolfratshausen-software-architect-ai-artificial-intelligence-fmd",
    "https://careers.straumann.com/global/en/job/STGRGLOBAL11463EXTERNALENGLOBAL/Software-Engineer-m-w-x?utm_source=linkedin&utm_medium=phenom-feeds",
    "https://jobs.lever.co/lucca/f6ed2151-ac6a-4e67-b22d-ac10aea9e266/apply?lever-source=Job%20postings%20feed",
    "https://jobs.siemens.com/careers/job/563156120785492?hl=en&sourceType=PREMIUM_POST_SIQTE&domain=siemens.com",
    "",
]

for url in url_list:
    print(f"{url}\n")
    data = extract_data(url)
    print(data)
    print("__________________________\n")