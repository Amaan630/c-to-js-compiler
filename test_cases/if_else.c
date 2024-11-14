#include <stdio.h>

int main(void) {
    int number = 5;

    if (number > 0) {
        printf("Number is positive\n");
    } else if (number < 0) {
        printf("Number is negative\n");
    } else {
        printf("Number is zero\n");
    }

    return 0;
} 