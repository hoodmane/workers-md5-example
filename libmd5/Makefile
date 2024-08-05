TARGET   = libmd5.a
CLASS    = md5
SOURCE   = $(CLASS:%=%.c)
OBJECTS  = $(SOURCE:.c=.o)
HFILES   = $(CLASS:%=%.h)
OPT      = -O2 -Wall
CFLAGS   = $(OPT) -I../
LDFLAGS  = -lm -L/usr/lib
AR       = emar
CCC      = emcc

all: $(TARGET)

$(TARGET): $(OBJECTS)
	$(AR) rcs $@ $(OBJECTS)

clean:
	rm -f $(OBJECTS) *~ \#*\# $(TARGET)

%.o: %.c $(HFILES)
	$(CCC) $(OPT) -o $@ -c $< $(CFLAGS)
