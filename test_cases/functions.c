#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

int main(void) {
    int result = add(5, 7);
    printf("Result is %d\n", result);
    return 0;
} 