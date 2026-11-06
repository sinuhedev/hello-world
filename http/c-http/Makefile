.SILENT:
.PHONY: build run clean

# ARGS
ifeq (run,$(firstword $(MAKECMDGOALS)))
  ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  ifneq ($(strip $(ARGS)),)
    $(eval $(ARGS):;@:)
  endif
endif

APP_NAME := http

build:
	mkdir -p out
	gcc -std=c23 -O2 -Wall -Wextra -o out/$(APP_NAME) src/main.c

run:
	./out/$(APP_NAME) $(ARGS)

clean:
	rm -fr out

# test

_version:
	./out/$(APP_NAME) --version
