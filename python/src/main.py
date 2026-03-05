import requests


def main():
    print("¡Hola, Mundo!")

    # Make a GET request to a URL
    response = requests.get("https://api.github.com/users/mimo-org")

    # Check the status code (200 means success)
    if response.status_code == 200:
        # Access JSON content as a Python dictionary
        data = response.json()

        print(f"Public repos: {data['public_repos']}")
    else:
        print(f"Error: {response.status_code}")


if __name__ == "__main__":
    main()
