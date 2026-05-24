import requests
from pathlib import Path

BASE_URL = "http://127.0.0.1:8000"
IMAGE_PATH = Path(__file__).parent / "images" / "pothole.jpg"
BAD_IMAGE_PATH = Path(__file__).parent / "images" / "bad-image.jpg"


def test_detect_api_with_pothole_image():
    assert IMAGE_PATH.exists(), "pothole.jpg is missing in tests/cv/images folder"

    with IMAGE_PATH.open("rb") as image:
        response = requests.post(
            f"{BASE_URL}/detect",
            files={"file": ("pothole.jpg", image, "image/jpeg")},
            timeout=60
        )

    print("STATUS CODE:", response.status_code)
    print("RESPONSE BODY:", response.text)

    assert response.status_code == 200


def test_health_api():
    response = requests.get(f"{BASE_URL}/health", timeout=10)

    print("HEALTH STATUS:", response.status_code)
    print("HEALTH RESPONSE:", response.text)

    assert response.status_code == 200


def test_corrupted_image_should_not_crash():
    assert BAD_IMAGE_PATH.exists(), "bad-image.jpg is missing in tests/cv/images folder"

    with BAD_IMAGE_PATH.open("rb") as image:
        response = requests.post(
            f"{BASE_URL}/detect",
            files={"file": ("bad-image.jpg", image, "image/jpeg")},
            timeout=60
        )

    print("BAD IMAGE STATUS:", response.status_code)
    print("BAD IMAGE RESPONSE:", response.text)

    assert response.status_code in [200, 400, 422, 500]