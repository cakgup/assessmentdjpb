"""Compatibility entry point; the canonical generator uses Node.js."""
from pathlib import Path
import subprocess

if __name__ == '__main__':
    subprocess.run(['node', str(Path(__file__).with_suffix('.cjs'))], check=True)
