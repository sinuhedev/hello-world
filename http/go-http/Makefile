.SILENT:

# ARGS
ifeq (run,$(firstword $(MAKECMDGOALS)))
  ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  ifneq ($(strip $(ARGS)),)
    $(eval $(ARGS):;@:)
  endif
endif

.PHONY: all build run clean

all:
	go run cmd/http/main.go

build:
	go build -ldflags="-s -w" -o out/http cmd/http/main.go

run:
	./out/http $(ARGS)

clean:
	rm -rf out/

#
# test
#

_path:
	go run cmd/http/main.go ~/Downloads