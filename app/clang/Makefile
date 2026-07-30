BIN := hello_world_clang

CC = clang
CFLAGS = -Wall -Wextra -std=c11 -Isrc

SRCS := $(shell find src -name '*.c')
OBJS := $(patsubst src/%.c, target/%.o, $(SRCS))

.PHONY: all clean run

all: CFLAGS := $(CFLAGS) -g
all: target/$(BIN)

release: CFLAGS := $(CFLAGS) -O2
release: clean target/$(BIN)

target/$(BIN): $(OBJS)
	$(CC) $(CFLAGS) -o $@ $^

target/%.o: src/%.c
	mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -c $< -o $@

run:
	./target/$(BIN)

clean:
	rm -rf target
