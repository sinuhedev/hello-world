#include <stdio.h>

int main() {
  char name[50];

  printf("Enter an integer: ");
  scanf("%49s", name);

  printf("Hello world! %s \n", name);
  return 0;
}