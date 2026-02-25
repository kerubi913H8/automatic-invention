"""Terminal interface for the nostalgic Tetris game."""

from __future__ import annotations

import curses
import time
from typing import Dict

from .game import BOARD_HEIGHT, BOARD_WIDTH, TetrisGame

CELL_WIDTH = 2
PLAYFIELD_OFFSET_X = 4
PLAYFIELD_OFFSET_Y = 2

COLOR_MAP: Dict[str, int] = {
    "I": curses.COLOR_CYAN,
    "O": curses.COLOR_YELLOW,
    "T": curses.COLOR_MAGENTA,
    "S": curses.COLOR_GREEN,
    "Z": curses.COLOR_RED,
    "J": curses.COLOR_BLUE,
    "L": curses.COLOR_WHITE,
}


def _init_colors() -> Dict[str, int]:
    curses.start_color()
    curses.use_default_colors()
    pairs: Dict[str, int] = {}
    for index, (name, color) in enumerate(COLOR_MAP.items(), start=1):
        curses.init_pair(index, color, -1)
        pairs[name] = index
    curses.init_pair(len(COLOR_MAP) + 1, curses.COLOR_WHITE, -1)
    return pairs


def _draw_border(stdscr: "curses._CursesWindow") -> None:
    height = BOARD_HEIGHT + PLAYFIELD_OFFSET_Y * 2
    width = BOARD_WIDTH * CELL_WIDTH + PLAYFIELD_OFFSET_X * 2
    try:
        for x in range(width + 1):
            stdscr.addch(PLAYFIELD_OFFSET_Y - 1, x, curses.ACS_HLINE)
            stdscr.addch(PLAYFIELD_OFFSET_Y + BOARD_HEIGHT, x, curses.ACS_HLINE)
        for y in range(BOARD_HEIGHT + 1):
            stdscr.addch(PLAYFIELD_OFFSET_Y + y, PLAYFIELD_OFFSET_X - 2, curses.ACS_VLINE)
            stdscr.addch(
                PLAYFIELD_OFFSET_Y + y,
                PLAYFIELD_OFFSET_X + BOARD_WIDTH * CELL_WIDTH,
                curses.ACS_VLINE,
            )
        stdscr.addch(PLAYFIELD_OFFSET_Y - 1, PLAYFIELD_OFFSET_X - 2, curses.ACS_ULCORNER)
        stdscr.addch(
            PLAYFIELD_OFFSET_Y - 1,
            PLAYFIELD_OFFSET_X + BOARD_WIDTH * CELL_WIDTH,
            curses.ACS_URCORNER,
        )
        stdscr.addch(PLAYFIELD_OFFSET_Y + BOARD_HEIGHT, PLAYFIELD_OFFSET_X - 2, curses.ACS_LLCORNER)
        stdscr.addch(
            PLAYFIELD_OFFSET_Y + BOARD_HEIGHT,
            PLAYFIELD_OFFSET_X + BOARD_WIDTH * CELL_WIDTH,
            curses.ACS_LRCORNER,
        )
    except curses.error:
        pass


def _draw_cell(
    stdscr: "curses._CursesWindow",
    colors: Dict[str, int],
    x: int,
    y: int,
    name: str,
    attr: int = 0,
    char: str = "  ",
) -> None:
    screen_x = PLAYFIELD_OFFSET_X + x * CELL_WIDTH
    screen_y = PLAYFIELD_OFFSET_Y + y
    color_pair = colors.get(name, len(COLOR_MAP) + 1)
    try:
        stdscr.addstr(screen_y, screen_x, char, curses.color_pair(color_pair) | attr)
    except curses.error:
        pass


def _render(stdscr: "curses._CursesWindow", game: TetrisGame, colors: Dict[str, int]) -> None:
    stdscr.erase()
    _draw_border(stdscr)

    board = game.board
    for y, row in enumerate(board.rows()):
        for x, cell in enumerate(row):
            if cell:
                _draw_cell(stdscr, colors, x, y, cell, char="[]")

    if not game.state.game_over:
        ghost = game.ghost_piece()
        for x, y in ghost.cells():
            if 0 <= y < BOARD_HEIGHT:
                _draw_cell(stdscr, colors, x, y, ghost.name, attr=curses.A_DIM, char="..")

        for x, y in game.state.current.cells():
            if 0 <= y < BOARD_HEIGHT:
                _draw_cell(stdscr, colors, x, y, game.state.current.name, char="[]")

    info_x = PLAYFIELD_OFFSET_X + BOARD_WIDTH * CELL_WIDTH + 4
    stdscr.addstr(2, info_x, "SCORE")
    stdscr.addstr(3, info_x, f"{game.state.score:7d}")
    stdscr.addstr(5, info_x, "LEVEL")
    stdscr.addstr(6, info_x, f"{game.state.level:7d}")
    stdscr.addstr(8, info_x, "LINES")
    stdscr.addstr(9, info_x, f"{game.state.lines_cleared:7d}")

    stdscr.addstr(11, info_x, "NEXT")
    next_piece = game.state.next_piece
    for rel_y in range(4):
        row = ""
        coords = set(next_piece.current_state().coordinates)
        for rel_x in range(4):
            row += "[]" if (rel_x, rel_y) in coords else "  "
        stdscr.addstr(12 + rel_y, info_x, row)

    stdscr.addstr(18, info_x, "Controls:")
    stdscr.addstr(19, info_x, "← →: Move")
    stdscr.addstr(20, info_x, "↑ / z/x: Rotate")
    stdscr.addstr(21, info_x, "↓: Soft drop")
    stdscr.addstr(22, info_x, "Space: Hard drop")
    stdscr.addstr(23, info_x, "q: Quit")

    if game.state.game_over:
        msg = " GAME OVER - Press r to restart or q to exit "
        mid_x = PLAYFIELD_OFFSET_X + BOARD_WIDTH * CELL_WIDTH // 2 - len(msg) // 2
        mid_y = PLAYFIELD_OFFSET_Y + BOARD_HEIGHT // 2
        stdscr.addstr(mid_y, max(mid_x, 1), msg, curses.A_REVERSE)

    stdscr.refresh()


def run(stdscr: "curses._CursesWindow") -> None:
    try:
        curses.curs_set(False)
    except curses.error:
        pass
    stdscr.nodelay(True)
    stdscr.timeout(0)
    colors = _init_colors()
    game = TetrisGame()
    last_drop = time.monotonic()

    while True:
        action, moved_down = _handle_input(stdscr, game)
        if action == "quit":
            break
        if action == "restart":
            game = TetrisGame()
            last_drop = time.monotonic()
            continue
        if moved_down:
            last_drop = time.monotonic()

        now = time.monotonic()
        if now - last_drop >= game.drop_interval:
            game.tick()
            last_drop = now

        _render(stdscr, game, colors)
        time.sleep(0.02)


def _handle_input(stdscr: "curses._CursesWindow", game: TetrisGame) -> tuple[str | None, bool]:
    action: str | None = None
    moved_down = False

    while True:
        ch = stdscr.getch()
        if ch == -1:
            break
        if ch in (ord("q"), ord("Q")):
            action = "quit"
        elif ch in (curses.KEY_LEFT, ord("h")):
            game.try_move(-1, 0)
        elif ch in (curses.KEY_RIGHT, ord("l")):
            game.try_move(1, 0)
        elif ch in (curses.KEY_DOWN, ord("j")):
            if game.try_move(0, 1):
                moved_down = True
        elif ch in (curses.KEY_UP, ord("k"), ord("x")):
            game.try_rotate(1)
        elif ch in (ord("z"), ord("Z")):
            game.try_rotate(-1)
        elif ch == ord(" "):
            game.hard_drop()
            moved_down = True
        elif ch in (ord("r"), ord("R")) and game.state.game_over:
            action = "restart"
        elif ch == ord("p"):
            _pause(stdscr)
    return action, moved_down


def _pause(stdscr: "curses._CursesWindow") -> None:
    stdscr.nodelay(False)
    stdscr.addstr(0, 2, "Paused - press any key to resume", curses.A_REVERSE)
    stdscr.refresh()
    stdscr.getch()
    stdscr.nodelay(True)


def main() -> None:
    curses.wrapper(run)


if __name__ == "__main__":
    main()
