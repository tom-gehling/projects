/* COMP SCI 1102 - Object Oriented Programming - Space Invaders Project */
// By Thomas Gehling, Gun (Chris) Park, Patrick Williams
// This is the class definition of the Upgrades class. This is the base class that defines behaviours of player and enemy Upgradess.

#ifndef Upgrades_HPP
#define Upgrades_HPP
#include <ncurses.h>
#include <stdlib.h>
#include "Draw.hpp"
#include "Display.hpp"
#include "Player.hpp"
using namespace std;

class Upgrades: public Draw{
    public:

    Upgrades(){
        this->y = -1;
        this->x = -1;
        this->ch = '+';
    }

    Upgrades(int y, int x){
        this->y = y;
        this->x = x;
        this->ch = '+';
    }

    void health_boost (Player player){
        player.updateHealth(10);
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
    
};
#endif