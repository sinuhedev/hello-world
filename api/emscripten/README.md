# emscripten

```sh
# target
mkdir -p target

# build
docker run --rm -v $(pwd):/src emscripten/emsdk:5.0.2 emcc src/helloworld.cpp -o target/helloworld.js

# build:web
docker run --rm -v $(pwd):/src emscripten/emsdk:5.0.2 emcc src/helloworld.cpp -o target/index.html

# run 
node target/helloworld.js

# web
docker run --rm -v $(pwd):/src -p 3000:3000 emscripten/emsdk:5.0.2 emrun --port 3000 --no_browser --hostname 0.0.0.0 target

```