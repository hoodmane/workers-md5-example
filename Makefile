CC=emcc
CFLAGS=-I. -O2
EMSCRIPTEN_SETTINGS= \
	 -sWASM_BIGINT -sEXPORT_ES6 \
  -sENVIRONMENT=web
EMSCRIPTEN_EXPORTS=\
  -sEXPORTED_RUNTIME_METHODS=stringToNewUTF8,FS  \
  -sEXPORTED_FUNCTIONS=_main,_md5sum_file,_malloc,_free \

LDFLAGS=-L libmd5/ $(EMSCRIPTEN_SETTINGS) $(EMSCRIPTEN_EXPORTS)

all: wasm/md5sum.mjs


libmd5/libmd5.a:
	make -C libmd5


wasm/md5sum.o: src/md5sum.c
	mkdir -p wasm
	$(CC) $(CFLAGS) -c $< -o $@

wasm/md5sum.mjs: wasm/md5sum.o libmd5/libmd5.a
	$(CC) $(LDFLAGS) -lmd5 $< -o $@


.PHONY: clean
clean:
	rm -rf wasm
	make -C libmd5 clean
