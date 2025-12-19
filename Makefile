VERSION=$(shell grep \"version\" manifest.json  | cut -d\" -f 4)
PACKAGE=open-links-in-tabs-$(VERSION)

all: clean zip tar pack

zip tar:
	rm -vf /tmp/$(PACKAGE).$(@)
	git archive \
		--format=$(@) \
		--prefix="$(PACKAGE)/" \
		HEAD > /tmp/$(PACKAGE).$(@)

pack: tar
	tar -xf /tmp/$(PACKAGE).tar -C /tmp
	/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
		--pack-extension=/tmp/$(PACKAGE) \
		--pack-extension-key=$(PEM_FILE)

clean:
	rm -rvf /tmp/$(PACKAGE) \
		/tmp/$(PACKAGE).tar \
		/tmp/$(PACKAGE).zip \
		/tmp/$(PACKAGE).crx

.PHONY: all zip tar pack clean
