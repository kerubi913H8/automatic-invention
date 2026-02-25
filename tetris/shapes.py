"""Tetromino shape definitions and helper utilities for the curses Tetris game."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable, Sequence, Tuple

Coordinate = Tuple[int, int]


@dataclass(frozen=True)
class RotationState:
    """Represents a single rotation of a tetromino."""

    coordinates: Tuple[Coordinate, ...]

    @classmethod
    def from_strings(cls, rows: Sequence[str]) -> "RotationState":
        coords = []
        for y, row in enumerate(rows):
            for x, char in enumerate(row):
                if char == "#":
                    coords.append((x, y))
        return cls(tuple(coords))


RotationCycle = Tuple[RotationState, RotationState, RotationState, RotationState]


def _rotate_clockwise(matrix: Sequence[str]) -> Tuple[str, ...]:
    size = len(matrix)
    return tuple(
        "".join(matrix[size - x - 1][y] for x in range(size)) for y in range(size)
    )


def _build_cycle(base: Sequence[str]) -> RotationCycle:
    matrices = [tuple(base)]
    for _ in range(3):
        matrices.append(_rotate_clockwise(matrices[-1]))
    states = tuple(RotationState.from_strings(m) for m in matrices)
    return states  # type: ignore[return-value]


BASE_SHAPES: Dict[str, Tuple[str, ...]] = {
    "I": ("....", "####", "....", "...."),
    "O": (".##.", ".##.", "....", "...."),
    "T": ("....", ".###", "..#.", "...."),
    "L": ("....", "###.", "..#.", "...."),
    "J": ("....", "###.", "#...", "...."),
    "S": ("....", "..##", ".##.", "...."),
    "Z": ("....", ".##.", "..##", "...."),
}


TETROMINOES: Dict[str, RotationCycle] = {
    name: _build_cycle(pattern) for name, pattern in BASE_SHAPES.items()
}


def iterate_cells(state: RotationState, origin: Coordinate):
    """Yield absolute board coordinates for a rotation state at an origin."""

    base_x, base_y = origin
    for dx, dy in state.coordinates:
        yield base_x + dx, base_y + dy
