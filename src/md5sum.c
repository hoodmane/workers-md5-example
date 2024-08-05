/*
 * Copyright (c) 2014 Jeff Boody
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

#include <stdlib.h>
#include <stdio.h>
#include "libmd5/md5.h"

int
md5sum_file(char* file_name, unsigned char* output) {
	FILE* f = fopen(file_name, "r");
	if(f == NULL)
	{
		printf("fopen %s failed\n", file_name);
		return -1;
	}
	// initialize the md5 sum
	struct MD5Context ctx;
	MD5Init(&ctx);

	// compute the md5 sum
	unsigned char buf[4096];
	unsigned int  len = fread(buf, sizeof(unsigned char), 4096, f);
	while(len > 0)
	{
		MD5Update(&ctx, buf, len);
		len = fread(buf, sizeof(unsigned char), 4096, f);
	}

	// check for errors
	int errno = ferror(f);
	if(errno)
	{
		printf("fread failed errno=%i\n", errno);
		fclose(f);
		return -1;
	}
	fclose(f);

	// compute final md5 sum
	unsigned char d[16] = { 0, 0, 0, 0, 0, 0, 0, 0,
	                        0, 0, 0, 0, 0, 0, 0, 0 };
	MD5Final(output, &ctx);
  return 0;
}

#include "emscripten.h"
int
main() {
  emscripten_exit_with_live_runtime();
}
