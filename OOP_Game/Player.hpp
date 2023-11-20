/* COMP SCI 1102 - Object Oriented Programming - Space Invaders Project */
// By Thomas Gehling, Gun (Chris) Park, Patrick Williams
// This is the class definition of the Player class. This class defines the player's ship in the game.

#ifndef PLAYER_HPP
#define PLAYER_HPP
#include <ncurses.h>
#include "Draw.hpp"
#include "Display.hpp"
#include "Laser.hpp"
using namespace std;


class Player: public Ship {
    public:
    int health;
    bool fired;

    Player() { // default constructor
        this->y = 0;
        this->x = 0;
        this->ch = '0';
        Draw(0,0,'0');
        health = 100;
        bool fired = false;
    }

    Player(int y, int x, char ch) {
        this->y = y;
        this->x = x;
        this->ch = ch;
        Draw(y,x,ch);
        health = 100;
        bool fired = false;
    }

    void updateHealth(int incrementHealth){
        health += incrementHealth;
    }

    int getHealth(){
        return health;
    }

    // [POLYMORPHISM]  redefined fire() function from base class, Ship, defined at run time
    bool fire() { // fires a laser projectile
        fired = true;
        return fired;
    }

};
#endif