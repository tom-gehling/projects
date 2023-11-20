/* COMP SCI 1102 - Object Oriented Programming - Space Invaders Project */
// By Thomas Gehling, Gun (Chris) Park, Patrick Williams
// This is the class definition of the Draw class. This class draws a character in the 'window' using NCurses.

#ifndef DRAW_HPP
#define DRAW_HPP
#include <ncurses.h>
using namespace std;

class Draw {
    public:
        int y, x;
        char ch;
    public:
        Draw(){
            y = x = 0;
            ch = ' ';
        }

        Draw(int y, int x, char ch) { // main constructor class
            this->y = y;
            this->x = x;
            this->ch = ch;
        }

        int getx() { // returns x coordinate of drawn character
            return x;
        }

        int gety() { // returns y coordinate of drawn character
            return y;
        }

        char getCh() { // returns drawn character
            return ch;
        }

        void setx(int x) { // set x coordinate for drawn character
            this->x = x;
        }

        void sety(int y) { // set y coordinate for drawn character
            this->y = y;
        }

        void setCh(char ch){ // set drawn character
            this->ch = ch;
        }

        void destroy(){
            y = -1;
            x = -1;
        }

};
#endif