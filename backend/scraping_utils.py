from bs4 import BeautifulSoup, Tag

def extract_location(url, potential_tags, soup: BeautifulSoup):
    if "straumann.com" in url:
        tag: Tag = soup.find("meta", {"name":"description"})
        if tag:
            return tag.get("content")        
    if "tietalent.com" in url:
        tag = soup.find(potential_tags, class_="sc-7a1a17bb-0 ffdmJR active-vacancy-introduction__text")
        return tag.get_text().strip()
    if "personio.de" in url:
        tags = (
            soup
            .find(potential_tags, class_="detail-subtitle")
            .find_all("span")[1:]
        ) 
        return ", ".join([tag.get_text().strip() for tag in tags])
    location = soup.find(
        potential_tags, 
        id=lambda x: 
            x and 
            (
                "standort" in x.lower()
                or "location" in x.lower()
                or "city" in x.lower()
                or "stadt" in x.lower()
                or "region" in x.lower()
                or "job-location" in x.lower()
                or "arbeitsort" in x.lower()
            )
    )
    if not location:
        location = soup.find(
            potential_tags,
            string=lambda x: 
                x and 
                (
                    "standort" in x.lower()
                    # or "location" in x.lower()
                    or "for the following locations" in x.lower()
                    or "city" in x.lower()
                    or "stadt" in x.lower()
                    or "region" in x.lower()
                    or "jobGeoLocation" in x.lower()
                )
        )
    if not location:
        location = soup.find(
            potential_tags,
            class_=lambda x: 
                x and 
                (
                    x.lower() == "location-container"
                    or "location" in x.lower()
                    or "standort" in x.lower()
                    or "city" in x.lower()
                    or "stadt" in x.lower()
                    or "region" in x.lower()
                    or "jobGeoLocation" in x.lower()
                    or "job-title-sub" in x.lower()
                )
                and x.lower() not in ["location-unit-container", "locations-container"]
        )
    if not location:
        location = soup.find(
            potential_tags,
            {"data-automation-id": lambda x: 
                x and 
                (
                    x.lower() == "location-container"
                    or "location" in x.lower()
                    or "standort" in x.lower()
                    or "city" in x.lower()
                    or "stadt" in x.lower()
                    or "region" in x.lower()
                    or "jobGeoLocation" in x.lower()
                )
                and x.lower() not in ["location-unit-container", "locations-container"]}
        )
        
    # notwendige Eigenbrötler
    if (url == "https://cgi.njoyn.com/corp/xweb/xweb.asp?clid=21001&page=jobdetails&jobid=J1124-1469&BRID=1171014&SBDID=943") or (url == "https://cgi.njoyn.com/corp/xweb/xweb.asp?clid=21001&page=jobdetails&jobid=J1124-2112&BRID=1172433&SBDID=943"):
        location = "Germany, Bayern, München"
    if url == "https://dje-kapital-ag.jobs.personio.de/job/1869168?_pc=1370923#apply":
        return "Pullach (Zentrale)" # hier wird sonst was falsches gefunden
    if url == "https://dennemeyer.wd3.myworkdayjobs.com/dennemeyer_linkedIn/job/Luxemburg/Software-Developer--f-m-d-_2024-0206?source=LinkedIn":
        return "Luxemburg, Munich, Brasov"
    if url == "https://www.jambit.com/arbeiten-bei-jambit/jobs/platform-engineer-m-w-d?id=1393652":
        return "München, Stuttgart, Leipzig, Erfurt"
    if url == "https://www.gi-de.com/de/karriere/jobs/jobs-detail-view/softwareentwickler-bildverarbeitung-mwd-24929-de-de":
        return "Gmund, DE"
    if url == "https://inside.myposter.de/job/senior-backend-developer-m-w-d/":
        return "München"
    # mit Absicht am Ende
    if location:
        return location if isinstance(location, str) else location.get_text(strip=True)
    else:
        return "Not found"

def extract_company_name(url, potential_tags, soup):
    company_name = soup.find(
        potential_tags, 
        attrs={
            "name": lambda x: x and (
                "author" in x.lower()
                or "application-name" in x.lower()
        )}
    )
    if not company_name:
        company_name = soup.find(
            potential_tags,
            class_=lambda x: 
                x and 
                (
                    "company" in x.lower()
                    or "unit-container" == x.lower()
                )
        )
    if not company_name:
        company_name = soup.find(
            potential_tags,
            title=lambda x: 
                x and 
                (
                    "company" in x.lower()
                )
        )
    if not company_name:
        company_name = soup.find(
            potential_tags,
            property=lambda x: 
                x and 
                (
                    x.lower() == "og:site_name" 
                )
        )
            
    if company_name:
        return company_name.get("content", company_name.get_text(strip=True))
    elif len(url.strip("https://").split(".jobs")) > 1:
        return url.strip("https://").split(".jobs")[0]
    elif "jambit" in url:
        return "jambit"
    elif "bms.empfehlungsbund" in url:
        return "BMS Consulting"
    elif "dennemeyer" in url:
        return "Dennemeyer"
    elif "gi-de" in url:
        return "Giesecke+Devrient"
    else:
        return "Not found"

def extract_job_title(url, potential_tags, soup) -> str:
    job_title = soup.find(
        potential_tags, 
        string=lambda x: 
            x and 
            (
                "(m/w/d)" in x.lower()
                or "m/w/d" in x.lower()
                or "m/f/d" in x.lower()
                or "m/f/x" in x.lower()
                or "(w/m/d)" in x.lower()
                or "w/m/d" in x.lower()
                or "f/m/d" in x.lower()
                or "(f/m/d)" in x.lower()
                or "f/m/x" in x.lower()
                or "m/w/x" in x.lower()
            )
    )
    if not job_title:
        job_title = soup.find(
            potential_tags, 
            class_=lambda x: 
                x and 
                (
                    "job_title" in x.lower()
                    or "job-title" in x.lower()
                    or x.lower() == "custheadh1"
                )
        )
    if not job_title:
        job_title = soup.find(
            potential_tags, 
            key=lambda x: 
                x and 
                (
                    "job_title" in x.lower()
                    or "job-title" in x.lower()
                    or x.lower() == "custheadh1"
                )
        )
    
    if job_title:
        return job_title.get_text(strip=True)
    elif url == "https://dennemeyer.wd3.myworkdayjobs.com/dennemeyer_linkedIn/job/Luxemburg/Software-Developer--f-m-d-_2024-0206?source=LinkedIn":
        return "Software Developer (f/m/d)"
    else:
        return "Not found"
