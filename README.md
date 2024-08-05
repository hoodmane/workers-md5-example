# Emscripten md5 cloudflare worker example

This example makes a cloudflare worker that accepts POST requests, md5 sums the
body, and returns the result as a hex string. When running it,
```sh
curl http://localhost:8787/ -d 'some_data'
```
returns the same md5 sum as:
```sh
printf 'some_data' | md5sum -
```

## To build

1. Install Emscripten (I used 3.1.58 but any reasonably recent one should work)
   and ensure that emcc is on the path. E.g.,
   ```sh
   git clone https://github.com/emscripten-core/emsdk.git

   ./emsdk/emsdk install 3.1.58
   ./emsdk/emsdk activate 3.1.58
   source ./emsdk/emsdk_env.sh
   ```

2. Run `make`.


## To test

First build and then run `npx wrangler dev src/main.js`.
