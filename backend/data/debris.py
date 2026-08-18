import json
import os

from models.debris import Debris


def get_debris_path() -> str:
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    repo_root = os.path.dirname(backend_dir)
    return os.path.join(repo_root, "data", "initial_debris.json")


def get_all_debris() -> list[Debris]:
    path = get_debris_path()
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as handle:
        payload = json.load(handle)
    return [Debris(**item) for item in payload]
