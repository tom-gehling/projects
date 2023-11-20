#include <iostream>
#include <ncurses.h>
#include "Upgrades.hpp"

using namespace std;

int main(){
    Upgrades test1(1,1);
    if (test1.getx() != 1){
        cout << "Test1 Failed"<< endl;
    }

    Upgrades test2(1,1);
    if (test2.gety() != 1){
        cout << "Test2 Failed"<< endl;
    }

    Upgrades test3(1,1);
    if (test3.getCh() != '+'){
        cout << "Test3 Failed"<< endl;
    }

    return 0;
}