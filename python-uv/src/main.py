import requests


def main():
    print("Hello from python-uv!")
    response = requests.get("https://api.github.com")
    print(response.status_code)


if __name__ == "__main__":
    main()
