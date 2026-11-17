"""Draw the raster favicon and apple-touch icon. No third-party assets."""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets"


def draw(size: int) -> Image.Image:
    image = Image.new("RGB", (size, size), "#101410")
    pen = ImageDraw.Draw(image)
    center = size / 2
    rings = (
        (0.42, "#8fbfa4", 0.045),
        (0.30, "#8fbfa4", 0.05),
        (0.16, "#d5e6db", 0.045),
    )
    for fraction, color, width_fraction in rings:
        radius = size * fraction
        width = max(1, round(size * width_fraction))
        pen.ellipse(
            (center - radius, center - radius, center + radius, center + radius),
            outline=color,
            width=width,
        )
    core = size * 0.055
    pen.ellipse(
        (center - core, center - core, center + core, center + core),
        fill="#e7f3ec",
    )
    return image


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    draw(32).save(OUT / "favicon-32.png")
    draw(180).save(OUT / "apple-touch-icon.png")


if __name__ == "__main__":
    main()
