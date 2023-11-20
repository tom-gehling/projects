/* COMP SCI 1102 - Object Oriented Programming - Space Invaders Project */
// By Thomas Gehling, Gun (Chris) Park, Patrick Williams
// This is the class definition of the Display class. This class builds the game 'window' using NCurses.

#ifndef DISPLAY_HPP
#define DISPLAY_HPP
#include <ncurses.h>
#include "Draw.hpp"

using namespace std;

class Display {
    public:
    WINDOW * display_win;
    int height, width, start_row, start_col;

    
    // default constructor for
    Display(){
        height = 0;
        width = 0;
        start_row = 0;
        start_col = 0;
    }

    Display(int height, int width) { // specific window-size constructor
        initscr(); // initialise screen
        this->height = height; // save specified window-size
        this->width = width;
        start_row = 0;
        start_col = 0;
    }

    void create() { // creates window
        display_win = newwin(height, width, start_row, start_col);

        noecho();
        curs_set(0);

        wtimeout(display_win, 200);
        keypad(display_win, true);
        noecho(); // typed input not echoed by getch

        addBorder(); // build box frame around window
        wrefresh(display_win);
    }

    void draw(Draw draw) { // draws a symbol
        addAt(draw.getx(), draw.gety(), draw.getCh());
    }

    void addBorder(){ // adds box frame around window
        box(display_win,0,0);
    }

    void addAt(int y, int x, char ch) { // adds character at a specified coordinate (y,x)
        mvwaddch(display_win, y, x, ch);
    }

    void addText(int y, int x, char* str) {
        mvwprintw(display_win, y, x, str);
    }

    chtype getInput(){
        return wgetch(display_win);
    }

    void clear() { // clears content of window
        wclear(display_win);
        addBorder(); // rebuilds box
    }

    void refresh() { // refresh window to get updates
        wrefresh(display_win);
    }

    void delete_window(){
        endwin();
        delwin(display_win);
    }

    void highlight_on() { // highlights all characters on window
        wattron(display_win, A_REVERSE);
    }

    void highlight_off() { // returns all highlighted characters to normal on window
        wattroff(display_win, A_REVERSE);
    }

    int get_height() { // returns height of window
        return height;
    }

    int get_width() { // returns width of window
        return width;
    }

    chtype getCharAt(int y, int x) { // get character at specified coordinates
        return mvwinch(display_win, y, x);
    }

    void setTimeout(int timeout) { // set timeout for window (stops refresh); negative timeout means it never refreshes
        wtimeout(display_win, timeout);
    }

    int getStartRow() { // get starting row of window
        return start_row;
    }

     int getStartCol() { // get starting column of window
        return start_col;
    }
    

};

#endif