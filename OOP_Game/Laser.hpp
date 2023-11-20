/* COMP SCI 1102 - Object Oriented Programming - Space Invaders Project */
// By Thomas Gehling, Gun (Chris) Park, Patrick Williams
// This is the class definition of the Laser class. This class defines the laser projectile '-' that users and enemy ships can shoot.

#ifndef LASER_HPP
#define LASER_HPP
#include <ncurses.h>
#include "Draw.hpp"
#include "Display.hpp"
#include "Ship.hpp"
using namespace std;


class Laser: public Draw{
    public:
    bool fired;
    int laserVelocity;

    Laser() {
        Draw(0,0,'0');
        fired = false;
        this->laserVelocity = 1;
    }

    Laser(int y, int x, char ch) {
        this->y = y;
        this->x = x;
        this->ch = ch;
        Draw(y,x,ch);
        fired = false;
        this->laserVelocity = 1;
    }

    /* Moves projectile coordinate right */
    void moveRight(int move){
        y += move;
    }

    /* Moves projectile coordinate left */
    void moveLeft(int move){
        y -= move;
    }

    int get_laserVelocity(){
        return laserVelocity;
    }

    void set_laserVelocity(int velocity){
        this->laserVelocity = velocity;
    }

    bool isFired(){
        return fired;
    }
};
#endif