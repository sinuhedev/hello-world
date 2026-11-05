.SILENT:

# ARGS
ifeq (run,$(firstword $(MAKECMDGOALS)))
  ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  ifneq ($(strip $(ARGS)),)
    $(eval $(ARGS):;@:)
  endif
endif

.PHONY: build run clean

dev:
	go run cmd/http/main.go

_dev_path:
	go run cmd/http/main.go ~/Downloads

build:
	go build -ldflags="-s -w" -o out/http cmd/http/main.go

run:
	./out/http $(ARGS)

clean:
	rm -rf out/