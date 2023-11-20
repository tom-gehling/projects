/* COMP SCI 1102 - Object Oriented Programming - Space Invaders Project */
// By Thomas Gehling, Gun (Chris) Park, Patrick Williams
// This is the class definition of the Scoreboard class. This class handles the scoreboard functionality and appearance.

#ifndef SCOREBOARD_HPP
#define SCOREBOARD_HPP
#include <ncurses.h>
#include "Draw.hpp"

using namespace std;

class Scoreboard {
    private:
        WINDOW * score_win;
    public:

    Scoreboard(){
    }
    
    Scoreboard(int width, int y, int x){
        score_win = newwin(3, width, y, x);
    }

    void initialise(int level, int initial_score, int initial_health){
        clear();
        mvwprintw(score_win, 0, 0, "Level: ");
        mvwprintw(score_win, 1, 0, "Score: ");
        mvwprintw(score_win, 2, 0, "Health: ");
        updateScoreboard(level, initial_score, initial_health);
        refresh();

    }

    void updateScoreboard(int level, int score, int health){
        mvwprintw(score_win, 0, 30, "%9llu", level);
        mvwprintw(score_win, 1, 30, "%9llu", score);
        mvwprintw(score_win, 2, 30, "%9llu", health);
    }

    void clear(){ // clears mini score window
        wclear(score_win);
    }

    void refresh(){ // refresh & updates display of mini score window
        wrefresh(score_win);
    }

};

#endif