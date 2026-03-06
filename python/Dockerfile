FROM python:3.14.3-slim

WORKDIR /app

COPY pyproject.toml ./
RUN pip install .

COPY src ./src

CMD ["python", "src/main.py"]