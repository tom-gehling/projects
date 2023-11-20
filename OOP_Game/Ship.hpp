/* COMP SCI 1102 - Object Oriented Programming - Space Invaders Project */
// By Thomas Gehling, Gun (Chris) Park, Patrick Williams
// This is the class definition of the Ship class. This is the base class that defines behaviours of player and enemy ships.

#ifndef SHIP_HPP
#define SHIP_HPP
#include <ncurses.h>
#include "Draw.hpp"
#include "Display.hpp"
#include "Laser.hpp"
using namespace std;


class Ship: public Draw{
    public:

    Ship(){
        this->y = 0;
        this->x = 0;
        this->ch = '0';
        Draw(0,0,'0');
    }

    Ship(int y, int x, char ch){
        this->y = y;
        this->x = x;
        this->ch = ch;
        Draw(y,x,ch);
    }

    /* Moving functions - alters ships defined current coordinates */

    void moveUp(int move){
        x -= move;
    }

    void moveDown(int move){
        x += move;
    }

    void moveRight(int move){
        y += move;
    }

    void moveLeft(int move){
        y -= move;
    }

    bool isHit(int target_y, int target_x){ 
        float d = abs(target_y-y); 
        if(d<1.5 && target_x == x){
            return true;
        }
        else{
            return false;
        }
    }


    // 
    virtual bool fire() = 0;
    
};
#endif