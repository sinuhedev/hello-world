APP_NAME := app

.SILENT:
.PHONY: all clean

all:
	mkdir -p out
	gcc -O2 -Wall -Wextra -o out/$(APP_NAME) main.c `pkg-config --cflags --libs gtk4 webkitgtk-6.0`

run:
	./out/app

clean:
	rm -fr out

