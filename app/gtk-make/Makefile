CFLAGS=`pkg-config --cflags gtk4`
LIBS=`pkg-config --libs gtk4`

all:
	mkdir -p out
	gcc $(CFLAGS) $(LIBS) src/main.c -o out/app

run:
	out/app

clean:
	rm -r out
	
