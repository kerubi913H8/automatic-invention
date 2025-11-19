"""Core game logic for a curses-based Tetris implementation."""

from __future__ import annotations

import random
from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional

from .shapes import RotationCycle, TETROMINOES, iterate_cells

BOARD_WIDTH = 10
BOARD_HEIGHT = 20
VISIBLE_ROWS = 20


@dataclass
class Tetromino:
    """A falling Tetris piece."""

    name: str
    rotations: RotationCycle
    rotation_index: int
    x: int
    y: int

    def current_state(self):
        return self.rotations[self.rotation_index]

    def rotated(self, delta: int) -> "Tetromino":
        return Tetromino(
            name=self.name,
            rotations=self.rotations,
            rotation_index=(self.rotation_index + delta) % 4,
            x=self.x,
            y=self.y,
        )

    def moved(self, dx: int, dy: int) -> "Tetromino":
        return Tetromino(
            name=self.name,
            rotations=self.rotations,
            rotation_index=self.rotation_index,
            x=self.x + dx,
            y=self.y + dy,
        )

    def cells(self):
        return iterate_cells(self.current_state(), (self.x, self.y))


class Board:
    """Represents the Tetris playfield."""

    def __init__(self, width: int = BOARD_WIDTH, height: int = BOARD_HEIGHT):
        self.width = width
        self.height = height
        self.grid: List[List[Optional[str]]] = [
            [None for _ in range(width)] for _ in range(height)
        ]

    def inside(self, x: int, y: int) -> bool:
        return 0 <= x < self.width and y < self.height

    def is_empty(self, x: int, y: int) -> bool:
        if y < 0:
            return True
        return self.inside(x, y) and self.grid[y][x] is None

    def can_place(self, piece: Tetromino) -> bool:
        return all(self.is_empty(x, y) for x, y in piece.cells())

    def lock_piece(self, piece: Tetromino) -> None:
        for x, y in piece.cells():
            if 0 <= y < self.height:
                self.grid[y][x] = piece.name

    def clear_complete_lines(self) -> int:
        remaining = [row for row in self.grid if any(cell is None for cell in row)]
        cleared = self.height - len(remaining)
        while len(remaining) < self.height:
            remaining.insert(0, [None for _ in range(self.width)])
        self.grid = remaining
        return cleared

    def rows(self) -> Iterable[List[Optional[str]]]:
        for row in self.grid[-VISIBLE_ROWS:]:
            yield row


class PieceBag:
    """Seven-bag randomizer for tetromino selection."""

    def __init__(self):
        self._bag: List[str] = []

    def _refill(self) -> None:
        self._bag = list(TETROMINOES.keys())
        random.shuffle(self._bag)

    def next_piece(self) -> Tetromino:
        if not self._bag:
            self._refill()
        name = self._bag.pop()
        rotations = TETROMINOES[name]
        piece = Tetromino(name=name, rotations=rotations, rotation_index=0, x=3, y=-2)
        return piece


@dataclass
class GameState:
    board: Board
    current: Tetromino
    next_piece: Tetromino
    score: int = 0
    level: int = 1
    lines_cleared: int = 0
    game_over: bool = False


LEVEL_SPEED: Dict[int, float] = {
    1: 0.8,
    2: 0.72,
    3: 0.63,
    4: 0.55,
    5: 0.47,
    6: 0.38,
    7: 0.3,
    8: 0.22,
    9: 0.13,
    10: 0.1,
}


def calculate_level(lines: int) -> int:
    return min(10, lines // 10 + 1)


def score_for_lines(lines: int, level: int) -> int:
    scores = {0: 0, 1: 40, 2: 100, 3: 300, 4: 1200}
    return scores.get(lines, 0) * level


class TetrisGame:
    """Encapsulates gameplay operations independent of rendering."""

    def __init__(self):
        self.board = Board()
        self.bag = PieceBag()
        current = self.bag.next_piece()
        if not self.board.can_place(current):
            raise RuntimeError("Unable to spawn initial piece")
        self.state = GameState(
            board=self.board,
            current=current,
            next_piece=self.bag.next_piece(),
        )

    @property
    def drop_interval(self) -> float:
        return LEVEL_SPEED.get(self.state.level, 0.1)

    def try_move(self, dx: int, dy: int) -> bool:
        moved = self.state.current.moved(dx, dy)
        if self.board.can_place(moved):
            self.state.current = moved
            return True
        return False

    def try_rotate(self, delta: int) -> bool:
        rotated = self.state.current.rotated(delta)
        for kick_x in (0, -1, 1, -2, 2):
            candidate = rotated.moved(kick_x, 0)
            if self.board.can_place(candidate):
                self.state.current = candidate
                return True
        return False

    def hard_drop(self) -> int:
        distance = 0
        while self.try_move(0, 1):
            distance += 1
        self.lock_piece()
        self.state.score += distance * 2
        return distance

    def tick(self) -> bool:
        if self.state.game_over:
            return False
        if not self.try_move(0, 1):
            self.lock_piece()
        return not self.state.game_over

    def lock_piece(self) -> None:
        self.board.lock_piece(self.state.current)
        cleared = self.board.clear_complete_lines()
        self.state.lines_cleared += cleared
        self.state.score += score_for_lines(cleared, self.state.level)
        self.state.level = calculate_level(self.state.lines_cleared)
        self.spawn_next_piece()

    def spawn_next_piece(self) -> None:
        next_piece = self.state.next_piece
        next_piece.x, next_piece.y = 3, -2
        if not self.board.can_place(next_piece):
            self.state.game_over = True
            return
        self.state.current = next_piece
        self.state.next_piece = self.bag.next_piece()

    def ghost_piece(self) -> Tetromino:
        ghost = self.state.current
        while True:
            candidate = ghost.moved(0, 1)
            if self.board.can_place(candidate):
                ghost = candidate
            else:
                break
        return ghost
