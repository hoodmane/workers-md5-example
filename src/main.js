import wasmBinary from "../wasm/md5sum.wasm";
import createEmscriptenModule from "../wasm/md5sum.mjs";

// Emscripten normally tries to load the wasm binary data and compile the wasm
// module itself. Workerd disables dynamic codegen so it can't do this. It
// exposes an `instantiateWasm` hook to customize the way it sets everything up,
// so we use this to tell it how to start.
const emscriptenSettings = {
  instantiateWasm(wasmImports, successCallback) {
    (async function () {
      // Instantiate pyodideWasmModule with wasmImports
      const instance = await WebAssembly.instantiate(wasmBinary, wasmImports);
      successCallback(instance, wasmBinary);
    })();

    return {};
  },
};

async function createMd5SumModule() {
  const orig_import_meta_url = import.meta.url;

  // We made Emscripten into an ES6 module so it expects `import.meta.url` to be
  // a valid url. The value doesn't matter at all, but workerd leaves it
  // undefined which causes a crash.
  import.meta.url = "http://something.madeup";
  // We told Emscripten that we're a web environment, but it's going to check.
  // We want it to think we're in the browser main thread, so add a global
  // called `window` to make it think this.
  globalThis.window = {};
  const promise = createEmscriptenModule(emscriptenSettings);

  // Now restore global state
  globalThis.window = undefined;
  import.meta.url = orig_import_meta_url;
  return await promise;
}

function bufferToHexString(buffer) {
  return Array.from(buffer, (c) => c.toString(16).padStart(2, "0")).join("");
}

function computeMd5Sum(md5SumModule, buffer) {
  const fileName = `myfile.txt`;
  // Write argument into a file. `canOwn: true` avoids copying the data.
  // Using a file allows us to handle arbitrarily large input with a fixed size
  // wasm memory.
  md5SumModule.FS.writeFile(fileName, new Uint8Array(buffer), { canOwn: true });

  // Convert file name from a JS string into a C string
  const fileNameCstr = md5SumModule.stringToNewUTF8(fileName);
  // Allocate space for the result and make a JS view of those 16 bytes
  const outPtr = md5SumModule._malloc(16);
  const outBuf = md5SumModule.HEAPU8.subarray(outPtr, outPtr + 16);

  // Do the actual work
  md5SumModule._md5sum_file(fileNameCstr, outPtr);
  // Turn the result into a JS hex string
  const result = bufferToHexString(outBuf);
  // Clean up
  md5SumModule._free(outPtr);
  md5SumModule._free(outBuf);
  md5SumModule.FS.unlink(fileName);
  return result;
}

let globalMd5SumModule;
export default {
  async fetch(request) {
    if (!globalMd5SumModule) {
      // Instantiate the module lazily on the first request.
      // It will be shared across requests.
      globalMd5SumModule = await createMd5SumModule();
    }
    const requestBodyBuffer = await request.arrayBuffer();
    const md5Sum = computeMd5Sum(globalMd5SumModule, requestBodyBuffer);
    return new Response(md5Sum + "\n");
  },
};
