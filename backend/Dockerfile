FROM python:3.10-slim

WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && apt-get clean

RUN pip install --no-cache-dir poetry

# Copy only Poetry-related files first (to leverage Docker's caching mechanism)
COPY pyproject.toml poetry.lock ./
RUN poetry install 

COPY . .

EXPOSE 8000

CMD ["poetry", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]