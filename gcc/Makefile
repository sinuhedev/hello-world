BIN := hello_world_gcc

CC = gcc
CFLAGS = -Wall -Wextra -std=c11 -Isrc

SRCS := $(shell find src -name '*.c')
OBJS := $(patsubst src/%.c, target/%.o, $(SRCS))

.PHONY: all clean run

all: target/$(BIN)

target/$(BIN): $(OBJS)
	$(CC) $(CFLAGS) -o $@ $^

target/%.o: src/%.c
	mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -rf target

run: all
	./target/$(BIN)
