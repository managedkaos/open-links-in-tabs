VERSION=$(shell grep \"version\" manifest.json  | cut -d\" -f 4)
PACKAGE=open-links-in-tabs-$(VERSION)

zip: clean
	zip --recurse-paths $(PACKAGE).zip . \
		--exclude './open-links-in-tabs.pem' \
		--exclude '*.git*' \
		--exclude '*~*'

tar: clean
	git archive \
		--format=tar \
		--prefix="$(PACKAGE)/" \
		HEAD > /tmp/$(PACKAGE).tar

pack: tar
	tar -xf /tmp/$(PACKAGE).tar -C /tmp
	/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
		--pack-extension=/tmp/$(PACKAGE) \
		--pack-extension-key=$(PEM_FILE)

clean:
	rm -rvf /tmp/$(PACKAGE)
	rm -vf \
		open-links-in-tabs-$(VERSION).zip \
		/tmp/$(PACKAGE).tar \
		/tmp/$(PACKAGE).crx

